import { Router } from "express";
import slugify from "slugify";

import { pool } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const crudRoutes = Router();

const resources = {
  services: {
    table: "services",
    orderBy: "display_order ASC, id DESC",
    fields: ["name", "slug", "short_description", "description", "display_order", "status", "seo_title", "seo_description"],
    required: ["name"],
    images: {
      image: ["image_data", "image_mime_type", "image_filename"],
      icon: ["icon_data", "icon_mime_type", "icon_filename"],
    },
    media: { image: "image", icon: "icon" },
  },
  categories: {
    table: "categories",
    listSql:
      "SELECT categories.*, services.name AS service_name FROM categories LEFT JOIN services ON services.id = categories.service_id",
    orderBy: "display_order ASC, id DESC",
    fields: ["service_id", "name", "slug", "description", "display_order", "status"],
    required: ["service_id", "name"],
    images: { image: ["image_data", "image_mime_type", "image_filename"] },
    media: { image: "image" },
  },
  products: {
    table: "products",
    listSql:
      "SELECT products.*, services.id AS service_id, services.name AS service_name, categories.name AS category_name FROM products LEFT JOIN categories ON categories.id = products.category_id LEFT JOIN services ON services.id = categories.service_id",
    orderBy: "display_order ASC, id DESC",
    fields: [
      "category_id",
      "name",
      "slug",
      "sku",
      "short_description",
      "description",
      "featured",
      "display_order",
      "status",
      "seo_title",
      "seo_description",
    ],
    required: ["category_id", "name"],
    images: { main_image: ["main_image_data", "main_image_mime_type", "main_image_filename"] },
    media: { image: "main_image" },
  },
  "product-images": {
    table: "product_images",
    orderBy: "display_order ASC, id DESC",
    fields: ["product_id", "alt_text", "display_order"],
    required: ["product_id"],
    images: { image: ["image_data", "mime_type", "original_filename"] },
    media: { image: "image" },
  },
  variants: {
    table: "product_variants",
    orderBy: "display_order ASC, id DESC",
    fields: ["product_id", "name", "sku", "item_count", "description", "display_order", "status"],
    required: ["product_id", "name"],
    images: { image: ["image_data", "image_mime_type", "image_filename"] },
    media: { image: "image" },
  },
  "combo-items": {
    table: "product_variant_items",
    orderBy: "display_order ASC, id DESC",
    fields: ["variant_id", "name", "sku", "description", "display_order", "status"],
    required: ["variant_id", "name"],
    images: { image: ["image_data", "image_mime_type", "image_filename"] },
    media: { image: "image" },
  },
  "gallery-categories": {
    table: "gallery_categories",
    orderBy: "display_order ASC, id DESC",
    fields: ["name", "display_order", "status"],
    required: ["name"],
  },
  gallery: {
    table: "gallery",
    orderBy: "display_order ASC, id DESC",
    fields: ["gallery_category_id", "title", "alt_text", "description", "display_order", "status"],
    required: ["title"],
    images: { image: ["image_data", "image_mime_type", "image_filename"] },
    media: { image: "image" },
  },
  blogs: {
    table: "blogs",
    orderBy: "publish_date DESC, id DESC",
    fields: ["title", "slug", "excerpt", "content", "author", "publish_date", "status", "seo_title", "seo_description"],
    required: ["title"],
    images: { image: ["featured_image_data", "featured_image_mime_type", "featured_image_filename"] },
    media: { image: "featured_image" },
  },
  industries: {
    table: "industries",
    orderBy: "display_order ASC, id DESC",
    fields: ["name", "slug", "short_description", "description", "display_order", "status"],
    required: ["name"],
    images: { image: ["image_data", "image_mime_type", "image_filename"] },
    media: { image: "image" },
  },
  clients: {
    table: "clients",
    orderBy: "display_order ASC, id DESC",
    fields: ["name", "website_url", "display_order", "status"],
    required: ["name"],
    images: { logo: ["logo_data", "logo_mime_type", "logo_filename"] },
    media: { logo: "logo" },
  },
  testimonials: {
    table: "testimonials",
    orderBy: "display_order ASC, id DESC",
    fields: ["client_name", "company_name", "designation", "rating", "testimonial", "display_order", "status"],
    required: ["client_name", "testimonial"],
    images: { image: ["client_image_data", "client_image_mime_type", "client_image_filename"] },
    media: { image: "client_image" },
  },
  inquiries: {
    table: "inquiries",
    listSql:
      "SELECT inquiries.*, services.name AS service_name FROM inquiries LEFT JOIN services ON services.id = inquiries.service_id",
    orderBy: "created_at DESC",
    fields: ["name", "phone", "email", "company", "service_id", "subject", "message", "status", "admin_notes"],
    required: ["name"],
  },
};

