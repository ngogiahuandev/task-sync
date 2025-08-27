import { boolean, pgTable, text, uuid } from "drizzle-orm/pg-core";

export const roles = pgTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  isDefault: boolean("is_default").notNull().default(false),
});
export type IRole = typeof roles.$inferSelect;

export const rolePermissions = pgTable("role_permission", {
  id: uuid("id").primaryKey().defaultRandom(),
  roleId: uuid("role_id").references(() => roles.id),
  permissionId: uuid("permission_id").references(() => permissions.id),
});
export type IRolePermission = typeof rolePermissions.$inferSelect;

export const permissions = pgTable("permissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
});
export type IPermission = typeof permissions.$inferSelect;
