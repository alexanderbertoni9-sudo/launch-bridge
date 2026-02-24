import { UserRole } from "@prisma/client";
import { forbidden, redirect } from "next/navigation";

import { auth } from "@/auth";

export async function requireSignedInUser(redirectTo = "/auth") {
  const session = await auth();

  if (!session?.user) {
    redirect(redirectTo);
  }

  return session.user;
}

export async function requireRole(role: UserRole, redirectTo = "/auth") {
  const user = await requireSignedInUser(redirectTo);

  if (user.role !== role) {
    forbidden();
  }

  return user;
}

export async function requireStudentSession() {
  return requireRole(UserRole.STUDENT, "/auth");
}

export async function requireAdminSession() {
  return requireRole(UserRole.ADMIN, "/admin/login");
}
