import { text, sqliteTable, integer } from "drizzle-orm/sqlite-core";
import type { FunctionRuntime, JobType, ScheduleType } from "./types";
import { ulid } from "ulidx";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  //Q: Do I need to keep the names and email, or just get it from the auth provider? What if those values change, how do I update them (e.g. webhook)?
  firstName: text("first_name", { length: 100 }),
  lastName: text("last_name", { length: 100 }),
  email: text("email").unique().notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export type User = typeof users.$inferSelect;

export const subscriptions = sqliteTable("subscriptions", {
  id: text("id").primaryKey(),
  customerId: text("customer_id"),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade", onUpdate: "no action" })
    .notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export type Subscription = typeof subscriptions.$inferSelect;

export const jobs = sqliteTable("jobs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => ulid()),
  name: text("name", { length: 120 }).notNull(),
  jobType: text("job_type").$type<JobType>().notNull().default("url"),
  functionConfig: text("function_config", { mode: "json" }).$type<{
    runtime: FunctionRuntime;
    secrets?: string[];
  }>(),
  endpoint: text("endpoint", { mode: "json" })
    .$type<{
      url: string;
      headers?: Record<string, string>;
      payload?: string;
      httpMethod?: "GET" | "POST" | "PUT";
    }>()
    .notNull(),
  schedule: text("schedule", { mode: "json" })
    .notNull()
    .$type<{ type: ScheduleType; value: string }>(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade", onUpdate: "no action" })
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export type Job = typeof jobs.$inferSelect;
