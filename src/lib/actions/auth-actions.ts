"use server";

import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

import { signIn, signOut } from "@/auth";
import {
  AuthInvalidCredentialsError,
  AuthRoleError,
  login,
} from "@/lib/services/auth";
import { credentialsSchema, signupSchema } from "@/lib/validation/auth";

export async function signupStudentAction(formData: FormData) {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    redirect("/auth?error=invalid_signup");
  }

  redirect("/auth?error=signup_disabled");
}

export async function loginAction(formData: FormData) {
  const parsed = credentialsSchema.omit({ expectedRole: true }).safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect("/auth?error=invalid_credentials");
  }

  const email = parsed.data.email.toLowerCase();

  let user: { id: string; email: string; role: UserRole };
  try {
    user = await login(email, parsed.data.password);
  } catch (error) {
    if (error instanceof AuthInvalidCredentialsError) {
      redirect("/auth?error=invalid_credentials");
    }

    throw error;
  }

  const result = await signIn("credentials", {
    email,
    password: parsed.data.password,
    redirect: false,
  });

  if (result?.error) {
    redirect("/auth?error=invalid_credentials");
  }

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

  try {
    await login(email, parsed.data.password, UserRole.ADMIN);
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

  redirect("/admin");
}

export async function logoutAction() {
  await signOut({ redirect: false });

  redirect("/auth");
}
