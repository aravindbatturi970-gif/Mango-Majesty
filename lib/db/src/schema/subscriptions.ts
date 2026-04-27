import {
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const subscriptionPlansTable = pgTable("subscription_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  weeklyPrice: numeric("weekly_price", { precision: 10, scale: 2 }).notNull(),
  boxesPerWeek: integer("boxes_per_week").notNull(),
  varieties: text("varieties").array().notNull().default([]),
  perks: text("perks").array().notNull().default([]),
  imageUrl: text("image_url").notNull(),
});

export const subscriptionsTable = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  planId: uuid("plan_id").notNull(),
  customerName: text("customer_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type SubscriptionPlanRow = typeof subscriptionPlansTable.$inferSelect;
export type SubscriptionRow = typeof subscriptionsTable.$inferSelect;
