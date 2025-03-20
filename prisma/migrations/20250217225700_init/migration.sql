-- CreateTable
CREATE TABLE "UsuarioConnected" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "branchOfficeId" INTEGER,
    "personId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "isRegisteredWithGoogle" BOOLEAN NOT NULL,
    "avatarId" INTEGER,
    "twoFactorAuthenticationSecret" TEXT,
    "isTwoFactorAuthenticationEnabled" BOOLEAN NOT NULL,
    "stripeCustomerId" TEXT,
    "monthlySubscriptionStatus" TEXT,
    "isEmailConfirmed" BOOLEAN NOT NULL,
    "isPhoneNumberConfirmed" BOOLEAN NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