const legacyImageUrlFields = new Set(["image_url", "icon_url", "main_image_url", "featured_image_url", "logo_url"]);

function getResource(req, res) {
  const config = resources[req.params.resource];
  if (!config) {
    res.status(404).json({ success: false, message: "Unknown CMS resource" });
    return null;
  }
  return config;
}

function assertDatabaseBackedImages(req) {
  const urlFields = Object.keys(req.body || {}).filter((key) => legacyImageUrlFields.has(key) && req.body[key]);
  if (!urlFields.length) return;

  const error = new Error("Images must be uploaded as files from the admin panel so they are stored in the database.");
  error.statusCode = 400;
  error.details = { rejectedFields: urlFields };
  throw error;
}

function normalizeStatus(payload) {
  if (payload.is_active !== undefined && payload.status === undefined) {
    payload.status = payload.is_active ? "ACTIVE" : "INACTIVE";
  }
  if (payload.is_published !== undefined && payload.status === undefined) {
    payload.status = payload.is_published ? "PUBLISHED" : "DRAFT";
  }
  if (payload.sort_order !== undefined && payload.display_order === undefined) {
    payload.display_order = payload.sort_order;
  }
  if (payload.meta_title !== undefined && payload.seo_title === undefined) {
    payload.seo_title = payload.meta_title;
  }
  if (payload.meta_description !== undefined && payload.seo_description === undefined) {
    payload.seo_description = payload.meta_description;
  }
  if (payload.is_featured !== undefined && payload.featured === undefined) {
    payload.featured = payload.is_featured;
  }
}

function hydrateCompatibility(row, resourceKey, req) {
  const base = `/api/public/media/${resourceKey}/${row.id}`;
  const output = { ...row };

  delete output.image_data;
  delete output.icon_data;
  delete output.main_image_data;
  delete output.featured_image_data;
  delete output.logo_data;
  delete output.client_image_data;
  delete output.binary_value;

  output.is_active = row.status ? row.status === "ACTIVE" : row.is_active;
  output.is_featured = row.featured ?? row.is_featured;
  output.sort_order = row.display_order ?? row.sort_order;
  output.meta_title = row.seo_title ?? row.meta_title;
  output.meta_description = row.seo_description ?? row.meta_description;

  if (row.image_mime_type) output.image_url = `${base}/image`;
  if (row.icon_mime_type) output.icon_url = `${base}/icon`;
  if (row.main_image_mime_type) output.main_image_url = `${base}/image`;
  if (row.featured_image_mime_type) output.featured_image_url = `${base}/image`;
  if (row.logo_mime_type) output.logo_url = `${base}/logo`;
  if (row.client_image_mime_type) output.image_url = `${base}/image`;
  if (row.mime_type) output.image_url = `${base}/image`;

  return output;
}

async function childCounts(resourceKey, id) {
  if (resourceKey === "services") {
    const [[categories]] = await pool.execute("SELECT COUNT(*) AS count FROM categories WHERE service_id = ?", [id]);
    const [[products]] = await pool.execute(
      `SELECT COUNT(*) AS count
       FROM products
       INNER JOIN categories ON categories.id = products.category_id
       WHERE categories.service_id = ?`,
      [id],
    );
    return { categories: categories.count, products: products.count };
  }

  if (resourceKey === "categories") {
    const [[products]] = await pool.execute("SELECT COUNT(*) AS count FROM products WHERE category_id = ?", [id]);
    return { products: products.count };
  }

  if (resourceKey === "products") {
    const [[images]] = await pool.execute("SELECT COUNT(*) AS count FROM product_images WHERE product_id = ?", [id]);
    const [[variants]] = await pool.execute("SELECT COUNT(*) AS count FROM product_variants WHERE product_id = ?", [id]);
    return { images: images.count, variants: variants.count };
  }

  return {};
}

