import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import {
  db,
  subscriptionPlansTable,
  subscriptionsTable,
} from "@workspace/db";
import {
  CreateSubscriptionBody,
  ListSubscriptionPlansResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/subscriptions/plans", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(subscriptionPlansTable)
    .orderBy(subscriptionPlansTable.weeklyPrice);

  res.json(
    ListSubscriptionPlansResponse.parse(
      rows.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        tagline: p.tagline,
        description: p.description,
        weeklyPrice: Number(p.weeklyPrice),
        boxesPerWeek: p.boxesPerWeek,
        varieties: p.varieties,
        perks: p.perks,
        imageUrl: p.imageUrl,
      })),
    ),
  );
});

router.post("/subscriptions", async (req, res): Promise<void> => {
  const body = CreateSubscriptionBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [plan] = await db
    .select()
    .from(subscriptionPlansTable)
    .where(eq(subscriptionPlansTable.id, body.data.planId));
  if (!plan) {
    res.status(404).json({ error: "Plan not found" });
    return;
  }

  const startDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const [sub] = await db
    .insert(subscriptionsTable)
    .values({
      planId: plan.id,
      customerName: body.data.customerName,
      email: body.data.email,
      phone: body.data.phone,
      startDate,
      status: "active",
    })
    .returning();

  res.status(201).json({
    id: sub.id,
    planId: sub.planId,
    customerName: sub.customerName,
    email: sub.email,
    phone: sub.phone,
    startDate: sub.startDate.toISOString(),
    status: sub.status,
    createdAt: sub.createdAt.toISOString(),
  });
});

export default router;
