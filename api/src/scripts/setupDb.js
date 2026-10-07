import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.join(__dirname, "../../schema.sql");
const schema = await fs.readFile(schemaPath, "utf8");

const connection = await mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  multipleStatements: true,
});

await connection.query(schema);
await connection.changeUser({ database: process.env.MYSQL_DATABASE || "shivrudra_graphics" });

async function tableExists(tableName) {
  const [rows] = await connection.execute(
    `SELECT COUNT(*) AS count
     FROM information_schema.tables
     WHERE table_schema = DATABASE() AND table_name = ?`,
    [tableName],
  );
  return rows[0].count > 0;
}

async function columnExists(tableName, columnName) {
  const [rows] = await connection.execute(
    `SELECT COUNT(*) AS count
     FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
    [tableName, columnName],
  );
  return rows[0].count > 0;
}

async function addColumn(tableName, columnDefinition) {
  const columnName = columnDefinition.split(/\s+/)[0].replace(/`/g, "");
  if (await columnExists(tableName, columnName)) return;
  await connection.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnDefinition}`);
}

async function countRows(tableName) {
  const [[row]] = await connection.query(`SELECT COUNT(*) AS count FROM ${tableName}`);
  return row.count;
}

async function migrateLegacyTables() {
  if ((await tableExists("product_categories")) && (await tableExists("categories")) && (await countRows("categories")) === 0) {
    if ((await countRows("services")) === 0) {
      await connection.query(
        `INSERT INTO services (id, name, slug, status)
         VALUES (1, 'General', 'general', 'ACTIVE')
         ON DUPLICATE KEY UPDATE name = name`,
      );
    }
    const hasServiceId = await columnExists("product_categories", "service_id");
    await connection.query(
      `INSERT INTO categories (id, service_id, name, slug, description, image_url, display_order, status, created_at, updated_at)
       SELECT id, ${hasServiceId ? "COALESCE(service_id, 1)" : "1"}, name, slug, description, image_url, COALESCE(sort_order, 0),
              CASE WHEN COALESCE(is_active, 1) = 1 THEN 'ACTIVE' ELSE 'INACTIVE' END,
              created_at, updated_at
       FROM product_categories`,
    );
  }

  if ((await tableExists("gallery_images")) && (await tableExists("gallery")) && (await countRows("gallery")) === 0) {
    await connection.query(
      `INSERT INTO gallery (id, title, image_url, alt_text, display_order, status, created_at, updated_at)
       SELECT id, title, image_url, alt_text, COALESCE(sort_order, 0),
              CASE WHEN COALESCE(is_active, 1) = 1 THEN 'ACTIVE' ELSE 'INACTIVE' END,
              created_at, updated_at
       FROM gallery_images`,
    );
  }

  if ((await tableExists("site_settings")) && (await tableExists("settings")) && (await countRows("settings")) === 0) {
    await connection.query(
      `INSERT INTO settings (setting_key, setting_value, updated_at)
       SELECT setting_key, setting_value, updated_at
       FROM site_settings`,
    );
  }
}

async function syncCompatibilityValues() {
  await connection.query("UPDATE services SET display_order = COALESCE(display_order, sort_order, 0), status = CASE WHEN COALESCE(is_active, 1) = 1 THEN 'ACTIVE' ELSE 'INACTIVE' END");
  await connection.query("UPDATE categories SET display_order = COALESCE(display_order, sort_order, 0), status = CASE WHEN COALESCE(is_active, 1) = 1 THEN 'ACTIVE' ELSE 'INACTIVE' END");
  await connection.query("UPDATE products SET display_order = COALESCE(display_order, sort_order, 0), featured = COALESCE(featured, is_featured, 0), status = CASE WHEN COALESCE(is_active, 1) = 1 THEN 'ACTIVE' ELSE 'INACTIVE' END, seo_title = COALESCE(seo_title, meta_title), seo_description = COALESCE(seo_description, meta_description)");
  await connection.query("UPDATE product_images SET display_order = COALESCE(display_order, sort_order, 0)");
  await connection.query("UPDATE product_variants SET name = COALESCE(name, label), description = COALESCE(description, detail), display_order = COALESCE(display_order, sort_order, 0), status = CASE WHEN COALESCE(is_active, 1) = 1 THEN 'ACTIVE' ELSE 'INACTIVE' END");
  await connection.query("UPDATE gallery SET display_order = COALESCE(display_order, sort_order, 0), status = CASE WHEN COALESCE(is_active, 1) = 1 THEN 'ACTIVE' ELSE 'INACTIVE' END");
  await connection.query("UPDATE blogs SET publish_date = COALESCE(publish_date, published_at), status = CASE WHEN COALESCE(is_published, 0) = 1 THEN 'PUBLISHED' ELSE status END, seo_title = COALESCE(seo_title, meta_title), seo_description = COALESCE(seo_description, meta_description)");
  await connection.query("UPDATE industries SET display_order = COALESCE(display_order, sort_order, 0), status = CASE WHEN COALESCE(is_active, 1) = 1 THEN 'ACTIVE' ELSE 'INACTIVE' END");
  await connection.query("UPDATE clients SET display_order = COALESCE(display_order, sort_order, 0), status = CASE WHEN COALESCE(is_active, 1) = 1 THEN 'ACTIVE' ELSE 'INACTIVE' END");
  await connection.query("UPDATE testimonials SET testimonial = COALESCE(testimonial, message), display_order = COALESCE(display_order, sort_order, 0), status = CASE WHEN COALESCE(is_active, 1) = 1 THEN 'ACTIVE' ELSE 'INACTIVE' END");
}

async function addCompatibilityColumns() {
  await addColumn("admins", "status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE'");
  await addColumn("admins", "last_login_at DATETIME NULL");

  await addColumn("services", "image_data LONGBLOB");
  await addColumn("services", "image_mime_type VARCHAR(100)");
  await addColumn("services", "image_filename VARCHAR(255)");
  await addColumn("services", "icon_data LONGBLOB");
  await addColumn("services", "icon_mime_type VARCHAR(100)");
  await addColumn("services", "icon_filename VARCHAR(255)");
  await addColumn("services", "display_order INT DEFAULT 0");
  await addColumn("services", "status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE'");
  await addColumn("services", "seo_title VARCHAR(255)");
  await addColumn("services", "seo_description VARCHAR(500)");
  await addColumn("services", "image_url VARCHAR(500)");
  await addColumn("services", "sort_order INT DEFAULT 0");
  await addColumn("services", "is_active BOOLEAN DEFAULT TRUE");

  await addColumn("categories", "image_data LONGBLOB");
  await addColumn("categories", "image_mime_type VARCHAR(100)");
  await addColumn("categories", "image_filename VARCHAR(255)");
  await addColumn("categories", "display_order INT DEFAULT 0");
  await addColumn("categories", "status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE'");
  await addColumn("categories", "image_url VARCHAR(500)");
  await addColumn("categories", "sort_order INT DEFAULT 0");
  await addColumn("categories", "is_active BOOLEAN DEFAULT TRUE");

  await addColumn("products", "sku VARCHAR(100)");
  await addColumn("products", "main_image_data LONGBLOB");
  await addColumn("products", "main_image_mime_type VARCHAR(100)");
  await addColumn("products", "main_image_filename VARCHAR(255)");
  await addColumn("products", "featured BOOLEAN DEFAULT FALSE");
  await addColumn("products", "display_order INT DEFAULT 0");
  await addColumn("products", "status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE'");
  await addColumn("products", "seo_title VARCHAR(255)");
  await addColumn("products", "seo_description VARCHAR(500)");
  await addColumn("products", "main_image_url VARCHAR(500)");
  await addColumn("products", "meta_title VARCHAR(255)");
  await addColumn("products", "meta_description VARCHAR(500)");
  await addColumn("products", "sort_order INT DEFAULT 0");
  await addColumn("products", "is_featured BOOLEAN DEFAULT FALSE");
  await addColumn("products", "is_active BOOLEAN DEFAULT TRUE");

  await addColumn("product_images", "image_data LONGBLOB");
  await addColumn("product_images", "mime_type VARCHAR(100)");
  await addColumn("product_images", "original_filename VARCHAR(255)");
  await addColumn("product_images", "display_order INT DEFAULT 0");
  await addColumn("product_images", "image_url VARCHAR(500)");
  await addColumn("product_images", "sort_order INT DEFAULT 0");

  await addColumn("product_variants", "name VARCHAR(200)");
  await addColumn("product_variants", "label VARCHAR(160)");
  await addColumn("product_variants", "sku VARCHAR(100)");
  await addColumn("product_variants", "item_count INT UNSIGNED DEFAULT NULL");
  await addColumn("product_variants", "description TEXT");
  await addColumn("product_variants", "detail VARCHAR(500)");
  await addColumn("product_variants", "image_data LONGBLOB");
  await addColumn("product_variants", "image_mime_type VARCHAR(100)");
  await addColumn("product_variants", "image_filename VARCHAR(255)");
  await addColumn("product_variants", "display_order INT DEFAULT 0");
  await addColumn("product_variants", "status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE'");
  await addColumn("product_variants", "sort_order INT DEFAULT 0");
  await addColumn("product_variants", "is_active BOOLEAN DEFAULT TRUE");

  await addColumn("gallery", "image_data LONGBLOB");
  await addColumn("gallery", "image_mime_type VARCHAR(100)");
  await addColumn("gallery", "image_filename VARCHAR(255)");
  await addColumn("gallery", "image_url VARCHAR(500)");
  await addColumn("gallery", "display_order INT DEFAULT 0");
  await addColumn("gallery", "status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE'");
  await addColumn("gallery", "sort_order INT DEFAULT 0");
  await addColumn("gallery", "is_active BOOLEAN DEFAULT TRUE");

  await addColumn("blogs", "featured_image_data LONGBLOB");
  await addColumn("blogs", "featured_image_mime_type VARCHAR(100)");
  await addColumn("blogs", "featured_image_filename VARCHAR(255)");
  await addColumn("blogs", "featured_image_url VARCHAR(500)");
  await addColumn("blogs", "publish_date DATETIME");
  await addColumn("blogs", "status ENUM('DRAFT','PUBLISHED') NOT NULL DEFAULT 'DRAFT'");
  await addColumn("blogs", "seo_title VARCHAR(255)");
  await addColumn("blogs", "seo_description VARCHAR(500)");

  await addColumn("industries", "image_data LONGBLOB");
  await addColumn("industries", "image_mime_type VARCHAR(100)");
  await addColumn("industries", "image_filename VARCHAR(255)");
  await addColumn("industries", "short_description VARCHAR(500)");
  await addColumn("industries", "display_order INT DEFAULT 0");
  await addColumn("industries", "status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE'");
  await addColumn("industries", "icon_url VARCHAR(500)");
  await addColumn("industries", "image_url VARCHAR(500)");
  await addColumn("industries", "sort_order INT DEFAULT 0");
  await addColumn("industries", "is_active BOOLEAN DEFAULT TRUE");

  await addColumn("clients", "logo_data LONGBLOB");
  await addColumn("clients", "logo_mime_type VARCHAR(100)");
  await addColumn("clients", "logo_filename VARCHAR(255)");
  await addColumn("clients", "display_order INT DEFAULT 0");
  await addColumn("clients", "status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE'");
  await addColumn("clients", "logo_url VARCHAR(500)");
  await addColumn("clients", "sort_order INT DEFAULT 0");
  await addColumn("clients", "is_active BOOLEAN DEFAULT TRUE");

  await addColumn("testimonials", "company_name VARCHAR(200)");
  await addColumn("testimonials", "designation VARCHAR(150)");
  await addColumn("testimonials", "client_image_data LONGBLOB");
  await addColumn("testimonials", "client_image_mime_type VARCHAR(100)");
  await addColumn("testimonials", "client_image_filename VARCHAR(255)");
  await addColumn("testimonials", "testimonial TEXT");
  await addColumn("testimonials", "display_order INT DEFAULT 0");
  await addColumn("testimonials", "status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE'");
  await addColumn("testimonials", "image_url VARCHAR(500)");
  await addColumn("testimonials", "message TEXT");
  await addColumn("testimonials", "sort_order INT DEFAULT 0");
  await addColumn("testimonials", "is_active BOOLEAN DEFAULT TRUE");
}

await addCompatibilityColumns();
await migrateLegacyTables();
await syncCompatibilityValues();

await connection.end();

console.log(`Database schema applied safely from ${schemaPath}`);
