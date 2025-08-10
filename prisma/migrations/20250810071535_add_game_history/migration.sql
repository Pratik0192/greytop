-- CreateTable
CREATE TABLE "GameHistory" (
    "id" SERIAL NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "gameUid" TEXT NOT NULL,
    "gameRound" TEXT NOT NULL,
    "betAmount" DECIMAL(18,2) NOT NULL,
    "winAmount" DECIMAL(18,2) NOT NULL,
    "memberAccount" TEXT NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "callbackTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameHistory_serialNumber_key" ON "GameHistory"("serialNumber");
