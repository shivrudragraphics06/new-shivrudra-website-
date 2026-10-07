import bcrypt from "bcrypt";
import { Router } from "express";
import jwt from "jsonwebtoken";

import { pool } from "../db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authRoutes = Router();

authRoutes.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const [rows] = await pool.execute("SELECT * FROM admins WHERE email = ? AND status = 'ACTIVE'", [email]);
    const admin = rows[0];

    if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    await pool.execute("UPDATE admins SET last_login_at = NOW() WHERE id = ?", [admin.id]);

    res.json({
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email },
    });
  }),
);
