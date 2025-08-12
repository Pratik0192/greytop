-- CreateTable
CREATE TABLE "ProviderProfit" (
    "id" SERIAL NOT NULL,
    "providerCode" TEXT NOT NULL,
    "profit" DECIMAL(18,2) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ProviderProfit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProviderProfit" ADD CONSTRAINT "ProviderProfit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
