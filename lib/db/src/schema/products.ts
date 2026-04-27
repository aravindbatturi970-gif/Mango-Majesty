import {
  boolean,
  integer,
  numeric,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";

export const productsTable = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  variety: text("variety").notNull(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  unit: text("unit").notNull(),
  imageUrl: text("image_url").notNull(),
  gallery: text("gallery").array().notNull().default([]),
  origin: text("origin").notNull(),
  sweetness: integer("sweetness").notNull(),
  rating: numeric("rating", { precision: 3, scale: 2 }).notNull(),
  reviewCount: integer("review_count").notNull().default(0),
  stock: integer("stock").notNull().default(0),
  deliveryEtaHours: integer("delivery_eta_hours").notNull().default(24),
  badge: text("badge"),
  categorySlug: text("category_slug").notNull(),
  isBestSeller: boolean("is_best_seller").notNull().default(false),
  isOrganic: boolean("is_organic").notNull().default(false),
  popularity: integer("popularity").notNull().default(0),
  tags: text("tags").array().notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
});

export type Product = typeof productsTable.$inferSelect;
