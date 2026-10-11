import { PrismaClient, TaskStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  const fixturePath = path.join(__dirname, '..', 'fixtures', 'seed-data.json');
  if (!fs.existsSync(fixturePath)) {
    throw new Error(`Fixture file not found at: ${fixturePath}`);
  }

  const rawData = fs.readFileSync(fixturePath, 'utf-8');
  const { teams, tasks } = JSON.parse(rawData);

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.taskTeam.deleteMany();
  await prisma.task.deleteMany();
  await prisma.team.deleteMany();

  // Create teams
  console.log(`👥 Seeding ${teams.length} teams...`);
  for (const team of teams) {
    await prisma.team.upsert({
      where: { id: team.id },
      update: {},
      create: {
        id: team.id,
        name: team.name,
        colorHex: team.colorHex,
        description: team.description,
      },
    });
  }

  // Create tasks
  console.log(`📋 Seeding ${tasks.length} tasks...`);
  for (const task of tasks) {
    await prisma.task.create({
      data: {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status as TaskStatus,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        teams: {
          create: (task.teamIds || []).map((tId: string) => ({
            team: {
              connect: { id: tId },
            },
          })),
        },
      },
    });
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

