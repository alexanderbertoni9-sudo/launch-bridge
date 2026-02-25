import type { Route } from "next";
import { redirect } from "next/navigation";

type AdminLoginAliasPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminLoginAliasPage({ searchParams }: AdminLoginAliasPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const rawError = typeof resolvedSearchParams.error === "string" ? resolvedSearchParams.error : undefined;
  const safeError = rawError && /^[a-z_]+$/i.test(rawError) ? rawError : undefined;
  const params = new URLSearchParams({ role: "ADMIN" });
  if (safeError) {
    params.set("error", safeError);
  }

  redirect((`/auth?${params.toString()}` as Route));
}
