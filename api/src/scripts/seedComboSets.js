import { pool } from "../db.js";

const items = [
  ["Pen + Keychain", 15],
  ["Cardholder + Pen + Keychain", 6],
  ["Dairy + Pen", 36],
  ["Pen + Dairy + Keychain", 14],
  ["Pen + Dairy + Keychain + Cardholder", 13],
  ["Pen + Dairy + Mug", 5],
  ["Pen + Bottle + Keychain", 10],
  ["Pen + Keychain + Dairy + Temperature Bottle", 4],
  ["Pen + Dairy + Keychain + Cardholder + Temperature Bottle", 6],
  ["Pen + Dairy + Mug + Keychain + Mobile Stand + Temperature Bottle", 5],
  ["Dairy + Pen + Temperature Bottle + Laptop Stand", 2],
  ["Bamboo Dairy + Cardholder + Keychain + Pen", 9],
];

const connection = await pool.getConnection();
try {
  const [columns] = await connection.query("SHOW COLUMNS FROM product_variants LIKE 'item_count'");
  if (!columns.length) {
    await connection.query("ALTER TABLE product_variants ADD COLUMN item_count INT UNSIGNED DEFAULT NULL");
  }
  await connection.beginTransaction();
  const [services] = await connection.execute("SELECT id FROM services WHERE slug = ?", ["corporate-gift"]);
  if (!services.length) throw new Error("Corporate Gifts service not found");
  const serviceId = services[0].id;
  let [categories] = await connection.execute("SELECT id FROM categories WHERE service_id = ? AND name = ?", [serviceId, "Combo Sets"]);
  if (!categories.length) {
    await connection.execute("INSERT INTO categories (service_id, name, slug, status) VALUES (?, ?, ?, 'ACTIVE')", [serviceId, "Combo Sets", "corporate-gift-combo-sets"]);
    [categories] = await connection.execute("SELECT id FROM categories WHERE service_id = ? AND name = ?", [serviceId, "Combo Sets"]);
  }
  let [products] = await connection.execute("SELECT id FROM products WHERE category_id = ? AND name = ?", [categories[0].id, "Combo Sets"]);
  if (!products.length) {
    await connection.execute("INSERT INTO products (category_id, name, slug, status) VALUES (?, ?, ?, 'ACTIVE')", [categories[0].id, "Combo Sets", "corporate-gift-combo-sets"]);
    [products] = await connection.execute("SELECT id FROM products WHERE category_id = ? AND name = ?", [categories[0].id, "Combo Sets"]);
  }
  const productId = products[0].id;
  for (const [index, [name, count]] of items.entries()) {
    const [existing] = await connection.execute("SELECT id FROM product_variants WHERE product_id = ? AND name = ?", [productId, name]);
    if (existing.length) {
      await connection.execute("UPDATE product_variants SET item_count = ? WHERE id = ?", [count, existing[0].id]);
    } else {
      await connection.execute("INSERT INTO product_variants (product_id, name, item_count, display_order, status) VALUES (?, ?, ?, ?, 'ACTIVE')", [productId, name, count, index + 1]);
    }
  }
  await connection.commit();
  console.log(`Saved ${items.length} gifting entries under Combo Sets (product ${productId}).`);
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  connection.release();
  await pool.end();
}
