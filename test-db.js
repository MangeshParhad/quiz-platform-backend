import 'dotenv/config';
import prisma from './utils/prisma.js';

async function main() {
  const userCount = await prisma.user.count();
  console.log(`Connected! Current users in database: ${userCount}`);
}

main()
  .catch((e) => console.error('Connection failed:', e))
  .finally(() => prisma.$disconnect());