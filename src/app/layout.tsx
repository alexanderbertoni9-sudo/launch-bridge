import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";

import { auth } from "@/auth";
import { logoutAction } from "@/lib/actions/auth-actions";

import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "LaunchBridge",
  description: "LaunchBridge multi-user venture feedback platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${plexMono.variable}`}>
        <header className="top-nav">
          <Link href="/" className="brand">
            LaunchBridge
          </Link>
          {session?.user ? (
            <div className="row">
              <span className="badge">{session.user.role}</span>
              <span className="muted">{session.user.email}</span>
              <form action={logoutAction}>
                <button type="submit" className="ghost">
                  Log out
                </button>
              </form>
            </div>
          ) : (
            <Link href="/auth" className="button ghost">
              Sign in
            </Link>
          )}
        </header>
        {children}
      </body>
    </html>
  );
}
