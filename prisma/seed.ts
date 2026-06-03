import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_USERS = [
  { username: 'alice', email: 'alice@demo.local', password: 'Demo1234!' },
  { username: 'bob', email: 'bob@demo.local', password: 'Demo1234!' },
];

async function main() {
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: { email: process.env.ADMIN_EMAIL || 'admin@valopoints.local' },
    create: {
      username: 'admin',
      email: process.env.ADMIN_EMAIL || 'admin@valopoints.local',
      passwordHash: bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'Admin1234', 10),
    },
  });
  console.log('Seeded admin:', admin.username, admin.email);

  for (const demo of DEMO_USERS) {
    const user = await prisma.user.upsert({
      where: { email: demo.email },
      update: {},
      create: {
        username: demo.username,
        email: demo.email,
        passwordHash: bcrypt.hashSync(demo.password, 10),
      },
    });
    console.log('Seeded demo user:', user.username, user.email);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
