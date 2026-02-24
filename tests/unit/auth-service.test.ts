import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
};

const bcryptMock = {
  compare: vi.fn(),
  hash: vi.fn(),
};

vi.mock("@/lib/db/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("bcryptjs", () => ({
  default: bcryptMock,
}));

import {
  AuthInvalidCredentialsError,
  AuthRoleError,
  login,
} from "@/lib/services/auth";

describe("auth service login", () => {
  beforeEach(() => {
    prismaMock.user.findUnique.mockReset();
    bcryptMock.compare.mockReset();
  });

  it("throws for invalid password", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "u1",
      email: "student@example.com",
      passwordHash: "hash",
      role: "STUDENT",
    });
    bcryptMock.compare.mockResolvedValue(false);

    await expect(login("student@example.com", "wrong-pass")).rejects.toBeInstanceOf(
      AuthInvalidCredentialsError,
    );
  });

  it("throws when expected role does not match", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "u1",
      email: "student@example.com",
      passwordHash: "hash",
      role: "STUDENT",
    });
    bcryptMock.compare.mockResolvedValue(true);

    await expect(login("student@example.com", "Password123", "ADMIN")).rejects.toBeInstanceOf(
      AuthRoleError,
    );
  });

  it("returns user metadata when credentials are valid", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "u1",
      email: "student@example.com",
      passwordHash: "hash",
      role: "STUDENT",
    });
    bcryptMock.compare.mockResolvedValue(true);

    const result = await login("student@example.com", "Password123");

    expect(result).toEqual({
      id: "u1",
      email: "student@example.com",
      role: "STUDENT",
    });
  });
});
