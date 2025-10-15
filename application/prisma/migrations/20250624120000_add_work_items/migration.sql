-- Create enum for work item statuses
CREATE TYPE "WorkItemStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED');

-- Create WorkItem table to track contract checkpoints
CREATE TABLE "WorkItem" (
  "id" TEXT NOT NULL,
  "contractId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" "WorkItemStatus" NOT NULL DEFAULT 'NOT_STARTED',
  "dueDate" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "position" INTEGER NOT NULL DEFAULT 0,
  "linkedFileId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WorkItem_pkey" PRIMARY KEY ("id")
);

-- Maintain relationship to contracts
ALTER TABLE "WorkItem"
  ADD CONSTRAINT "WorkItem_contractId_fkey"
  FOREIGN KEY ("contractId") REFERENCES "Contract" ("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- Optional link to an uploaded file
ALTER TABLE "WorkItem"
  ADD CONSTRAINT "WorkItem_linkedFileId_fkey"
  FOREIGN KEY ("linkedFileId") REFERENCES "File" ("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- Helpful indexes for contract views and status filtering
CREATE INDEX "WorkItem_contractId_position_idx" ON "WorkItem" ("contractId", "position");
CREATE INDEX "WorkItem_status_idx" ON "WorkItem" ("status");
