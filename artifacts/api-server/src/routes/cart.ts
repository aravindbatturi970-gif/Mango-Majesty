import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, cartItemsTable, productsTable } from "@workspace/db";
import {
  AddCartItemBody,
  AddCartItemResponse,
  GetCartQueryParams,
  GetCartResponse,
  RemoveCartItemParams,
  RemoveCartItemQueryParams,
  RemoveCartItemResponse,
  UpdateCartItemBody,
  UpdateCartItemParams,
  UpdateCartItemResponse,
} from "@workspace/api-zod";
import { buildCart, findCartItem } from "../lib/cart";

const router: IRouter = Router();

router.get("/cart", async (req, res): Promise<void> => {
  const params = GetCartQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const cart = await buildCart(params.data.sessionId);
  res.json(GetCartResponse.parse(cart));
});

router.post("/cart/items", async (req, res): Promise<void> => {
  const body = AddCartItemBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, body.data.productId));
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const existing = await findCartItem(body.data.sessionId, body.data.productId);
  if (existing) {
    await db
      .update(cartItemsTable)
      .set({ quantity: existing.quantity + body.data.quantity })
      .where(eq(cartItemsTable.id, existing.id));
  } else {
    await db.insert(cartItemsTable).values({
      sessionId: body.data.sessionId,
      productId: body.data.productId,
      quantity: body.data.quantity,
    });
  }

  const cart = await buildCart(body.data.sessionId);
  res.json(AddCartItemResponse.parse(cart));
});

router.patch("/cart/items/:itemId", async (req, res): Promise<void> => {
  const params = UpdateCartItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateCartItemBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(cartItemsTable)
    .where(
      and(
        eq(cartItemsTable.id, params.data.itemId),
        eq(cartItemsTable.sessionId, body.data.sessionId),
      ),
    );

  if (!existing) {
    res.status(404).json({ error: "Cart item not found" });
    return;
  }

  if (body.data.quantity === 0) {
    await db.delete(cartItemsTable).where(eq(cartItemsTable.id, existing.id));
  } else {
    await db
      .update(cartItemsTable)
      .set({ quantity: body.data.quantity })
      .where(eq(cartItemsTable.id, existing.id));
  }

  const cart = await buildCart(body.data.sessionId);
  res.json(UpdateCartItemResponse.parse(cart));
});

router.delete("/cart/items/:itemId", async (req, res): Promise<void> => {
  const params = RemoveCartItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const query = RemoveCartItemQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  await db
    .delete(cartItemsTable)
    .where(
      and(
        eq(cartItemsTable.id, params.data.itemId),
        eq(cartItemsTable.sessionId, query.data.sessionId),
      ),
    );

  const cart = await buildCart(query.data.sessionId);
  res.json(RemoveCartItemResponse.parse(cart));
});

export default router;
