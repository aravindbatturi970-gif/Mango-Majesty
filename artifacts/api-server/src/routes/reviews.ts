import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, reviewsTable } from "@workspace/db";
import { ListReviewsQueryParams, ListReviewsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/reviews", async (req, res): Promise<void> => {
  const params = ListReviewsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const rows = await db
    .select()
    .from(reviewsTable)
    .where(
      params.data.productId
        ? eq(reviewsTable.productId, params.data.productId)
        : undefined,
    )
    .orderBy(desc(reviewsTable.createdAt));

  res.json(
    ListReviewsResponse.parse(
      rows.map((r) => ({
        id: r.id,
        productId: r.productId ?? undefined,
        authorName: r.authorName,
        authorLocation: r.authorLocation,
        avatarUrl: r.avatarUrl,
        rating: r.rating,
        title: r.title,
        body: r.body,
        createdAt: r.createdAt.toISOString(),
      })),
    ),
  );
});

export default router;
