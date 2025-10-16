-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "billingAmount" INTEGER,
ADD COLUMN     "billingCurrency" TEXT,
ADD COLUMN     "isBillingEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripePriceId" TEXT;

