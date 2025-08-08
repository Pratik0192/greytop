/*
  Warnings:

  - You are about to drop the `GameLaunchLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GameLaunchLog" DROP CONSTRAINT "GameLaunchLog_userId_fkey";

-- DropTable
DROP TABLE "GameLaunchLog";

-- CreateTable
CREATE TABLE "GameSession" (
    "id" SERIAL NOT NULL,
    "clientMemberId" INTEGER NOT NULL,
    "gameUid" TEXT NOT NULL,
    "creditAmount" TEXT NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "homeUrl" TEXT NOT NULL,
    "platform" INTEGER NOT NULL,
    "callbackUrl" TEXT NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GameSession_clientMemberId_idx" ON "GameSession"("clientMemberId");

-- CreateIndex
CREATE INDEX "GameSession_gameUid_idx" ON "GameSession"("gameUid");

-- AddForeignKey
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_clientMemberId_fkey" FOREIGN KEY ("clientMemberId") REFERENCES "ClientMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
