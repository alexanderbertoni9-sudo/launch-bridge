import { NextResponse } from "next/server";

import { AuthConflictError, signupStudent } from "@/lib/services/auth";
import { signupSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    await signupStudent(parsed.data.email, parsed.data.password);
  } catch (error) {
    if (error instanceof AuthConflictError) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    throw error;
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
