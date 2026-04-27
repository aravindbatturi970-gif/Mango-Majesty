import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const cartItemsTable = pgTable("cart_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: text("session_id").notNull(),
  productId: uuid("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type CartItemRow = typeof cartItemsTable.$inferSelect;
