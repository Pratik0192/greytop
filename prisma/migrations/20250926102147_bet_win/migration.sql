-- AlterTable
ALTER TABLE "MonthlyBill" ADD COLUMN     "totalBet" DECIMAL(18,2) DEFAULT 0.00,
ADD COLUMN     "totalWin" DECIMAL(18,2) DEFAULT 0.00;

-- AlterTable
ALTER TABLE "MonthlyBillProvider" ADD COLUMN     "totalBet" DECIMAL(18,2) DEFAULT 0.00,
ADD COLUMN     "totalWin" DECIMAL(18,2) DEFAULT 0.00;
