import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const roles = pgEnum("role", ["admin", "regular"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: roles("role").notNull().default("regular"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
export type IUser = typeof users.$inferInsert;
