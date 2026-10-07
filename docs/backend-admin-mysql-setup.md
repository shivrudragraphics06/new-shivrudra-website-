# Backend Admin Panel With MySQL

This project is currently a Vite React frontend with static data in `src/data/site.ts` and `src/lib/products.ts`. To make services, products, gallery, blogs, industries, clients, and testimonials editable from an admin panel, add a backend API. Do not connect React directly to MySQL because database credentials would be exposed in browser code.

Recommended stack:

- Frontend: existing React + Vite app
- Backend: Node.js + Express
- Database: MySQL, managed through MySQL Workbench
- Auth: JWT access token + bcrypt password hashing
- Image upload: backend stores files in `api/uploads`, database stores image URLs

## 1. Create Database In MySQL Workbench

Open MySQL Workbench, connect to your local/server MySQL instance, open a SQL tab, and run:

```sql
CREATE DATABASE shivrudra_graphics
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE shivrudra_graphics;

CREATE TABLE admins (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE services (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(160) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  short_description VARCHAR(255),
  description TEXT,
  image_url VARCHAR(500),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE product_categories (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(160) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  description TEXT,
  image_url VARCHAR(500),
  icon VARCHAR(80),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  category_id BIGINT UNSIGNED NULL,
  service_id BIGINT UNSIGNED NULL,
  name VARCHAR(180) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  short_description VARCHAR(255),
  description LONGTEXT,
  main_image_url VARCHAR(500),
  meta_title VARCHAR(255),
  meta_description VARCHAR(500),
  sort_order INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_products_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
);

CREATE TABLE product_images (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  product_id BIGINT UNSIGNED NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE gallery_images (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(180),
  category VARCHAR(120),
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE blogs (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(220) NOT NULL,
  slug VARCHAR(240) NOT NULL UNIQUE,
  excerpt VARCHAR(500),
  content LONGTEXT NOT NULL,
  featured_image_url VARCHAR(500),
  author VARCHAR(120),
  meta_title VARCHAR(255),
  meta_description VARCHAR(500),
  is_published BOOLEAN DEFAULT FALSE,
  published_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE industries (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(160) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  description TEXT,
  icon_url VARCHAR(500),
  image_url VARCHAR(500),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE clients (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(180) NOT NULL,
  logo_url VARCHAR(500),
  website_url VARCHAR(500),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE testimonials (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  client_name VARCHAR(160) NOT NULL,
  client_role VARCHAR(160),
  company VARCHAR(180),
  message TEXT NOT NULL,
  rating TINYINT UNSIGNED DEFAULT 5,
  image_url VARCHAR(500),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE site_settings (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(120) NOT NULL UNIQUE,
  setting_value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 2. Create Backend Folder

From project root:

```bash
mkdir api
cd api
npm init -y
npm install express mysql2 dotenv cors bcrypt jsonwebtoken multer slugify
npm install -D nodemon
```

Update `api/package.json`:

```json
{
  "type": "module",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js"
  }
}
```

Create `api/.env`:

```env
PORT=5000
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=shivrudra_graphics
JWT_SECRET=change_this_to_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

## 3. Backend Code

Create this folder structure:

```txt
api/
  src/
    server.js
    db.js
    middleware/auth.js
    middleware/upload.js
    routes/auth.routes.js
    routes/crud.routes.js
    routes/public.routes.js
    utils/asyncHandler.js
    scripts/createAdmin.js
  uploads/
```

`api/src/db.js`

```js
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
});
```

`api/src/utils/asyncHandler.js`

```js
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
```

`api/src/middleware/auth.js`

```js
import jwt from "jsonwebtoken";

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Login required" });
  }

  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}
```

`api/src/middleware/upload.js`

```js
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image uploads are allowed"));
      return;
    }
    cb(null, true);
  },
});
```

`api/src/routes/auth.routes.js`

