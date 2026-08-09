import 'dotenv/config';
import bcrypt from 'bcrypt';
import prisma from './utils/prisma.js';

async function main() {
  const email = 'admin@quizplatform.com';
  const plainPassword = 'Admin@123';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Admin already exists:', existing.email);
    return;
  }

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Platform Admin',
      email,
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('Admin created successfully:');
  console.log('Email:', admin.email);
  console.log('Password:', plainPassword);
}

main()
  .catch((e) => console.error('Failed to create admin:', e))
  .finally(() => prisma.$disconnect());