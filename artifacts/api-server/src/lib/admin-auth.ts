import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db, adminUsersTable, type AdminUser } from "@workspace/db";

const SESSION_SECRET = process.env["SESSION_SECRET"] ?? "dev-fallback-secret";
const SESSION_COOKIE = "aamras_admin";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = scryptSync(password, salt, 64);
  const stored_ = Buffer.from(hash, "hex");
  if (derived.length !== stored_.length) return false;
  return timingSafeEqual(derived, stored_);
}

function sign(value: string): string {
  return createHmac("sha256", SESSION_SECRET).update(value).digest("hex");
}

export function createSessionToken(adminId: string): string {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = `${adminId}.${expires}`;
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [adminId, expiresStr, sig] = parts;
  if (!adminId || !expiresStr || !sig) return null;
  const expected = sign(`${adminId}.${expiresStr}`);
  if (sig !== expected) return null;
  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || expires < Date.now()) return null;
  return adminId;
}

export function setSessionCookie(res: Response, token: string) {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: SESSION_TTL_MS,
    path: "/",
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}

export type AdminRequest = Request & { admin?: AdminUser };

export async function requireAdmin(
  req: AdminRequest,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token || typeof token !== "string") {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const adminId = verifySessionToken(token);
  if (!adminId) {
    res.status(401).json({ error: "Session expired" });
    return;
  }
  const [admin] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.id, adminId))
    .limit(1);
  if (!admin) {
    res.status(401).json({ error: "Account not found" });
    return;
  }
  req.admin = admin;
  next();
}

export function toAdminDto(admin: AdminUser) {
  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  };
}
