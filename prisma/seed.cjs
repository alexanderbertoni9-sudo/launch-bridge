const bcrypt = require("bcryptjs");
const { PrismaClient, UserRole } = require("@prisma/client");

const prisma = new PrismaClient();

function parseAdminEmails() {
  const raw = process.env.ADMIN_SEED_EMAILS || "";

  return raw
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

async function main() {
  const emails = parseAdminEmails();
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!emails.length) {
    console.info("No ADMIN_SEED_EMAILS provided. Skipping admin seed.");
    return;
  }

  if (!password) {
    throw new Error("ADMIN_SEED_PASSWORD is required when ADMIN_SEED_EMAILS is set.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  for (const email of emails) {
    await prisma.user.upsert({
      where: { email },
      update: {
        role: UserRole.ADMIN,
        passwordHash,
      },
      create: {
        email,
        role: UserRole.ADMIN,
        passwordHash,
      },
    });
  }

  console.info(`Seeded ${emails.length} admin user(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
