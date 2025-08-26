import * as argon from "argon2";
import { createHash, randomBytes } from "crypto";

export async function hashPassword(pw: string) {
  return argon.hash(pw);
}

export async function verifyPassword(hash: string, pw: string) {
  return argon.verify(hash, pw);
}

export function newRandomToken(bytes = 32) {
  return randomBytes(bytes).toString("hex");
}

export function sha256(input: string) {
  return createHash("sha256").update(input).digest("hex");
}
