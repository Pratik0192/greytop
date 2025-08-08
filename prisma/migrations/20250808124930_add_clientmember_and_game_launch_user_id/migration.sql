/*
  Warnings:

  - Added the required column `userId` to the `GameLaunchLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GameLaunchLog" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ClientMember" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "memberAccount" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClientMember_userId_idx" ON "ClientMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientMember_userId_memberAccount_key" ON "ClientMember"("userId", "memberAccount");

-- CreateIndex
CREATE INDEX "GameLaunchLog_userId_idx" ON "GameLaunchLog"("userId");

-- CreateIndex
CREATE INDEX "GameLaunchLog_memberAccount_idx" ON "GameLaunchLog"("memberAccount");

-- AddForeignKey
ALTER TABLE "ClientMember" ADD CONSTRAINT "ClientMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameLaunchLog" ADD CONSTRAINT "GameLaunchLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