```js
import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authRoutes = Router();

authRoutes.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const [rows] = await pool.execute("SELECT * FROM admins WHERE email = ?", [email]);
    const admin = rows[0];

    if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    res.json({
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email },
    });
  }),
);
```

`api/src/routes/crud.routes.js`

```js
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
    fields: ["name", "slug", "short_description", "description", "image_url", "sort_order", "is_active"],
  },
  categories: {
    table: "product_categories",
    fields: ["name", "slug", "description", "image_url", "icon", "sort_order", "is_active"],
  },
  products: {
    table: "products",
    fields: [
      "category_id",
      "service_id",
      "name",
      "slug",
      "short_description",
      "description",
      "main_image_url",
      "meta_title",
      "meta_description",
      "sort_order",
      "is_featured",
      "is_active",
    ],
  },
  gallery: {
    table: "gallery_images",
    fields: ["title", "category", "image_url", "alt_text", "sort_order", "is_active"],
  },
  blogs: {
    table: "blogs",
    fields: [
      "title",
      "slug",
      "excerpt",
      "content",
      "featured_image_url",
      "author",
      "meta_title",
      "meta_description",
      "is_published",
      "published_at",
    ],
  },
  industries: {
    table: "industries",
    fields: ["name", "slug", "description", "icon_url", "image_url", "sort_order", "is_active"],
  },
  clients: {
    table: "clients",
    fields: ["name", "logo_url", "website_url", "sort_order", "is_active"],
  },
  testimonials: {
    table: "testimonials",
    fields: ["client_name", "client_role", "company", "message", "rating", "image_url", "sort_order", "is_active"],
  },
};

function getResource(req, res) {
  const config = resources[req.params.resource];
  if (!config) {
    res.status(404).json({ message: "Unknown resource" });
    return null;
  }
  return config;
}

crudRoutes.use(requireAdmin);

crudRoutes.post(
  "/upload",
  upload.single("image"),
  (req, res) => {
    res.json({ url: `/uploads/${req.file.filename}` });
  },
);

crudRoutes.get(
  "/:resource",
  asyncHandler(async (req, res) => {
    const config = getResource(req, res);
    if (!config) return;

    const [rows] = await pool.query(`SELECT * FROM ${config.table} ORDER BY sort_order ASC, id DESC`);
    res.json(rows);
  }),
);

crudRoutes.get(
  "/:resource/:id",
  asyncHandler(async (req, res) => {
    const config = getResource(req, res);
    if (!config) return;

    const [rows] = await pool.execute(`SELECT * FROM ${config.table} WHERE id = ?`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: "Record not found" });
    res.json(rows[0]);
  }),
);

crudRoutes.post(
  "/:resource",
  asyncHandler(async (req, res) => {
    const config = getResource(req, res);
    if (!config) return;

    if (!req.body.slug && (req.body.name || req.body.title)) {
      req.body.slug = slugify(req.body.name || req.body.title, { lower: true, strict: true });
    }

    const fields = config.fields.filter((field) => req.body[field] !== undefined);
    const values = fields.map((field) => req.body[field]);
    const placeholders = fields.map(() => "?").join(", ");

    const [result] = await pool.execute(
      `INSERT INTO ${config.table} (${fields.join(", ")}) VALUES (${placeholders})`,
      values,
    );

    res.status(201).json({ id: result.insertId });
  }),
);

crudRoutes.put(
  "/:resource/:id",
  asyncHandler(async (req, res) => {
    const config = getResource(req, res);
    if (!config) return;

    const fields = config.fields.filter((field) => req.body[field] !== undefined);
    const assignments = fields.map((field) => `${field} = ?`).join(", ");
    const values = fields.map((field) => req.body[field]);

    await pool.execute(`UPDATE ${config.table} SET ${assignments} WHERE id = ?`, [...values, req.params.id]);
    res.json({ message: "Updated" });
  }),
);

crudRoutes.delete(
  "/:resource/:id",
  asyncHandler(async (req, res) => {
    const config = getResource(req, res);
    if (!config) return;

    await pool.execute(`DELETE FROM ${config.table} WHERE id = ?`, [req.params.id]);
    res.json({ message: "Deleted" });
  }),
);
```

