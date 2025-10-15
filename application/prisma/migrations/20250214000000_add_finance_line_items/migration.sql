-- CreateEnum
CREATE TYPE "FinanceLineItemType" AS ENUM ('INFLOW', 'OUTFLOW');

-- CreateTable
CREATE TABLE "FinanceLineItem" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" "FinanceLineItemType" NOT NULL,
    "amount" BIGINT NOT NULL,
    "currency" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinanceLineItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FinanceLineItem"
  ADD CONSTRAINT "FinanceLineItem_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex for sorting/filtering
CREATE INDEX "FinanceLineItem_companyId_occurredAt_idx" ON "FinanceLineItem" ("companyId", "occurredAt" DESC);
