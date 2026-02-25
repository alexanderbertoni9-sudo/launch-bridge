const bcrypt = require("bcryptjs");
const { PrismaClient, UserRole } = require("@prisma/client");

const prisma = new PrismaClient();

function stripWrappingQuotes(rawValue) {
  const value = (rawValue || "").trim();
  if (!value) {
    return "";
  }

  const startsWithQuote = value.startsWith('"') || value.startsWith("'");
  const endsWithQuote = value.endsWith('"') || value.endsWith("'");
  if (startsWithQuote && endsWithQuote && value.length >= 2) {
    return value.slice(1, -1).trim();
  }

  return value;
}

function normalizeEmail(rawValue) {
  return stripWrappingQuotes(rawValue).toLowerCase();
}

function normalizePassword(rawValue) {
  return stripWrappingQuotes(rawValue);
}

function parseEmailList(raw) {
  return (raw || "")
    .split(",")
    .map((item) => normalizeEmail(item))
    .filter(Boolean);
}

function assertStrongPassword(password, label) {
  if (password.length < 8) {
    throw new Error(`${label} must be at least 8 characters.`);
  }
}

async function upsertUser(email, password, role, label) {
  if (!email || !password) {
    return false;
  }

  assertStrongPassword(password, label);

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {
      role,
      passwordHash,
    },
    create: {
      email,
      role,
      passwordHash,
    },
  });

  return true;
}

async function seedLegacyAdminList() {
  const emails = parseEmailList(process.env.ADMIN_SEED_EMAILS);
  const password = normalizePassword(process.env.ADMIN_SEED_PASSWORD);

  if (!emails.length || !password) {
    return 0;
  }

  let count = 0;
  for (const email of emails) {
    const seeded = await upsertUser(email, password, UserRole.ADMIN, "ADMIN_SEED_PASSWORD");
    if (seeded) {
      count += 1;
    }
  }

  return count;
}

async function seedDemoAccounts() {
  const demoAdminEmail = normalizeEmail(process.env.DEMO_ADMIN_EMAIL);
  const demoAdminPassword = normalizePassword(process.env.DEMO_ADMIN_PASSWORD);

  const demoStudentEmail = normalizeEmail(process.env.DEMO_STUDENT_EMAIL);
  const demoStudentPassword = normalizePassword(process.env.DEMO_STUDENT_PASSWORD);

  let count = 0;

  if (
    await upsertUser(
      demoAdminEmail,
      demoAdminPassword,
      UserRole.ADMIN,
      "DEMO_ADMIN_PASSWORD",
    )
  ) {
    count += 1;
  }

  if (
    await upsertUser(
      demoStudentEmail,
      demoStudentPassword,
      UserRole.STUDENT,
      "DEMO_STUDENT_PASSWORD",
    )
  ) {
    count += 1;
  }

  return count;
}

async function main() {
  const legacyAdminCount = await seedLegacyAdminList();
  const demoCount = await seedDemoAccounts();

  const total = legacyAdminCount + demoCount;

  if (!total) {
    console.info(
      "No seed credentials provided. Set ADMIN_SEED_* or DEMO_* env vars to create demo accounts.",
    );
    return;
  }

  console.info(`Seeded/updated ${total} user(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