`api/src/routes/public.routes.js`

```js
import { Router } from "express";
import { pool } from "../db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const publicRoutes = Router();

publicRoutes.get(
  "/services",
  asyncHandler(async (_req, res) => {
    const [rows] = await pool.query("SELECT * FROM services WHERE is_active = 1 ORDER BY sort_order ASC, id DESC");
    res.json(rows);
  }),
);

publicRoutes.get(
  "/products/:slug",
  asyncHandler(async (req, res) => {
    const [products] = await pool.execute("SELECT * FROM products WHERE slug = ? AND is_active = 1", [req.params.slug]);
    const product = products[0];
    if (!product) return res.status(404).json({ message: "Product not found" });

    const [images] = await pool.execute("SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC", [
      product.id,
    ]);

    res.json({ ...product, images });
  }),
);

publicRoutes.get(
  "/homepage",
  asyncHandler(async (_req, res) => {
    const [services] = await pool.query("SELECT * FROM services WHERE is_active = 1 ORDER BY sort_order ASC LIMIT 12");
    const [categories] = await pool.query(
      "SELECT * FROM product_categories WHERE is_active = 1 ORDER BY sort_order ASC",
    );
    const [gallery] = await pool.query("SELECT * FROM gallery_images WHERE is_active = 1 ORDER BY sort_order ASC LIMIT 12");
    const [clients] = await pool.query("SELECT * FROM clients WHERE is_active = 1 ORDER BY sort_order ASC");
    const [testimonials] = await pool.query(
      "SELECT * FROM testimonials WHERE is_active = 1 ORDER BY sort_order ASC LIMIT 10",
    );

    res.json({ services, categories, gallery, clients, testimonials });
  }),
);
```

`api/src/server.js`

```js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { authRoutes } from "./routes/auth.routes.js";
import { crudRoutes } from "./routes/crud.routes.js";
import { publicRoutes } from "./routes/public.routes.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/admin", crudRoutes);
app.use("/api/public", publicRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Server error" });
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`API running on http://localhost:${process.env.PORT || 5000}`);
});
```

## 4. Create Admin Login Password

Create `api/src/scripts/createAdmin.js`:

```js
import bcrypt from "bcrypt";
import { pool } from "../db.js";

const name = process.argv[2];
const email = process.argv[3];
const password = process.argv[4];

if (!name || !email || !password) {
  console.log("Usage: node src/scripts/createAdmin.js \"Admin\" admin@example.com password123");
  process.exit(1);
}

const passwordHash = await bcrypt.hash(password, 12);

await pool.execute("INSERT INTO admins (name, email, password_hash) VALUES (?, ?, ?)", [
  name,
  email,
  passwordHash,
]);

console.log("Admin created");
process.exit(0);
```

Run:

```bash
cd api
node src/scripts/createAdmin.js "Admin" admin@shivrudragraphics.com "StrongPassword@123"
```

## 5. Start Backend

```bash
cd api
npm run dev
```

Check:

```txt
http://localhost:5000/health
```

## 6. Frontend API Helper

In this React project, add `src/lib/api.ts`:

```ts
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function publicApi<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}/api/public${path}`);
  if (!response.ok) throw new Error("API request failed");
  return response.json();
}

export async function adminApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("admin_token");
  const response = await fetch(`${API_URL}/api/admin${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "API request failed");
  }

  return response.json();
}

