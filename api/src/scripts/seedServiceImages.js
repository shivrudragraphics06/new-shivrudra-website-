import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { pool } from "../db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../../..");
const sourceDir = path.join(rootDir, "src/assets/services");
const uploadDir = path.join(rootDir, "api/uploads/services");

const serviceImages = [
  ["Badge & Dome Printing.png", "badge-dome-printing"],
  ["Bag Printing.png", "bag-printing"],
  ["corporate gift.jpg", "corporate-gift"],
  ["designing.jpg", "designing"],
  ["Digital Printing.png", "digital-printing"],
  ["Engraving & Marking.png", "engraving-marking"],
  ["Flex Printing.png", "flex-printing"],
  ["Industrial Name Plates.png", "industrial-name-plates"],
  ["Keychains.png", "keychain"],
  ["Laser & CNC Cutting.png", "laser-cnc-cutting"],
  ["Offset Printing.png", "offset-printing"],
  ["Photo frame.jpg", "photo-frame"],
  ["Premium Signages.png", "premium-signages"],
  ["Rubber Stamps.png", "stamp"],
  ["Safety Signages.png", "safety-signages"],
  ["Screen Printing.png", "screen-printing"],
  ["Signage.png", "signage"],
  ["Trophies & Medals.png", "trophies-and-medals"],
  ["UV Printing.png", "uv-printing"],
  ["Vinyl Printing.png", "vinyl-printing"],
];

function destinationName(fileName) {
  return fileName
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+(?=\.)/g, "");
}

async function main() {
  await fs.mkdir(uploadDir, { recursive: true });

  for (const [fileName, slug] of serviceImages) {
    const targetName = destinationName(fileName);
    const sourcePath = path.join(sourceDir, fileName);
    const targetPath = path.join(uploadDir, targetName);
    const imageUrl = `/uploads/services/${targetName}`;

    await fs.copyFile(sourcePath, targetPath);
    await pool.execute("UPDATE services SET image_url = ? WHERE slug = ?", [imageUrl, slug]);
  }

  const [rows] = await pool.query(
    "SELECT name, slug, image_url FROM services WHERE image_url IS NOT NULL ORDER BY sort_order ASC, id ASC",
  );

  console.log(`Imported ${serviceImages.length} service images.`);
  console.log(JSON.stringify(rows, null, 2));
  await pool.end();
}

main().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
