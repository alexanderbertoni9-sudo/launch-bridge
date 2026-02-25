import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { middleware } from "../../middleware";

type RequestOptions = {
  cookie?: string;
  method?: string;
  ip?: string;
};

function makeRequest(path: string, options: RequestOptions = {}) {
  const { cookie, method = "GET", ip = "127.0.0.1" } = options;
  const headers: Record<string, string> = {
    "x-forwarded-for": ip,
  };

  if (cookie) {
    headers.cookie = cookie;
  }

  return new NextRequest(`http://localhost${path}`, {
    method,
    headers,
  });
}

describe("middleware auth rate limiting", () => {
  it("allows normal non-auth GET traffic", () => {
    const response = middleware(makeRequest("/student"));

    expect(response.status).toBe(200);
  });

  it("rate-limits repeated form login attempts", () => {
    const ip = "10.1.1.1";
    for (let index = 0; index < 20; index += 1) {
      const response = middleware(makeRequest("/auth", { method: "POST", ip }));
      expect(response.status).toBe(200);
    }

    const limited = middleware(makeRequest("/auth", { method: "POST", ip }));
    expect(limited.status).toBe(429);
  });

  it("returns API 429 response for callback endpoint after limit", () => {
    const ip = "10.1.1.2";
    for (let index = 0; index < 20; index += 1) {
      middleware(makeRequest("/api/auth/callback/credentials", { method: "POST", ip }));
    }

    const limited = middleware(
      makeRequest("/api/auth/callback/credentials", { method: "POST", ip }),
    );
    expect(limited.status).toBe(429);
    expect(limited.headers.get("content-type")).toContain("application/json");
  });
});
