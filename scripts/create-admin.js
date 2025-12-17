require('dotenv').config(); // Load .env if present
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const prisma = new PrismaClient();

async function getAdminCredentials() {
  let username = process.env.ADMIN_USERNAME;
  let plainPassword = process.env.ADMIN_PASSWORD;

  if (!username || !plainPassword) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true, // Ensures password input is hidden
    });

    if (!username) {
      username = await new Promise((resolve) => {
        rl.question('Enter admin username: ', resolve);
      });
    }

    if (!plainPassword) {
      plainPassword = await new Promise((resolve) => {
        rl.question('Enter admin password: ', (password) => {
          resolve(password);
        });
      });
    }

    rl.close();
  }

  if (!username || !plainPassword) {
    console.error('❌ Username and password are required.');
    process.exit(1);
  }

  return { username: username.trim(), plainPassword };
}

async function main() {
  // Optional: Prevent running in production
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Seeding is disabled in production for security.');
    process.exit(1);
  }

  const { username, plainPassword } = await getAdminCredentials();

  const hashedPassword = await bcrypt.hash(plainPassword, 12); // Stronger salt rounds

  // Check if admin already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { username },
  });

  if (existingAdmin) {
    console.log(`✅ Admin user "${username}" already exists. No changes made.`);
    return;
  }

  // Create only if not exists
  await prisma.admin.create({
    data: {
      username,
      password: hashedPassword,
    },
  });

  console.log(`✅ Admin user "${username}" created successfully!`);
}

main()
  .catch((error) => {
    console.error('❌ Failed to seed admin:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });