import { NextResponse } from "next/server";
import { revokeRefreshFromCookies } from "@/lib/auth";

export async function POST() {
  await revokeRefreshFromCookies();
  return NextResponse.json({ ok: true });
}
