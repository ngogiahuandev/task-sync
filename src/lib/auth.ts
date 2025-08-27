import { db } from "@/db/drizzle";
import { IUser, users } from "@/db/schema";
import {
  clearRefreshCookie,
  clearUidCookie,
  getRefreshTokenCookie,
  getUidCookie,
  setRefreshTokenCookie,
  setUidCookie,
} from "@/lib/cookies";
import { newRandomToken, sha256 } from "@/lib/crypto";
import { signAccessToken, verifyAccessToken } from "@/lib/jwt";
import { redis } from "@/lib/redis";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

const REFRESH_TTL = Number(
  process.env.REFRESH_TOKEN_TTL_SECONDS ?? 60 * 60 * 24 * 30,
);

export async function findUserByEmail(email: string): Promise<IUser | null> {
  try {
    const [u] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return u ?? null;
  } catch (error) {
    console.error("Error finding user by email:", error);
    return null;
  }
}

export async function issueTokens(userId: string) {
  const accessToken = await signAccessToken({ sub: userId });

  const rtRaw = newRandomToken(32);
  const rtHash = sha256(rtRaw);
  await redis.set(`refresh:${userId}`, rtHash, "EX", REFRESH_TTL);

  await setRefreshTokenCookie(rtRaw, REFRESH_TTL);
  await setUidCookie(userId, REFRESH_TTL);

  return { accessToken };
}

export async function rotateRefreshTokenFromCookie() {
  const uid = await getUidCookie();
  const presentRt = await getRefreshTokenCookie();
  if (!uid || !presentRt) {
    throw new Error("Invalid refresh token");
  }

  const stored = await redis.get(`refresh:${uid}`);
  if (stored !== sha256(presentRt)) {
    throw new Error("Invalid refresh token");
  }

  const newRtRaw = newRandomToken(32);
  const newRtHash = sha256(newRtRaw);
  await redis.set(`refresh:${uid}`, newRtHash, "EX", REFRESH_TTL);
  await setRefreshTokenCookie(newRtRaw, REFRESH_TTL);
  await setUidCookie(uid, REFRESH_TTL);
  const accessToken = await signAccessToken({ sub: uid });

  return { accessToken };
}

export async function revokeRefreshFromCookies() {
  const uid = await getUidCookie();
  if (uid) await redis.del(`refresh:${uid}`);
  await Promise.all([clearRefreshCookie(), clearUidCookie()]);
}

export async function getUserIdFromAuthHeader(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const [type, token] = auth?.split(" ") ?? [];
  if (type !== "Bearer" || token.length === 0) {
    return null;
  }

  try {
    const payload = await verifyAccessToken(token);
    return payload.sub;
  } catch {
    return null;
  }
}
