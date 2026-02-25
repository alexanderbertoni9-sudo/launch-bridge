"use server";

import type { Route } from "next";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

import { signIn, signOut } from "@/auth";
import {
  AuthInvalidCredentialsError,
  AuthRoleError,
  login,
  upsertUserCredentials,
} from "@/lib/services/auth";
import { credentialsSchema, signupSchema } from "@/lib/validation/auth";

function buildAuthUrl(role: UserRole, error?: string): Route {
  const params = new URLSearchParams({ role });
  if (error) {
    params.set("error", error);
  }

  return `/auth?${params.toString()}` as Route;
}

function buildSuccessUrl(role: UserRole): Route {
  const params = new URLSearchParams({ role });
  return `/auth/success?${params.toString()}` as Route;
}

function resolveRequestedRole(value: FormDataEntryValue | null): UserRole {
  return value === UserRole.ADMIN ? UserRole.ADMIN : UserRole.STUDENT;
}

function getDemoCredentials(role: UserRole) {
  if (role === UserRole.ADMIN) {
    return {
      email: process.env.DEMO_ADMIN_EMAIL,
      password: process.env.DEMO_ADMIN_PASSWORD,
    };
  }

  return {
    email: process.env.DEMO_STUDENT_EMAIL,
    password: process.env.DEMO_STUDENT_PASSWORD,
  };
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

  redirect(buildSuccessUrl(role));
}

export async function adminLoginAction(formData: FormData) {
  formData.set("expectedRole", UserRole.ADMIN);
  await loginAction(formData);
}

export async function quickDemoLoginAction(formData: FormData) {
  const role = resolveRequestedRole(formData.get("expectedRole"));
  const credentials = getDemoCredentials(role);
  const email = credentials.email?.trim().toLowerCase();
  const password = credentials.password?.trim();

  if (!email || !password) {
    redirect(buildAuthUrl(role, "demo_not_configured"));
  }

  const parsed = credentialsSchema.safeParse({
    email,
    password,
    expectedRole: role,
  });

  if (!parsed.success) {
    redirect(buildAuthUrl(role, "demo_not_configured"));
  }

  let needsSync = false;

  try {
    await login(email, password, role);
  } catch (error) {
    if (error instanceof AuthRoleError || error instanceof AuthInvalidCredentialsError) {
      needsSync = true;
    } else {
      throw error;
    }
  }

  if (needsSync) {
    try {
      await upsertUserCredentials(email, password, role);
    } catch {
      redirect(buildAuthUrl(role, "demo_sync_failed"));
    }
  }

  const result = await signIn("credentials", {
    email,
    password,
    expectedRole: role,
    redirect: false,
  });

  if (result?.error) {
    redirect(buildAuthUrl(role, "demo_sync_failed"));
  }

  redirect(buildSuccessUrl(role));
}

export async function logoutAction() {
  await signOut({ redirect: false });

  redirect("/auth");
}
