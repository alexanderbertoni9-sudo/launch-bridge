"use server";

import type { Route } from "next";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

import { signIn, signOut } from "@/auth";
import {
  AuthInvalidCredentialsError,
  AuthRoleError,
  login,
} from "@/lib/services/auth";
import { credentialsSchema, signupSchema } from "@/lib/validation/auth";

function buildAuthUrl(role: UserRole, error?: string): Route {
  const params = new URLSearchParams({ role });
  if (error) {
    params.set("error", error);
  }

  return `/auth?${params.toString()}` as Route;
}

function resolveRequestedRole(value: FormDataEntryValue | null): UserRole {
  return value === UserRole.ADMIN ? UserRole.ADMIN : UserRole.STUDENT;
}

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
  const requestedRole = resolveRequestedRole(formData.get("expectedRole"));

  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    expectedRole: requestedRole,
  });

  if (!parsed.success) {
    redirect(buildAuthUrl(requestedRole, "invalid_credentials"));
  }

  const role = parsed.data.expectedRole ?? UserRole.STUDENT;
  const email = parsed.data.email.toLowerCase();

  try {
    await login(email, parsed.data.password, role);
  } catch (error) {
    if (error instanceof AuthRoleError) {
      redirect(buildAuthUrl(role, "role_mismatch"));
    }

    if (error instanceof AuthInvalidCredentialsError) {
      redirect(buildAuthUrl(role, "invalid_credentials"));
    }

    throw error;
  }

  const result = await signIn("credentials", {
    email,
    password: parsed.data.password,
    expectedRole: role,
    redirect: false,
  });

  if (result?.error) {
    redirect(buildAuthUrl(role, "invalid_credentials"));
  }

  if (role === UserRole.ADMIN) {
    redirect("/admin");
  }

  redirect("/student");
}

export async function adminLoginAction(formData: FormData) {
  formData.set("expectedRole", UserRole.ADMIN);
  await loginAction(formData);
}

export async function logoutAction() {
  await signOut({ redirect: false });

  redirect("/auth");
}
