import { db } from "@/db/drizzle";
import type { IUser } from "@/db/schema";
import { users } from "@/db/schema";
import {
  clearRefreshCookie,
  clearUidCookie,
  getRefreshTokenCookie,
  getUidCookie,
  setRefreshTokenCookie,
  setUidCookie,
} from "@/lib/cookies";
import { newRandomToken, sha256 } from "@/lib/crypto";
import type { JWTPayload } from "@/lib/jwt";
import { signAccessToken, verifyAccessToken } from "@/lib/jwt";
import { redis } from "@/lib/redis";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

const REFRESH_TTL = Number(
  process.env.REFRESH_TOKEN_TTL_SECONDS ?? 60 * 60 * 24 * 30
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

export async function findUserById(userId: string): Promise<IUser | null> {
  try {
    const [u] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return u ?? null;
  } catch (error) {
    console.error("Error finding user by id:", error);
    return null;
  }
}

export async function issueTokens(user: Pick<IUser, "id" | "role">) {
  if (!user.id || !user.role) {
    throw new Error("Cannot issue tokens without user id and role");
  }
  const jwtPayload: JWTPayload = { sub: user.id, role: user.role };
  const accessToken = await signAccessToken(jwtPayload);

  const rtRaw = newRandomToken(32);
  const rtHash = sha256(rtRaw);
  await Promise.all([
    redis.set(`refresh:${user.id}`, rtHash, "EX", REFRESH_TTL),
    setRefreshTokenCookie(rtRaw, REFRESH_TTL),
    setUidCookie(user.id, REFRESH_TTL),
  ]);

  return { accessToken };
}

export async function rotateRefreshTokenFromCookie() {
  const [uid, presentRt] = await Promise.all([
    getUidCookie(),
    getRefreshTokenCookie(),
  ]);
  if (!uid || !presentRt) {
    throw new Error("Invalid refresh token");
  }

  const stored = await redis.get(`refresh:${uid}`);
  if (stored !== sha256(presentRt)) {
    throw new Error("Invalid refresh token");
  }

  const newRtRaw = newRandomToken(32);
  const newRtHash = sha256(newRtRaw);
  const updatesPromise = Promise.all([
    redis.set(`refresh:${uid}`, newRtHash, "EX", REFRESH_TTL),
    setRefreshTokenCookie(newRtRaw, REFRESH_TTL),
    setUidCookie(uid, REFRESH_TTL),
  ]);

  const [_, user] = await Promise.all([updatesPromise, findUserById(uid)]);
  if (!user) {
    throw new Error("User not found");
  }
  if (!user.role) {
    throw new Error("User role missing");
  }
  const jwtPayload: JWTPayload = { sub: uid, role: user.role };
  const accessToken = await signAccessToken(jwtPayload);

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
