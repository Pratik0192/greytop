-- CreateTable
CREATE TABLE "MonthlyBill" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "totalProfit" DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    "totalLoss" DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    "providerBreakdown" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonthlyBill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyBill_userId_month_year_key" ON "MonthlyBill"("userId", "month", "year");

-- AddForeignKey
ALTER TABLE "MonthlyBill" ADD CONSTRAINT "MonthlyBill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
