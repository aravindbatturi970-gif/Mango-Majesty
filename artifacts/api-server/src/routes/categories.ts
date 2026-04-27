import { Router, type IRouter } from "express";
import { db, categoriesTable } from "@workspace/db";
import { ListCategoriesResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/categories", async (_req, res): Promise<void> => {
  const rows = await db.select().from(categoriesTable).orderBy(categoriesTable.name);
  res.json(
    ListCategoriesResponse.parse(
      rows.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        description: c.description,
        emoji: c.emoji ?? undefined,
      })),
    ),
  );
});

export default router;
