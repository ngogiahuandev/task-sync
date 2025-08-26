import { rotateRefreshTokenFromCookie } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const { accessToken } = await rotateRefreshTokenFromCookie();
    return NextResponse.json({ accessToken });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unauthorized" },
      { status: 401 }
    );
  }
}
