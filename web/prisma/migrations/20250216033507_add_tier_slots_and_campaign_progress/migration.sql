/*
  Warnings:

  - You are about to drop the `tier_slots` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "tier_slots";

-- CreateTable
CREATE TABLE "TierSlot" (
    "id" TEXT NOT NULL,
    "tierId" TEXT NOT NULL,
    "maxSlots" INTEGER NOT NULL,
    "usedSlots" INTEGER NOT NULL DEFAULT 0,
    "remainingSlots" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TierSlot_pkey" PRIMARY KEY ("id")
);
