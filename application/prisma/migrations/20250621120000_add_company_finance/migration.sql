-- Create company finance table for Stripe Connect onboarding
CREATE TABLE "CompanyFinance" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "stripeAccountId" TEXT,
  "accountOnboardingUrl" TEXT,
  "accountOnboardingExpiresAt" TIMESTAMP(3),
  "accountLoginLinkUrl" TEXT,
  "detailsSubmitted" BOOLEAN NOT NULL DEFAULT false,
  "chargesEnabled" BOOLEAN NOT NULL DEFAULT false,
  "payoutsEnabled" BOOLEAN NOT NULL DEFAULT false,
  "requirementsDue" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "requirementsDueSoon" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CompanyFinance_pkey" PRIMARY KEY ("id")
);

-- Ensure 1:1 relationship with Company
CREATE UNIQUE INDEX "CompanyFinance_companyId_key" ON "CompanyFinance" ("companyId");

ALTER TABLE "CompanyFinance"
  ADD CONSTRAINT "CompanyFinance_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company" ("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;
