import { readFile } from "node:fs/promises";
import dns from "node:dns";
import { Pool } from "pg";

dns.setDefaultResultOrder("ipv4first");

const databaseUrl = process.env.DATABASE_URL;

export const databaseConfigured = Boolean(databaseUrl);
export const pool = databaseConfigured
    ? new Pool({ connectionString: databaseUrl, max: Number(process.env.DB_POOL_SIZE || 10), ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: true } : undefined, family: 4 })
    : null;

export async function query(text, values = []) {
  if (!pool) throw new Error("DATABASE_URL is not configured");
  return pool.query(text, values);
}

export async function initializeDatabase() {
  if (!pool) return { configured: false, initialized: false };
  const schema = await readFile(new URL("./schema.sql", import.meta.url), "utf8");
  await pool.query(schema);
  return { configured: true, initialized: true };
}

