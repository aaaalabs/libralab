import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface TierSlots {
  tierId: string;
  maxSlots: number;
  usedSlots: number;
  remainingSlots: number;
}

export async function getCurrentAmount() {
  try {
    const progress = await prisma.campaignProgress.findFirst({
      orderBy: { updatedAt: 'desc' }
    });
    return progress?.currentAmount || 400;
  } catch (error) {
    console.error('Database error:', error);
    return 400;
  }
}

export async function getTierSlots(): Promise<TierSlots[]> {
  try {
    const slots = await prisma.tierSlot.findMany({
      orderBy: { tierId: 'asc' }
    });
    
    return slots.map(slot => ({
      tierId: slot.tierId,
      maxSlots: slot.maxSlots,
      usedSlots: slot.usedSlots,
      remainingSlots: slot.maxSlots - slot.usedSlots
    }));
  } catch (error) {
    console.error('Database error:', error);
    return [];
  }
}

export async function addDeposit(tierId: string, amount: number) {
  try {
    return await prisma.$transaction(async (tx) => {
      // Check if slots are available
      const slot = await tx.tierSlot.findUnique({
        where: { tierId }
      });

      if (!slot) {
        throw new Error('Tier not found');
      }

      if (slot.usedSlots >= slot.maxSlots) {
        throw new Error('No slots available');
      }

      // Update slots
      await tx.tierSlot.update({
        where: { tierId },
        data: {
          usedSlots: slot.usedSlots + 1
        }
      });

      // Get current progress
      const currentProgress = await tx.campaignProgress.findFirst({
        orderBy: { updatedAt: 'desc' }
      });

      // Update progress
      await tx.campaignProgress.create({
        data: {
          campaignId: currentProgress?.campaignId || 'early-bird-2025',
          currentAmount: (currentProgress?.currentAmount || 0) + amount,
          goal: currentProgress?.goal || 100000,
          startDate: currentProgress?.startDate || new Date(),
          endDate: currentProgress?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });

      return true;
    });
  } catch (error) {
    console.error('Failed to add deposit:', error);
    return false;
  }
}
