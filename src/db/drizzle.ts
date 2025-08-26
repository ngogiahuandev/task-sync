import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

const connectionString = process.env.DATABASE_URL!;
export const sql = postgres(connectionString, { ssl: false });
export const db = drizzle(sql);
