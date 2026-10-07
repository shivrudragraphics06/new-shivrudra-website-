import { Router } from "express";

import { pool } from "../db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const publicRoutes = Router();
publicRoutes.use((_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

function mediaUrl(req, resource, id, field = "image", updatedAt) {
  const version = updatedAt instanceof Date ? updatedAt.toISOString() : updatedAt;
  return `/api/public/media/${resource}/${id}/${field}${version ? `?v=${encodeURIComponent(version)}` : ""}`;
}

const publicMedia = {
  services: { table: "services", image: ["image_data", "image_mime_type"], icon: ["icon_data", "icon_mime_type"] },
  categories: { table: "categories", image: ["image_data", "image_mime_type"] },
  products: { table: "products", image: ["main_image_data", "main_image_mime_type"] },
  "product-images": { table: "product_images", image: ["image_data", "mime_type"] },
  variants: { table: "product_variants", image: ["image_data", "image_mime_type"] },
  "combo-items": { table: "product_variant_items", image: ["image_data", "image_mime_type"] },
  gallery: { table: "gallery", image: ["image_data", "image_mime_type"] },
  blogs: { table: "blogs", image: ["featured_image_data", "featured_image_mime_type"] },
  industries: { table: "industries", image: ["image_data", "image_mime_type"] },
  clients: { table: "clients", logo: ["logo_data", "logo_mime_type"] },
  testimonials: { table: "testimonials", image: ["client_image_data", "client_image_mime_type"] },
};

function publicRow(row, resource, req) {
  const output = { ...row };
  delete output.image_data;
  delete output.icon_data;
  delete output.main_image_data;
  delete output.featured_image_data;
  delete output.logo_data;
  delete output.client_image_data;

  output.is_active = row.status ? row.status === "ACTIVE" : row.is_active;
  output.is_featured = row.featured ?? row.is_featured;
  output.sort_order = row.display_order ?? row.sort_order;
  output.meta_title = row.seo_title ?? row.meta_title;
  output.meta_description = row.seo_description ?? row.meta_description;

  if (row.image_mime_type) output.image_url = mediaUrl(req, resource, row.id, "image", row.updated_at);
  if (row.icon_mime_type) output.icon_url = mediaUrl(req, resource, row.id, "icon", row.updated_at);
  if (row.main_image_mime_type) output.main_image_url = mediaUrl(req, resource, row.id, "image", row.updated_at);
  if (row.featured_image_mime_type) output.featured_image_url = mediaUrl(req, resource, row.id, "image", row.updated_at);
  if (row.logo_mime_type) output.logo_url = mediaUrl(req, resource, row.id, "logo", row.updated_at);
  if (row.client_image_mime_type) output.image_url = mediaUrl(req, resource, row.id, "image", row.updated_at);
  if (row.mime_type) output.image_url = mediaUrl(req, resource, row.id, "image", row.updated_at);

  return output;
}

publicRoutes.get(
  "/media/:resource/:id/:field",
  asyncHandler(async (req, res) => {
    const config = publicMedia[req.params.resource];
    const columns = config?.[req.params.field];
    if (!config || !columns) return res.status(404).json({ success: false, message: "Media not found" });

    const [dataColumn, mimeColumn] = columns;
    const [rows] = await pool.execute(`SELECT ${dataColumn} AS data, ${mimeColumn} AS mime FROM ${config.table} WHERE id = ?`, [
      req.params.id,
    ]);
    const image = rows[0];
    if (!image?.data) return res.status(404).json({ success: false, message: "Media not found" });

    res.setHeader("Content-Type", image.mime || "application/octet-stream");
    res.send(image.data);
  }),
);

publicRoutes.get(
  "/services",
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query("SELECT * FROM services WHERE status = 'ACTIVE' ORDER BY display_order ASC, id DESC");
    const [products] = await pool.query(
      `SELECT products.id, categories.service_id, products.name, products.slug
       FROM products
       INNER JOIN categories ON categories.id = products.category_id
       WHERE products.status = 'ACTIVE'
       ORDER BY products.display_order ASC, products.id DESC`,
    );

    res.json(
      rows.map((service) => ({
        ...publicRow(service, "services", req),
        blurb: service.short_description,
        subs: products.filter((product) => product.service_id === service.id).map((product) => product.name),
        products: products.filter((product) => product.service_id === service.id),
      })),
    );
  }),
);

publicRoutes.get(
  "/categories",
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query("SELECT * FROM categories WHERE status = 'ACTIVE' ORDER BY display_order ASC, id DESC");
    res.json(rows.map((row) => publicRow(row, "categories", req)));
  }),
);

publicRoutes.get(
  "/products",
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(
      `SELECT products.*, services.id AS service_id, services.name AS service_name, categories.name AS category_name
       FROM products
       LEFT JOIN categories ON categories.id = products.category_id
       LEFT JOIN services ON services.id = categories.service_id
       WHERE products.status = 'ACTIVE'
       ORDER BY products.display_order ASC, products.id DESC`,
    );
    res.json(rows.map((row) => publicRow(row, "products", req)));
  }),
);

