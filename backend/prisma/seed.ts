import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const items = [
    { title: 'Buy groceries', description: 'Milk, eggs, bread', status: 'active' },
    { title: 'Write unit tests', description: 'Cover items service', status: 'active' },
    { title: 'Fix bug #42', description: undefined, status: 'active' },
    { title: 'Update README', description: 'Document the API', status: 'active' },
    { title: 'Deploy to staging', description: 'Tag and push', status: 'active' },
  ];
  for (const item of items) {
    await prisma.item.create({ data: item });
  }
  console.log('Seeded 5 items');
}

main().finally(async () => {
  await prisma.$disconnect();
  await pool.end();
});
