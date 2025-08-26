import { cookies } from "next/headers";

const name = process.env.REFRESH_COOKIE_NAME || "rt";
const uidName = `${name}_uid`;

export async function setRefreshTokenCookie(token: string, maxAgeSec: number) {
  const cookieStore = await cookies();
  cookieStore.set({
    name,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: maxAgeSec,
  });
}

export async function getRefreshTokenCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(name)?.value ?? null;
}

export async function clearRefreshCookie() {
  const cookieStore = await cookies();
  cookieStore.set({
    name,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });
}

export async function setUidCookie(uid: string, maxAgeSec: number) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: uidName,
    value: uid,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: maxAgeSec,
  });
}
export async function getUidCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(uidName)?.value ?? null;
}
export async function clearUidCookie() {
  const cookieStore = await cookies();
  cookieStore.set({
    name: uidName,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });
}
