/*
  Warnings:

  - The primary key for the `Game` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Game" DROP CONSTRAINT "Game_pkey",
ALTER COLUMN "id" SET DATA TYPE CHAR(4),
ADD CONSTRAINT "Game_pkey" PRIMARY KEY ("id");