publicRoutes.get(
  "/gallery",
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(`SELECT gallery.id, gallery.title, gallery.alt_text, gallery.image_url,
      gallery.image_mime_type, gallery.updated_at, gallery.status, gallery.display_order, gallery_categories.name AS category
      FROM gallery LEFT JOIN gallery_categories ON gallery_categories.id = gallery.gallery_category_id
      WHERE gallery.status = 'ACTIVE' ORDER BY gallery.display_order ASC, gallery.id DESC`);
    res.json(rows.map((row) => publicRow(row, "gallery", req)));
  }),
);

publicRoutes.get(
  "/blogs",
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query("SELECT id, title, slug, excerpt, content, author, publish_date, featured_image_url, featured_image_mime_type, updated_at, status FROM blogs WHERE status = 'PUBLISHED' ORDER BY publish_date DESC, id DESC");
    res.json(rows.map((row) => publicRow(row, "blogs", req)));
  }),
);

publicRoutes.get(
  "/industries",
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query("SELECT id, name, slug, short_description, description, image_url, icon_url, image_mime_type, updated_at, status, display_order FROM industries WHERE status = 'ACTIVE' ORDER BY display_order ASC, id DESC");
    res.json(rows.map((row) => publicRow(row, "industries", req)));
  }),
);

publicRoutes.get(
  "/clients",
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query("SELECT id, name, logo_url, website_url, logo_mime_type, updated_at, status, display_order FROM clients WHERE status = 'ACTIVE' ORDER BY display_order ASC, id DESC");
    res.json(rows.map((row) => publicRow(row, "clients", req)));
  }),
);

publicRoutes.get(
  "/testimonials",
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query("SELECT id, client_name, company_name, designation, testimonial, message, rating, image_url, client_image_mime_type, updated_at, status, display_order FROM testimonials WHERE status = 'ACTIVE' ORDER BY display_order ASC, id DESC");
    res.json(rows.map((row) => publicRow(row, "testimonials", req)));
  }),
);

publicRoutes.get(
  "/products/:slug",
  asyncHandler(async (req, res) => {
    const [products] = await pool.execute(
      `SELECT products.*, services.id AS service_id, services.name AS serviceName, services.slug AS serviceSlug, categories.name AS categoryName
       FROM products
       LEFT JOIN categories ON categories.id = products.category_id
       LEFT JOIN services ON services.id = categories.service_id
       WHERE products.slug = ? AND products.status = 'ACTIVE'`,
      [req.params.slug],
    );
    const product = products[0];

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const [images] = await pool.execute("SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order ASC", [
      product.id,
    ]);
    const [variants] = await pool.execute(
      "SELECT * FROM product_variants WHERE product_id = ? AND status = 'ACTIVE' ORDER BY display_order ASC, id DESC",
      [product.id],
    );

    const [comboItems] = await pool.execute(
      `SELECT items.* FROM product_variant_items items
       JOIN product_variants variants ON variants.id = items.variant_id
       WHERE variants.product_id = ? AND variants.status = 'ACTIVE' AND items.status = 'ACTIVE'
       ORDER BY items.display_order ASC, items.id DESC`,
      [product.id],
    );

    res.json({
      ...publicRow(product, "products", req),
      images: images.map((row) => publicRow(row, "product-images", req)),
      variants: variants.map((row) => ({
        ...publicRow(row, "variants", req),
        items: comboItems.filter((item) => item.variant_id === row.id).map((item) => publicRow(item, "combo-items", req)),
      })),
    });
  }),
);

publicRoutes.post(
  "/inquiries",
  asyncHandler(async (req, res) => {
    const { name, phone, email, company, service_id, product_id, product_name, subject, message } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Name is required" });

    const [result] = await pool.execute(
      `INSERT INTO inquiries (name, phone, email, company, service_id, product_id, subject, message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        phone || null,
        email || null,
        company || null,
        service_id || null,
        product_id || null,
        subject || product_name || null,
        message || null,
      ],
    );

    res.status(201).json({ id: result.insertId, message: "Inquiry submitted" });
  }),
);

publicRoutes.get(
  "/settings",
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query("SELECT setting_key, setting_value, mime_type FROM settings");
    res.json(
      Object.fromEntries(
        rows.map((row) => [
          row.setting_key,
          row.mime_type ? null : row.setting_value,
        ]),
      ),
    );
  }),
);

publicRoutes.get(
  "/homepage",
  asyncHandler(async (req, res) => {
    const [services] = await pool.query("SELECT * FROM services WHERE status = 'ACTIVE' ORDER BY display_order ASC LIMIT 12");
    const [categories] = await pool.query("SELECT * FROM categories WHERE status = 'ACTIVE' ORDER BY display_order ASC");
    const [gallery] = await pool.query("SELECT * FROM gallery WHERE status = 'ACTIVE' ORDER BY display_order ASC LIMIT 12");
    const [clients] = await pool.query("SELECT * FROM clients WHERE status = 'ACTIVE' ORDER BY display_order ASC");
    const [testimonials] = await pool.query("SELECT * FROM testimonials WHERE status = 'ACTIVE' ORDER BY display_order ASC LIMIT 10");

    res.json({
      services: services.map((row) => publicRow(row, "services", req)),
      categories: categories.map((row) => publicRow(row, "categories", req)),
      gallery: gallery.map((row) => publicRow(row, "gallery", req)),
      clients: clients.map((row) => publicRow(row, "clients", req)),
      testimonials: testimonials.map((row) => publicRow(row, "testimonials", req)),
    });
  }),
);