async function assertCanDelete(resourceKey, id, force) {
  const counts = await childCounts(resourceKey, id);
  const blocking = Object.entries(counts).filter(([, count]) => count > 0);

  if (!blocking.length) return;
  if (resourceKey === "products" && force === "true") return;

  const message =
    resourceKey === "products"
      ? `This product contains ${counts.images} images and ${counts.variants} variants. Confirm delete again to permanently remove them.`
      : `Cannot delete because this ${resourceKey.slice(0, -1)} contains child content.`;

  const error = new Error(message);
  error.statusCode = 409;
  error.details = counts;
  throw error;
}

function payloadFromRequest(req) {
  const payload = { ...(req.body || {}) };
  normalizeStatus(payload);

  if (!payload.slug && (payload.name || payload.title)) {
    payload.slug = slugify(payload.name || payload.title, { lower: true, strict: true });
  }

  if (payload.status) payload.status = String(payload.status).toUpperCase();
  for (const key of ["service_id", "category_id", "product_id", "variant_id", "gallery_category_id", "display_order", "rating", "item_count"]) {
    if (payload[key] === "") payload[key] = null;
    if (payload[key] !== undefined && payload[key] !== null) payload[key] = Number(payload[key]);
  }
  if (payload.featured !== undefined) payload.featured = payload.featured === "true" || payload.featured === true || payload.featured === 1 || payload.featured === "1";

  return payload;
}

function fieldsForWrite(config, payload, files = []) {
  const fields = config.fields.filter((field) => payload[field] !== undefined);
  const values = fields.map((field) => payload[field]);

  for (const file of files) {
    const imageColumns = config.images?.[file.fieldname];
    if (!imageColumns) continue;
    if (!file.buffer?.length) {
      const error = new Error("Uploaded image data is missing. Please upload the image file again.");
      error.statusCode = 400;
      throw error;
    }
    fields.push(...imageColumns);
    values.push(file.buffer, file.mimetype, file.originalname);
  }

  return { fields, values };
}

crudRoutes.use(requireAdmin);

crudRoutes.get(
  "/dashboard",
  asyncHandler(async (req, res) => {
    const countSql = {
      services: "SELECT COUNT(*) AS count FROM services",
      categories: "SELECT COUNT(*) AS count FROM categories",
      products: "SELECT COUNT(*) AS count FROM products",
      gallery: "SELECT COUNT(*) AS count FROM gallery",
      blogs: "SELECT COUNT(*) AS count FROM blogs",
      industries: "SELECT COUNT(*) AS count FROM industries",
      clients: "SELECT COUNT(*) AS count FROM clients",
      testimonials: "SELECT COUNT(*) AS count FROM testimonials",
      inquiries: "SELECT COUNT(*) AS count FROM inquiries",
      newInquiries: "SELECT COUNT(*) AS count FROM inquiries WHERE status = 'NEW'",
      activeProducts: "SELECT COUNT(*) AS count FROM products WHERE status = 'ACTIVE'",
      inactiveProducts: "SELECT COUNT(*) AS count FROM products WHERE status = 'INACTIVE'",
      publishedBlogs: "SELECT COUNT(*) AS count FROM blogs WHERE status = 'PUBLISHED'",
      draftBlogs: "SELECT COUNT(*) AS count FROM blogs WHERE status = 'DRAFT'",
    };

    const counts = {};
    for (const [key, sql] of Object.entries(countSql)) {
      const [[row]] = await pool.query(sql);
      counts[key] = row.count;
    }

    const [recentInquiries] = await pool.query(
      `SELECT inquiries.*, services.name AS service_name
       FROM inquiries
       LEFT JOIN services ON services.id = inquiries.service_id
       ORDER BY inquiries.created_at DESC
       LIMIT 6`,
    );
    const [recentProducts] = await pool.query(
      `SELECT products.*, services.id AS service_id, services.name AS service_name, categories.name AS category_name
       FROM products
       LEFT JOIN categories ON categories.id = products.category_id
       LEFT JOIN services ON services.id = categories.service_id
       ORDER BY products.created_at DESC
       LIMIT 6`,
    );

    res.json({
      counts,
      recentInquiries,
      recentProducts: recentProducts.map((row) => hydrateCompatibility(row, "products", req)),
    });
  }),
);

