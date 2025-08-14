/*
  Warnings:

  - You are about to drop the column `providerBreakdown` on the `MonthlyBill` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MonthlyBill" DROP COLUMN "providerBreakdown";

-- CreateTable
CREATE TABLE "MonthlyBillProvider" (
    "id" SERIAL NOT NULL,
    "monthlyBillId" INTEGER NOT NULL,
    "providerCode" TEXT NOT NULL,
    "profit" DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    "loss" DECIMAL(18,2) NOT NULL DEFAULT 0.00,

    CONSTRAINT "MonthlyBillProvider_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MonthlyBillProvider" ADD CONSTRAINT "MonthlyBillProvider_monthlyBillId_fkey" FOREIGN KEY ("monthlyBillId") REFERENCES "MonthlyBill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
