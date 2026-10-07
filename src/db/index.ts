import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "node:path";
import fs from "node:fs";
import * as schema from "./schema";

const DB_PATH = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "petfoodlab.db");

declare global {
  // eslint-disable-next-line no-var
  var __pflDb: ReturnType<typeof createDb> | undefined;
}

function createDb() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const sqlite = new Database(DB_PATH);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite, { schema });
  // 앱 시작 시 마이그레이션 자동 적용 (drizzle/ 폴더)
  const migrationsFolder = path.join(process.cwd(), "drizzle");
  if (fs.existsSync(migrationsFolder)) {
    migrate(db, { migrationsFolder });
  }
  return db;
}

export const db = globalThis.__pflDb ?? createDb();
if (process.env.NODE_ENV !== "production") globalThis.__pflDb = db;

export { schema };