crudRoutes.get(
  "/catalog-tree",
  asyncHandler(async (req, res) => {
    const [services] = await pool.query("SELECT id, name, slug, status FROM services ORDER BY display_order ASC, name ASC");
    const [categories] = await pool.query("SELECT id, service_id, name, slug, status FROM categories ORDER BY display_order ASC, name ASC");
    const [products] = await pool.query(
      `SELECT products.id, categories.service_id, products.category_id, products.name, products.slug, products.status
       FROM products
       LEFT JOIN categories ON categories.id = products.category_id
       ORDER BY products.display_order ASC, products.name ASC`,
    );

    res.json(
      services.map((service) => ({
        ...service,
        categories: categories
          .filter((category) => category.service_id === service.id)
          .map((category) => ({
            ...category,
            products: products.filter((product) => product.category_id === category.id).map((row) => hydrateCompatibility(row, "products", req)),
          })),
      })),
    );
  }),
);

crudRoutes.get(
  "/media/:resource/:id/:field",
  asyncHandler(async (req, res) => {
    const config = resources[req.params.resource];
    const imageKey = config?.media?.[req.params.field];
    const imageColumns = imageKey ? config.images?.[imageKey] : null;

    if (!config || !imageColumns) return res.status(404).json({ success: false, message: "Media not found" });

    const [dataColumn, mimeColumn] = imageColumns;
    const [rows] = await pool.execute(`SELECT ${dataColumn} AS data, ${mimeColumn} AS mime FROM ${config.table} WHERE id = ?`, [
      req.params.id,
    ]);
    const image = rows[0];

    if (!image?.data) return res.status(404).json({ success: false, message: "Media not found" });

    res.setHeader("Content-Type", image.mime || "application/octet-stream");
    res.send(image.data);
  }),
);

crudRoutes.patch(
  "/:resource/:id/status",
  asyncHandler(async (req, res) => {
    const config = getResource(req, res);
    if (!config) return;

    const status = String(req.body.status || "").toUpperCase();
    const allowed = req.params.resource === "blogs" ? ["DRAFT", "PUBLISHED"] : ["ACTIVE", "INACTIVE"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    await pool.execute(`UPDATE ${config.table} SET status = ? WHERE id = ?`, [status, req.params.id]);
    res.json({ message: "Status updated" });
  }),
);

crudRoutes.get(
  "/products/:id/images",
  asyncHandler(async (req, res) => {
    const [rows] = await pool.execute(
      "SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order ASC, id DESC",
      [req.params.id],
    );
    res.json(rows.map((row) => hydrateCompatibility(row, "product-images", req)));
  }),
);

crudRoutes.post(
  "/products/:id/images",
  upload.array("images", 20),
  asyncHandler(async (req, res) => {
    const files = req.files || [];
    if (!files.length) return res.status(400).json({ success: false, message: "Images are required" });

    for (const [index, file] of files.entries()) {
      if (!file.buffer?.length) {
        return res.status(400).json({ success: false, message: "Uploaded image data is missing. Please upload the image file again." });
      }

      await pool.execute(
        `INSERT INTO product_images (product_id, image_data, mime_type, original_filename, alt_text, display_order)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          req.params.id,
          file.buffer,
          file.mimetype,
          file.originalname,
          Array.isArray(req.body.alt_text) ? req.body.alt_text[index] || "" : req.body.alt_text || "",
          Number(req.body.display_order || 0) + index,
        ],
      );
    }

    res.status(201).json({ message: "Images uploaded" });
  }),
);

crudRoutes.delete(
  "/products/:id/images/:imageId",
  asyncHandler(async (req, res) => {
    await pool.execute("DELETE FROM product_images WHERE id = ? AND product_id = ?", [req.params.imageId, req.params.id]);
    res.json({ message: "Image deleted" });
  }),
);

crudRoutes.get(
  "/products/:id/variants",
  asyncHandler(async (req, res) => {
    const [rows] = await pool.execute(
      "SELECT * FROM product_variants WHERE product_id = ? ORDER BY display_order ASC, id DESC",
      [req.params.id],
    );
    res.json(rows.map((row) => hydrateCompatibility(row, "variants", req)));
  }),
);

crudRoutes.get(
  "/variants/:id/items",
  asyncHandler(async (req, res) => {
    const [rows] = await pool.execute(
      "SELECT * FROM product_variant_items WHERE variant_id = ? ORDER BY display_order ASC, id DESC",
      [req.params.id],
    );
    res.json(rows.map((row) => hydrateCompatibility(row, "combo-items", req)));
  }),
);

crudRoutes.get(
  "/inquiries/export",
  asyncHandler(async (_req, res) => {
    const [rows] = await pool.query("SELECT * FROM inquiries ORDER BY created_at DESC");
    const columns = ["name", "phone", "email", "company", "subject", "message", "status", "admin_notes", "created_at"];
    const csv = [
      columns.join(","),
      ...rows.map((row) =>
        columns
          .map((column) => `"${String(row[column] ?? "").replace(/"/g, '""')}"`)
          .join(","),
      ),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=inquiries.csv");
    res.send(csv);
  }),
);

