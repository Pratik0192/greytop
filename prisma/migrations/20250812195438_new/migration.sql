/*
  Warnings:

  - A unique constraint covering the columns `[providerCode,userId]` on the table `ProviderProfit` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ProviderProfit_providerCode_userId_key" ON "ProviderProfit"("providerCode", "userId");
