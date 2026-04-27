import { pgTable, text, uuid } from "drizzle-orm/pg-core";

export const categoriesTable = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  emoji: text("emoji"),
});

export type Category = typeof categoriesTable.$inferSelect;
