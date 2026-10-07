import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { pool } from "../db.js";

const rootDir = fileURLToPath(new URL("../../../", import.meta.url));
const assetsDir = path.join(rootDir, "src/assets/client logos");
const mimeTypes = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" };
const normalize = (name) => name.trim().toLowerCase();

async function main() {
  const manifest = JSON.parse(await fs.readFile(path.join(rootDir, "src/data/client-logos.json"), "utf8"));
  const entries = await Promise.all(manifest.map(async (client) => {
    const mime = mimeTypes[path.extname(client.fileName).toLowerCase()];
    if (!mime || path.basename(client.fileName) !== client.fileName) throw new Error(`Invalid logo file: ${client.fileName}`);
    return { ...client, mime, data: await fs.readFile(path.join(assetsDir, client.fileName)) };
  }));
  const connection = await pool.getConnection();
  let inserted = 0;
  let updated = 0;
  try {
    await connection.beginTransaction();
    const [existing] = await connection.query("SELECT id, name, logo_filename FROM clients");
    for (const [index, client] of entries.entries()) {
      const names = new Set([client.name, ...(client.aliases || [])].map(normalize));
      const matches = existing.filter((row) => names.has(normalize(row.name)) || row.logo_filename === client.fileName);
      if (matches.length > 1) throw new Error(`Multiple existing clients match ${client.name}; review before importing.`);
      const values = [client.name, client.data, client.mime, client.fileName, index];
      if (matches.length) {
        await connection.execute(
          "UPDATE clients SET name = ?, logo_data = ?, logo_mime_type = ?, logo_filename = ?, display_order = ? WHERE id = ?",
          [...values, matches[0].id],
        );
        updated += 1;
      } else {
        await connection.execute(
          "INSERT INTO clients (name, logo_data, logo_mime_type, logo_filename, display_order, status) VALUES (?, ?, ?, ?, ?, 'ACTIVE')",
          values,
        );
        inserted += 1;
      }
    }
    const importedNames = new Set(entries.flatMap((client) => [client.name, ...(client.aliases || [])]).map(normalize));
    const importedFiles = new Set(entries.map((client) => client.fileName));
    const remaining = existing.filter((row) => !importedNames.has(normalize(row.name)) && !importedFiles.has(row.logo_filename));
    for (const [index, row] of remaining.entries()) {
      await connection.execute("UPDATE clients SET display_order = ? WHERE id = ?", [entries.length + index, row.id]);
    }
    await connection.commit();
    console.log(`Stored ${entries.length} logos in MySQL: ${updated} updated, ${inserted} added. Preserved ${remaining.length} other clients.`);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => pool.end());
