"use server";

import { UserRole } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { signIn, signOut } from "@/auth";
import {
  AuthConflictError,
  AuthInvalidCredentialsError,
  AuthRoleError,
  login,
  signupStudent,
} from "@/lib/services/auth";
import { credentialsSchema, signupSchema } from "@/lib/validation/auth";

export async function signupStudentAction(formData: FormData) {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    redirect("/auth?mode=signup&error=invalid_signup");
  }

  const email = parsed.data.email.toLowerCase();

  try {
    await signupStudent(email, parsed.data.password);
  } catch (error) {
    if (error instanceof AuthConflictError) {
      redirect("/auth?mode=signup&error=email_exists");
    }

    throw error;
  }

  const result = await signIn("credentials", {
    email,
    password: parsed.data.password,
    redirect: false,
  });

  if (result?.error) {
    redirect("/auth?error=login_failed");
  }

  const cookieStore = await cookies();
  cookieStore.set("lb-role", UserRole.STUDENT, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  redirect("/student");
}

export async function loginAction(formData: FormData) {
  const parsed = credentialsSchema.omit({ expectedRole: true }).safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect("/auth?mode=login&error=invalid_credentials");
  }

  const email = parsed.data.email.toLowerCase();

  let user: { id: string; email: string; role: UserRole };
  try {
    user = await login(email, parsed.data.password);
  } catch (error) {
    if (error instanceof AuthInvalidCredentialsError) {
      redirect("/auth?mode=login&error=invalid_credentials");
    }

    throw error;
  }

  const result = await signIn("credentials", {
    email,
    password: parsed.data.password,
    redirect: false,
  });

  if (result?.error) {
    redirect("/auth?mode=login&error=invalid_credentials");
  }

  const cookieStore = await cookies();
  cookieStore.set("lb-role", user.role, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  if (user.role === UserRole.ADMIN) {
    redirect("/admin");
  }

  redirect("/student");
}

export async function adminLoginAction(formData: FormData) {
  const parsed = credentialsSchema.omit({ expectedRole: true }).safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect("/admin/login?error=invalid_credentials");
  }

  const email = parsed.data.email.toLowerCase();

  let user: { id: string; email: string; role: UserRole };
  try {
    user = await login(email, parsed.data.password, UserRole.ADMIN);
  } catch (error) {
    if (error instanceof AuthRoleError) {
      redirect("/admin/login?error=admin_only");
    }

    if (error instanceof AuthInvalidCredentialsError) {
      redirect("/admin/login?error=invalid_credentials");
    }

    throw error;
  }

  const result = await signIn("credentials", {
    email,
    password: parsed.data.password,
    expectedRole: UserRole.ADMIN,
    redirect: false,
  });

  if (result?.error) {
    redirect("/admin/login?error=invalid_credentials");
  }

  const cookieStore = await cookies();
  cookieStore.set("lb-role", user.role, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  redirect("/admin");
}

export async function logoutAction() {
  await signOut({ redirect: false });

  const cookieStore = await cookies();
  cookieStore.delete("lb-role");

  redirect("/auth");
}
