import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db/prisma";

export class AuthConflictError extends Error {
  constructor(message = "User already exists") {
    super(message);
    this.name = "AuthConflictError";
  }
}

export class AuthInvalidCredentialsError extends Error {
  constructor(message = "Invalid credentials") {
    super(message);
    this.name = "AuthInvalidCredentialsError";
  }
}

export class AuthRoleError extends Error {
  constructor(message = "Invalid role for login") {
    super(message);
    this.name = "AuthRoleError";
  }
}

export async function upsertUserCredentials(email: string, password: string, role: UserRole) {
  const normalizedEmail = email.toLowerCase();
  const passwordHash = await bcrypt.hash(password, 12);

  return prisma.user.upsert({
    where: { email: normalizedEmail },
    update: {
      role,
      passwordHash,
    },
    create: {
      email: normalizedEmail,
      role,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });
}

export async function signupStudent(email: string, password: string) {
  const normalizedEmail = email.toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (existingUser) {
    throw new AuthConflictError();
  }

  const passwordHash = await bcrypt.hash(password, 12);

  return prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      role: UserRole.STUDENT,
    },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });
}

export async function login(email: string, password: string, expectedRole?: UserRole) {
  const normalizedEmail = email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      role: true,
    },
  });

  if (!user || !user.passwordHash) {
    throw new AuthInvalidCredentialsError();
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    throw new AuthInvalidCredentialsError();
  }

  if (expectedRole && user.role !== expectedRole) {
    throw new AuthRoleError();
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}
