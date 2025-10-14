-- Add optional company association to user notes
ALTER TABLE "Note"
  ADD COLUMN "companyId" TEXT;

ALTER TABLE "Note"
  ADD CONSTRAINT "Note_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;
