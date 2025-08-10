-- AlterTable
ALTER TABLE "GameHistory" ADD COLUMN     "gameSessionId" INTEGER;

-- CreateIndex
CREATE INDEX "GameHistory_gameUid_idx" ON "GameHistory"("gameUid");

-- CreateIndex
CREATE INDEX "GameHistory_memberAccount_idx" ON "GameHistory"("memberAccount");

-- AddForeignKey
ALTER TABLE "GameHistory" ADD CONSTRAINT "GameHistory_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
