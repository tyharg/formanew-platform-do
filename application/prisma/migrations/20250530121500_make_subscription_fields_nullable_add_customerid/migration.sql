-- Alter table to make status and plan nullable, and add customerId field to Subscription
ALTER TABLE "Subscription"
ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "plan" DROP NOT NULL,
ADD COLUMN "customerId" TEXT;
