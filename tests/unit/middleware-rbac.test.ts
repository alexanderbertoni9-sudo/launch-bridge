import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { middleware } from "../../middleware";

function makeRequest(path: string, cookie?: string) {
  return new NextRequest(`http://localhost${path}`, {
    headers: cookie ? { cookie } : undefined,
  });
}

describe("middleware route protection", () => {
  it("redirects anonymous users away from student pages", () => {
    const response = middleware(makeRequest("/student"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/auth");
  });

  it("redirects non-admin users away from admin pages", () => {
    const response = middleware(
      makeRequest("/admin", "authjs.session-token=fake; lb-role=STUDENT"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/forbidden");
  });

  it("allows admin users to access admin routes", () => {
    const response = middleware(
      makeRequest("/admin", "authjs.session-token=fake; lb-role=ADMIN"),
    );

    expect(response.status).toBe(200);
  });
});
