import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, adminUsersTable } from "@workspace/db";
import {
  clearSessionCookie,
  createSessionToken,
  requireAdmin,
  setSessionCookie,
  toAdminDto,
  verifyPassword,
  type AdminRequest,
} from "../lib/admin-auth";

const router: IRouter = Router();

router.post("/admin/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string") {
    res.status(400).json({ error: "Email and password required" });
    return;
  }
  const [admin] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.email, email.toLowerCase().trim()))
    .limit(1);
  if (!admin || !verifyPassword(password, admin.passwordHash)) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  const token = createSessionToken(admin.id);
  setSessionCookie(res, token);
  res.json({ admin: toAdminDto(admin) });
});

router.post("/admin/logout", (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

router.get("/admin/me", requireAdmin, (req, res) => {
  const r = req as AdminRequest;
  res.json({ admin: toAdminDto(r.admin!) });
});

router.put("/admin/profile", requireAdmin, async (req, res) => {
  const r = req as AdminRequest;
  const { name, email } = req.body ?? {};
  if (typeof name !== "string" || !name.trim()) {
    res.status(400).json({ error: "Name is required" });
    return;
  }
  if (typeof email !== "string" || !email.includes("@")) {
    res.status(400).json({ error: "Valid email is required" });
    return;
  }
  const [existing] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.email, email.toLowerCase().trim()))
    .limit(1);
  if (existing && existing.id !== r.admin!.id) {
    res.status(400).json({ error: "Email already in use by another account" });
    return;
  }
  const [updated] = await db
    .update(adminUsersTable)
    .set({ name: name.trim(), email: email.toLowerCase().trim() })
    .where(eq(adminUsersTable.id, r.admin!.id))
    .returning();
  res.json({ admin: toAdminDto(updated!) });
});

router.put("/admin/password", requireAdmin, async (req, res) => {
  const r = req as AdminRequest;
  const { currentPassword, newPassword } = req.body ?? {};
  if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
    res.status(400).json({ error: "Current and new password required" });
    return;
  }
  if (!verifyPassword(currentPassword, r.admin!.passwordHash)) {
    res.status(401).json({ error: "Current password is incorrect" });
    return;
  }
  if (newPassword.length < 8) {
    res.status(400).json({ error: "New password must be at least 8 characters" });
    return;
  }
  const passwordHash = hashPassword(newPassword);
  await db
    .update(adminUsersTable)
    .set({ passwordHash })
    .where(eq(adminUsersTable.id, r.admin!.id));
  res.json({ ok: true });
});

export default router;
