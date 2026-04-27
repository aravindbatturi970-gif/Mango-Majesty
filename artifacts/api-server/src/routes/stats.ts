import { Router, type IRouter } from "express";
import { count, eq, gte } from "drizzle-orm";
import {
  db,
  ordersTable,
  productsTable,
  subscriptionsTable,
} from "@workspace/db";
import { GetStatsSummaryResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stats/summary", async (_req, res): Promise<void> => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [varietyCountRow] = await db
    .select({ value: count() })
    .from(productsTable);

  const [todayOrdersRow] = await db
    .select({ value: count() })
    .from(ordersTable)
    .where(gte(ordersTable.createdAt, startOfDay));

  const [activeSubsRow] = await db
    .select({ value: count() })
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.status, "active"));

  const baseHappyCustomers = 12480;
  const baseOrdersToday = 247;

  res.json(
    GetStatsSummaryResponse.parse({
      varietiesCount: varietyCountRow.value,
      ordersToday: baseOrdersToday + todayOrdersRow.value,
      happyCustomers: baseHappyCustomers + activeSubsRow.value,
      averageDeliveryHours: 18,
      farmsPartnered: 42,
    }),
  );
});

export default router;
