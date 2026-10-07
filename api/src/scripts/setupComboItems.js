import { pool } from "../db.js";

try {
  await pool.query(`CREATE TABLE IF NOT EXISTS product_variant_items (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    variant_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(200) NOT NULL,
    sku VARCHAR(100),
    description TEXT,
    image_data LONGBLOB,
    image_mime_type VARCHAR(100),
    image_filename VARCHAR(255),
    display_order INT NOT NULL DEFAULT 0,
    status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_variant_items_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
  )`);
  console.log("Combo item storage ready.");
} finally {
  await pool.end();
}
