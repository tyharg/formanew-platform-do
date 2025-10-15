-- Create table to store relevant contract participants who need portal access
CREATE TABLE "RelevantParty" (
  "id" TEXT NOT NULL,
  "contractId" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "role" TEXT,
  "magicLinkToken" TEXT,
  "magicLinkExpiresAt" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RelevantParty_pkey" PRIMARY KEY ("id")
);

-- Maintain ownership and cascade behaviour
ALTER TABLE "RelevantParty"
  ADD CONSTRAINT "RelevantParty_contractId_fkey"
  FOREIGN KEY ("contractId") REFERENCES "Contract" ("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- Optional magic-link token should remain unique if present
CREATE UNIQUE INDEX "RelevantParty_magicLinkToken_key" ON "RelevantParty" ("magicLinkToken") WHERE "magicLinkToken" IS NOT NULL;

-- Enforce unique email per contract and accelerate lookups
CREATE UNIQUE INDEX "RelevantParty_contractId_email_key" ON "RelevantParty" ("contractId", "email");
CREATE INDEX "RelevantParty_contractId_email_idx" ON "RelevantParty" ("contractId", "email");
