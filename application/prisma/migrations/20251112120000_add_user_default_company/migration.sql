ALTER TABLE "User"
ADD COLUMN "defaultCompanyId" TEXT;

ALTER TABLE "User"
ADD CONSTRAINT "User_defaultCompanyId_fkey"
FOREIGN KEY ("defaultCompanyId")
REFERENCES "Company"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