crudRoutes.get(
  "/settings",
  asyncHandler(async (_req, res) => {
    const [rows] = await pool.query("SELECT setting_key, setting_value, mime_type, filename FROM settings ORDER BY setting_key ASC");
    res.json(rows);
  }),
);

crudRoutes.put(
  "/settings",
  upload.any(),
  asyncHandler(async (req, res) => {
    assertDatabaseBackedImages(req);
    const payload = payloadFromRequest(req);

    for (const [key, value] of Object.entries(payload)) {
      await pool.execute(
        `INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [key, value],
      );
    }

    for (const file of req.files || []) {
      await pool.execute(
        `INSERT INTO settings (setting_key, binary_value, mime_type, filename) VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE binary_value = VALUES(binary_value), mime_type = VALUES(mime_type), filename = VALUES(filename)`,
        [file.fieldname, file.buffer, file.mimetype, file.originalname],
      );
    }

    res.json({ message: "Settings updated" });
  }),
);

crudRoutes.get(
  "/settings/media/:key",
  asyncHandler(async (req, res) => {
    const [rows] = await pool.execute("SELECT binary_value, mime_type FROM settings WHERE setting_key = ?", [req.params.key]);
    const image = rows[0];
    if (!image?.binary_value) return res.status(404).json({ success: false, message: "Setting media not found" });
    res.setHeader("Content-Type", image.mime_type || "application/octet-stream");
    res.send(image.binary_value);
  }),
);

crudRoutes.get(
  "/:resource",
  asyncHandler(async (req, res) => {
    const config = getResource(req, res);
    if (!config) return;

    const [rows] = await pool.query(`${config.listSql || `SELECT * FROM ${config.table}`} ORDER BY ${config.orderBy}`);
    res.json(rows.map((row) => hydrateCompatibility(row, req.params.resource, req)));
  }),
);

crudRoutes.get(
  "/:resource/:id",
  asyncHandler(async (req, res) => {
    const config = getResource(req, res);
    if (!config) return;

    const [rows] = await pool.execute(
      config.listSql ? `${config.listSql} WHERE ${config.table}.id = ?` : `SELECT * FROM ${config.table} WHERE id = ?`,
      [req.params.id],
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: "Record not found" });

    res.json(hydrateCompatibility(rows[0], req.params.resource, req));
  }),
);

crudRoutes.post(
  "/:resource",
  upload.any(),
  asyncHandler(async (req, res) => {
    const config = getResource(req, res);
    if (!config) return;

    assertDatabaseBackedImages(req);
    const payload = payloadFromRequest(req);
    for (const field of config.required || []) {
      if (!payload[field]) return res.status(400).json({ success: false, message: `${field} is required` });
    }

    const { fields, values } = fieldsForWrite(config, payload, req.files);
    if (!fields.length) return res.status(400).json({ success: false, message: "No valid fields provided" });

    const placeholders = fields.map(() => "?").join(", ");
    const [result] = await pool.execute(`INSERT INTO ${config.table} (${fields.join(", ")}) VALUES (${placeholders})`, values);

    res.status(201).json({ id: result.insertId, message: "Created" });
  }),
);

crudRoutes.put(
  "/:resource/:id",
  upload.any(),
  asyncHandler(async (req, res) => {
    const config = getResource(req, res);
    if (!config) return;

    assertDatabaseBackedImages(req);
    const payload = payloadFromRequest(req);
    const { fields, values } = fieldsForWrite(config, payload, req.files);
    if (!fields.length) return res.status(400).json({ success: false, message: "No valid fields provided" });

    const assignments = fields.map((field) => `${field} = ?`).join(", ");
    await pool.execute(`UPDATE ${config.table} SET ${assignments} WHERE id = ?`, [...values, req.params.id]);
    res.json({ message: "Updated" });
  }),
);

crudRoutes.delete(
  "/:resource/:id",
  asyncHandler(async (req, res) => {
    const config = getResource(req, res);
    if (!config) return;

    await assertCanDelete(req.params.resource, req.params.id, req.query.force);
    await pool.execute(`DELETE FROM ${config.table} WHERE id = ?`, [req.params.id]);
    res.json({ message: "Deleted" });
  }),
);
