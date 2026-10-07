import bcrypt from "bcrypt";

import { pool } from "../db.js";

const name = process.argv[2];
const email = process.argv[3];
const password = process.argv[4];

if (!name || !email || !password) {
  console.log('Usage: npm run create-admin -- "Admin" admin@example.com password123');
  process.exit(1);
}

const passwordHash = await bcrypt.hash(password, 12);

await pool.execute(
  `INSERT INTO admins (name, email, password_hash, status)
   VALUES (?, ?, ?, 'ACTIVE')
   ON DUPLICATE KEY UPDATE
     name = VALUES(name),
     password_hash = VALUES(password_hash),
     status = 'ACTIVE'`,
  [name, email, passwordHash],
);

console.log("Admin created or updated");
process.exit(0);
