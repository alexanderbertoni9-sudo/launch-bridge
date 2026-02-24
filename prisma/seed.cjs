const bcrypt = require("bcryptjs");
const { PrismaClient, UserRole } = require("@prisma/client");

const prisma = new PrismaClient();

function parseEmailList(raw) {
  return (raw || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

async function upsertUser(email, password, role) {
  if (!email || !password) {
    return false;
  }

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
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!emails.length || !password) {
    return 0;
  }

  let count = 0;
  for (const email of emails) {
    const seeded = await upsertUser(email, password, UserRole.ADMIN);
    if (seeded) {
      count += 1;
    }
  }

  return count;
}

async function seedDemoAccounts() {
  const demoAdminEmail = (process.env.DEMO_ADMIN_EMAIL || "").trim().toLowerCase();
  const demoAdminPassword = process.env.DEMO_ADMIN_PASSWORD;

  const demoStudentEmail = (process.env.DEMO_STUDENT_EMAIL || "").trim().toLowerCase();
  const demoStudentPassword = process.env.DEMO_STUDENT_PASSWORD;

  let count = 0;

  if (await upsertUser(demoAdminEmail, demoAdminPassword, UserRole.ADMIN)) {
    count += 1;
  }

  if (await upsertUser(demoStudentEmail, demoStudentPassword, UserRole.STUDENT)) {
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
