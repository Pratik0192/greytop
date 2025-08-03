-- CreateTable
CREATE TABLE "GameLaunchLog" (
    "id" SERIAL NOT NULL,
    "memberAccount" TEXT NOT NULL,
    "gameUid" TEXT NOT NULL,
    "creditAmount" TEXT NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "homeUrl" TEXT NOT NULL,
    "platform" INTEGER NOT NULL,
    "callbackUrl" TEXT NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameLaunchLog_pkey" PRIMARY KEY ("id")
);
