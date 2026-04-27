import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const reviewsTable = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id"),
  authorName: text("author_name").notNull(),
  authorLocation: text("author_location").notNull(),
  avatarUrl: text("avatar_url").notNull(),
  rating: integer("rating").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Review = typeof reviewsTable.$inferSelect;
