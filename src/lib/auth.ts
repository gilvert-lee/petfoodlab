import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE = "pfl_admin";
const SECRET = process.env.ADMIN_SESSION_SECRET ?? "dev-secret-change-me";
const PASSWORD = process.env.ADMIN_PASSWORD ?? "petfoodlab";

function sign(payload: string) {
  return createHmac("sha256", SECRET).update(payload).digest("hex");
}

export function makeSessionToken() {
  const payload = `admin.${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const idx = token.lastIndexOf(".");
  if (idx < 0) return false;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = sign(payload);
  if (sig.length !== expected.length) return false;
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  const ts = Number(payload.split(".")[1]);
  // 30일 유효
  return Date.now() - ts < 30 * 24 * 3600 * 1000;
}

export function checkPassword(input: string) {
  const a = Buffer.from(input);
  const b = Buffer.from(PASSWORD);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function isAdmin() {
  const c = await cookies();
  return verifySessionToken(c.get(COOKIE)?.value);
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function setAdminCookie() {
  const c = await cookies();
  c.set(COOKIE, makeSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30 * 24 * 3600,
  });
}

export async function clearAdminCookie() {
  const c = await cookies();
  c.delete(COOKIE);
}
