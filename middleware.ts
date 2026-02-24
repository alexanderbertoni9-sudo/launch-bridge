import { NextRequest, NextResponse } from "next/server";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();
const AUTH_WINDOW_MS = 60_000;
const AUTH_LIMIT = 20;

function isRateLimited(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const key = `${ip}:${request.nextUrl.pathname}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + AUTH_WINDOW_MS });
    return false;
  }

  if (entry.count >= AUTH_LIMIT) {
    return true;
  }

  entry.count += 1;
  return false;
}

function applyAuthRateLimit(request: NextRequest) {
  if (request.method !== "POST") {
    return null;
  }

  const pathname = request.nextUrl.pathname;
  const authPath =
    pathname === "/auth" ||
    pathname === "/admin/login" ||
    pathname === "/api/signup" ||
    pathname === "/api/auth/callback/credentials";

  if (!authPath) {
    return null;
  }

  if (!isRateLimited(request)) {
    return null;
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  return new NextResponse("Too many authentication attempts. Please try again soon.", {
    status: 429,
  });
}

export function middleware(request: NextRequest) {
  const rateLimitResponse = applyAuthRateLimit(request);

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth", "/admin/:path*", "/student/:path*", "/api/signup", "/api/auth/callback/credentials"],
};
