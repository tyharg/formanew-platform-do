-- Extend incorporation aggregate with business details, primary contact, and members

-- CreateTable
CREATE TABLE "IncorporationBusinessDetails" (
    "id" TEXT NOT NULL,
    "formationState" TEXT,
    "formationCounty" TEXT,
    "effectiveDate" TIMESTAMP(3),
    "hasForeignQualification" BOOLEAN,
    "foreignJurisdictions" TEXT,
    "managementStructure" TEXT,

    CONSTRAINT "IncorporationBusinessDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncorporationPrimaryContact" (
    "id" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "title" TEXT,
    "email" TEXT,
    "phone" TEXT,

    CONSTRAINT "IncorporationPrimaryContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncorporationMember" (
    "id" TEXT NOT NULL,
    "incorporationId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT,
    "ownershipPercentage" DOUBLE PRECISION,
    "isManager" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncorporationMember_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Incorporation"
  ADD COLUMN "businessDetailsId" TEXT,
  ADD COLUMN "primaryContactId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Incorporation_businessDetailsId_key" ON "Incorporation"("businessDetailsId");

-- CreateIndex
CREATE UNIQUE INDEX "Incorporation_primaryContactId_key" ON "Incorporation"("primaryContactId");

-- AddForeignKey
ALTER TABLE "Incorporation" ADD CONSTRAINT "Incorporation_businessDetailsId_fkey" FOREIGN KEY ("businessDetailsId") REFERENCES "IncorporationBusinessDetails"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incorporation" ADD CONSTRAINT "Incorporation_primaryContactId_fkey" FOREIGN KEY ("primaryContactId") REFERENCES "IncorporationPrimaryContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncorporationMember" ADD CONSTRAINT "IncorporationMember_incorporationId_fkey" FOREIGN KEY ("incorporationId") REFERENCES "Incorporation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
