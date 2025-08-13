-- AlterTable
ALTER TABLE "ProviderProfit" ADD COLUMN     "bill" DECIMAL(18,2) NOT NULL DEFAULT 0.00;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "totalBill" DECIMAL(18,2) NOT NULL DEFAULT 0.00;
