import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { getUserIdFromAuthHeader } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const uid = await getUserIdFromAuthHeader(req);
  if (!uid)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [u] = await db.select().from(users).where(eq(users.id, uid)).limit(1);
  if (!u)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { password, ...userData } = u;

  return NextResponse.json(userData);
}