export async function loginAdmin(email: string, password: string) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) throw new Error("Invalid login");
  return response.json() as Promise<{ token: string; admin: { id: number; name: string; email: string } }>;
}
```

Create `.env` in the project root:

```env
VITE_API_URL=http://localhost:5000
```

## 7. Admin Panel Pages To Build

Recommended admin routes:

```txt
/admin/login
/admin/dashboard
/admin/services
/admin/products
/admin/categories
/admin/gallery
/admin/blogs
/admin/industries
/admin/clients
/admin/testimonials
/admin/settings
```

Each list page should have:

- Add new button
- Edit button
- Delete button
- Search field
- Active/inactive toggle
- Sort order input
- Image upload field where needed

Use one reusable form/table pattern and change the fields per module.

## 8. Example Admin Login Component

```tsx
import { useState } from "react";
import { loginAdmin } from "@/lib/api";

export function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    try {
      const data = await loginAdmin(email, password);
      localStorage.setItem("admin_token", data.token);
      window.history.pushState({}, "", "/admin/dashboard");
      window.dispatchEvent(new PopStateEvent("popstate"));
    } catch {
      setError("Invalid email or password");
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16 text-white">
      <form onSubmit={handleSubmit} className="mx-auto max-w-sm rounded-lg bg-white p-6 text-slate-950 shadow-xl">
        <h1 className="text-2xl font-bold">Admin Login</h1>
        <input
          className="mt-6 w-full rounded border px-3 py-2"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          className="mt-3 w-full rounded border px-3 py-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        <button className="mt-5 w-full rounded bg-red-600 px-4 py-2 font-bold text-white">Login</button>
      </form>
    </main>
  );
}
```

## 9. Example Generic Admin List

```tsx
import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";

type Service = {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  is_active: number;
};

export function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");

  async function loadServices() {
    setServices(await adminApi<Service[]>("/services"));
  }

  useEffect(() => {
    loadServices();
  }, []);

  async function addService(event: React.FormEvent) {
    event.preventDefault();
    await adminApi("/services", {
      method: "POST",
      body: JSON.stringify({ name, short_description: shortDescription, is_active: 1 }),
    });
    setName("");
    setShortDescription("");
    loadServices();
  }

  async function deleteService(id: number) {
    if (!confirm("Delete this service?")) return;
    await adminApi(`/services/${id}`, { method: "DELETE" });
    loadServices();
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Services</h1>

      <form onSubmit={addService} className="mt-6 grid gap-3 rounded border p-4">
        <input className="rounded border px-3 py-2" placeholder="Service name" value={name} onChange={(e) => setName(e.target.value)} />
        <textarea className="rounded border px-3 py-2" placeholder="Short description" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
        <button className="rounded bg-red-600 px-4 py-2 font-bold text-white">Add Service</button>
      </form>

      <table className="mt-6 w-full border-collapse text-left">
        <thead>
          <tr>
            <th className="border p-3">Name</th>
            <th className="border p-3">Slug</th>
            <th className="border p-3">Status</th>
            <th className="border p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.id}>
              <td className="border p-3">{service.name}</td>
              <td className="border p-3">{service.slug}</td>
              <td className="border p-3">{service.is_active ? "Active" : "Hidden"}</td>
              <td className="border p-3">
                <button className="rounded bg-slate-900 px-3 py-1 text-white">Edit</button>
                <button onClick={() => deleteService(service.id)} className="ml-2 rounded bg-red-600 px-3 py-1 text-white">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
```

## 10. Deployment Notes

- Host the React frontend as usual after `npm run build`.
- Host the `api` folder on a Node-capable server.
- Use a real MySQL database on the same server or managed hosting.
- Set production `CLIENT_URL` to the live domain.
- Use HTTPS.
- Keep `.env` files out of git.
- Store uploaded images in a persistent folder or cloud storage such as S3/Cloudinary for production.

## 11. Suggested Build Order

1. Create the MySQL database and tables.
2. Create the Express API and test `/health`.
3. Create the first admin user.
4. Build login page.
5. Build CRUD for services.
6. Repeat the same CRUD pattern for categories, products, gallery, blogs, industries, clients, and testimonials.
7. Replace static frontend data with `/api/public/...` calls.
8. Deploy backend and frontend.
