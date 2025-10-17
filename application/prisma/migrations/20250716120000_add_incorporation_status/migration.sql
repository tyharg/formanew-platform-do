-- Create enum to track incorporation progress
CREATE TYPE "IncorporationStatus" AS ENUM ('DRAFT', 'SUBMITTED');

-- Add status tracking fields to incorporations
ALTER TABLE "Incorporation"
  ADD COLUMN "status" "IncorporationStatus" NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN "submittedAt" TIMESTAMP(3);
