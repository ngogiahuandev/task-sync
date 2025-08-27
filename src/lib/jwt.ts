import { jwtVerify, SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const ttl = process.env.ACCESS_TOKEN_TTL || "15m";

export type JWTPayload = {
  sub: string;
  role: string;
};

export async function signAccessToken(payload: JWTPayload) {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(ttl)
    .sign(secret);
}

export async function verifyAccessToken<T = unknown>(token: string) {
  const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
  return payload as JWTPayload & T;
}
