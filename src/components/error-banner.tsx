type ErrorBannerProps = {
  code?: string;
};

const MESSAGES: Record<string, string> = {
  invalid_signup: "Please provide a valid email and a password with at least 8 characters.",
  signup_disabled: "Demo mode is enabled. Signup is temporarily disabled.",
  email_exists: "An account with this email already exists.",
  login_failed: "Account created, but automatic sign-in failed. Please log in.",
  invalid_credentials: "Invalid email or password.",
  demo_not_configured: "Demo credentials are not configured in environment variables yet.",
  demo_seed_mismatch:
    "Demo credentials do not match database records. Re-run prisma seed with DEMO_* values.",
  admin_only: "This login is restricted to admin accounts.",
  role_mismatch: "This account does not match the selected role. Switch role and try again.",
  invalid_input: "Please correct the highlighted fields and try again.",
};

export function ErrorBanner({ code }: ErrorBannerProps) {
  if (!code || !MESSAGES[code]) {
    return null;
  }

  return <p className="alert">{MESSAGES[code]}</p>;
}
