/*
  Warnings:

  - The primary key for the `Game` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `gameName` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `platformId` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `uid` on the `Game` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `Game` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(3)`.
  - You are about to drop the `GamePlatform` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_platformId_fkey";

-- DropIndex
DROP INDEX "Game_uid_key";

-- AlterTable
ALTER TABLE "Game" DROP CONSTRAINT "Game_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "gameName",
DROP COLUMN "platformId",
DROP COLUMN "type",
DROP COLUMN "uid",
ADD COLUMN     "gameProviderId" CHAR(3) NOT NULL DEFAULT 'DEF',
ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'Unnamed Game',
ADD COLUMN     "types" TEXT NOT NULL DEFAULT 'Unknown',
ALTER COLUMN "id" SET DATA TYPE CHAR(3),
ADD CONSTRAINT "Game_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "GameHistory" ALTER COLUMN "gameUid" SET DEFAULT 'UNKNOWN_UID',
ALTER COLUMN "gameRound" SET DEFAULT 'ROUND_0',
ALTER COLUMN "betAmount" SET DEFAULT 0.00,
ALTER COLUMN "winAmount" SET DEFAULT 0.00;

-- DropTable
DROP TABLE "GamePlatform";

-- CreateTable
CREATE TABLE "GameProvider" (
    "id" CHAR(3) NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameProvider_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameProvider_name_key" ON "GameProvider"("name");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_gameProviderId_fkey" FOREIGN KEY ("gameProviderId") REFERENCES "GameProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
