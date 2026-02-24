import { UserRole } from "@prisma/client";
import { forbidden, redirect } from "next/navigation";

import { auth } from "@/auth";

export async function requireSignedInUser() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth");
  }

  return session.user;
}

export async function requireRole(role: UserRole) {
  const user = await requireSignedInUser();

  if (user.role !== role) {
    forbidden();
  }

  return user;
}

export async function requireAdminOrStudent() {
  const user = await requireSignedInUser();

  if (user.role !== UserRole.ADMIN && user.role !== UserRole.STUDENT) {
    forbidden();
  }

  return user;
}
