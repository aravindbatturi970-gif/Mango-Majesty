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

export default router;
