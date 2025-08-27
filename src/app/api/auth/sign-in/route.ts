import { findUserByEmail, issueTokens } from "@/lib/auth";
import { verifyPassword } from "@/lib/crypto";
import { SignInResponse } from "@/types/auth";
import { signInSchema } from "@/zod/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request): Promise<NextResponse> {
  const body = await req.json().catch(() => ({}));
  const parsed = signInSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const user = await findUserByEmail(parsed.data.email);
  if (!user)
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });

  const ok = await verifyPassword(user.password, parsed.data.password);
  if (!ok)
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });

  const { accessToken } = await issueTokens(user.id!);
  const { password, ...userData } = user;
  return NextResponse.json<SignInResponse>(
    {
      accessToken,
      user: userData,
    },
    { status: 201 },
  );
}
