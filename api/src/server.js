import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { existsSync } from "node:fs";
import path from "path";
import { fileURLToPath } from "url";

import { authRoutes } from "./routes/auth.routes.js";
import { crudRoutes } from "./routes/crud.routes.js";
import { publicRoutes } from "./routes/public.routes.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, "../../dist");
const frontendIndex = path.join(frontendDir, "index.html");
const hasFrontend = existsSync(frontendIndex);

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

if (!hasFrontend) app.get("/", (_req, res) =>
  res.json({
    ok: true,
    name: "Shivrudra Graphics API",
    health: "/health",
    publicApi: "/api/public/homepage",
  }),
);
app.get("/api/health", async (_req, res) => {
  try {
    const { pool } = await import("./db.js");
    await pool.query("SELECT 1");
    res.json({ success: true, database: "connected" });
  } catch (error) {
    res.status(500).json({ success: false, database: "disconnected", message: error.message });
  }
});
app.get("/health", (_req, res) => res.json({ success: true }));
app.use("/api/auth", authRoutes);
app.use("/api/admin", crudRoutes);
app.use("/api/public", publicRoutes);

app.use("/api", (_req, res) => {
  res.status(404).json({ success: false, message: "API route not found" });
});

if (hasFrontend) {
  app.use(express.static(frontendDir));
  app.get(/^(?!\/(?:api|uploads|assets)(?:\/|$)).*/, (_req, res) => {
    res.sendFile(frontendIndex);
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({ success: false, message: err.message || "Server error", details: err.details });
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`API running on http://localhost:${process.env.PORT || 5000}`);
});
