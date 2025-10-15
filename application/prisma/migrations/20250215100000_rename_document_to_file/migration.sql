-- Rename Document table to File
ALTER TABLE "Document" RENAME TO "File";

-- Rename index
ALTER INDEX "Document_ownerType_ownerId_idx" RENAME TO "File_ownerType_ownerId_idx";

-- Update foreign key constraint name (drop old, add new)
ALTER TABLE "File" DROP CONSTRAINT IF EXISTS "Document_contractId_fkey";
ALTER TABLE "File"
  ADD CONSTRAINT "File_contractId_fkey"
  FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
