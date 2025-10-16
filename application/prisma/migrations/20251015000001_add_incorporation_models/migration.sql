-- CreateTable
CREATE TABLE "Incorporation" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "businessSubType" TEXT,
    "nameReserved" BOOLEAN,
    "llcName" TEXT,
    "confirmLlcName" TEXT,
    "consentToUseName" TEXT,
    "dbaDifferent" BOOLEAN,
    "businessAddressId" TEXT,
    "registeredAgentId" TEXT,
    "companyDetailsId" TEXT,
    "attestationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Incorporation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessAddress" (
    "id" TEXT NOT NULL,
    "principalAddress" TEXT,
    "principalSteAptFl" TEXT,
    "principalAttention" TEXT,
    "principalCity" TEXT,
    "principalState" TEXT,
    "principalZip" TEXT,
    "principalCountry" TEXT,
    "mailingAddress" TEXT,
    "mailingSteAptFl" TEXT,
    "mailingAttention" TEXT,
    "mailingCity" TEXT,
    "mailingState" TEXT,
    "mailingZip" TEXT,
    "mailingCountry" TEXT,
    "businessPhone" TEXT,
    "businessEmail" TEXT,

    CONSTRAINT "BusinessAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegisteredAgent" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "country" TEXT,
    "certified" BOOLEAN,
    "acceptanceForm" TEXT,
    "formationLocale" TEXT,

    CONSTRAINT "RegisteredAgent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncorporationCompanyDetails" (
    "id" TEXT NOT NULL,
    "durationType" TEXT,
    "durationDate" TIMESTAMP(3),
    "purposeStatement" TEXT,

    CONSTRAINT "IncorporationCompanyDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attestation" (
    "id" TEXT NOT NULL,
    "infoIsPublic" BOOLEAN,
    "authorizedToFile" BOOLEAN,
    "swornTrue" BOOLEAN,
    "organizerTitle" TEXT,
    "organizerName" TEXT,
    "organizerAddress" TEXT,
    "signerCapacity" TEXT,
    "onBehalfOf" TEXT,
    "signature" TEXT,
    "dateSigned" TIMESTAMP(3),

    CONSTRAINT "Attestation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Incorporation_companyId_key" ON "Incorporation"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Incorporation_businessAddressId_key" ON "Incorporation"("businessAddressId");

-- CreateIndex
CREATE UNIQUE INDEX "Incorporation_registeredAgentId_key" ON "Incorporation"("registeredAgentId");

-- CreateIndex
CREATE UNIQUE INDEX "Incorporation_companyDetailsId_key" ON "Incorporation"("companyDetailsId");

-- CreateIndex
CREATE UNIQUE INDEX "Incorporation_attestationId_key" ON "Incorporation"("attestationId");

-- AddForeignKey
ALTER TABLE "Incorporation" ADD CONSTRAINT "Incorporation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incorporation" ADD CONSTRAINT "Incorporation_businessAddressId_fkey" FOREIGN KEY ("businessAddressId") REFERENCES "BusinessAddress"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incorporation" ADD CONSTRAINT "Incorporation_registeredAgentId_fkey" FOREIGN KEY ("registeredAgentId") REFERENCES "RegisteredAgent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incorporation" ADD CONSTRAINT "Incorporation_companyDetailsId_fkey" FOREIGN KEY ("companyDetailsId") REFERENCES "IncorporationCompanyDetails"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incorporation" ADD CONSTRAINT "Incorporation_attestationId_fkey" FOREIGN KEY ("attestationId") REFERENCES "Attestation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

