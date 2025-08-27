import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { roles, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/crypto";
import { issueTokens } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { SignUpResponse } from "@/types/auth";

const schema = z.object({
  email: z.email(),
  password: z.string().min(6),
  name: z.string().max(120),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.flatten },
      { status: 400 }
    );
  }

  const email = parsed.data.email.trim().toLowerCase();

  const [exists] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (exists)
    return NextResponse.json(
      { error: "Email already registered" },
      { status: 409 }
    );

  const passwordHash = await hashPassword(parsed.data.password);

  const [created] = await db
    .insert(users)
    .values({
      email,
      password: passwordHash,
      name: parsed.data.name,
      slug: slugify(parsed.data.name),
    })
    .returning();

  const { accessToken } = await issueTokens(created.id);
  const { password, ...userData } = created;

  return NextResponse.json<SignUpResponse>(
    { accessToken, user: userData },
    { status: 201 }
  );
}
