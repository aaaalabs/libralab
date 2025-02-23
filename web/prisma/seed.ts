import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Delete existing data
  await prisma.$transaction([
    prisma.tierSlot.deleteMany(),
    prisma.campaignProgress.deleteMany(),
  ]);

  // Create tier slots
  await prisma.tierSlot.createMany({
    data: [
      { tierId: 'tier1', maxSlots: 10, usedSlots: 0 },
      { tierId: 'tier2', maxSlots: 15, usedSlots: 0 },
      { tierId: 'tier3', maxSlots: 20, usedSlots: 0 },
    ],
  });

  // Create campaign progress
  await prisma.campaignProgress.create({
    data: {
      campaignId: 'early-bird-2025',
      currentAmount: 0,
      goal: 100000,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
