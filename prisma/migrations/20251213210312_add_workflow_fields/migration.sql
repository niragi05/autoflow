-- Step 1: Add createdAt with default value (safe for existing rows)
ALTER TABLE "Workflow" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Step 2: Add updatedAt as nullable first
ALTER TABLE "Workflow" ADD COLUMN "updatedAt" TIMESTAMP(3);

-- Step 3: Update existing rows to set updatedAt to current timestamp
UPDATE "Workflow" SET "updatedAt" = CURRENT_TIMESTAMP WHERE "updatedAt" IS NULL;

-- Step 4: Make updatedAt NOT NULL
ALTER TABLE "Workflow" ALTER COLUMN "updatedAt" SET NOT NULL;

-- Step 5: Add userId as nullable first
ALTER TABLE "Workflow" ADD COLUMN "userId" TEXT;

-- Step 6: Update existing rows to assign them to the first user
-- Note: This requires at least one user to exist. If no users exist, this migration will fail
-- at step 7, and you'll need to create a user first or delete orphaned workflows.
UPDATE "Workflow" 
SET "userId" = (SELECT "id" FROM "user" ORDER BY "createdAt" ASC LIMIT 1)
WHERE "userId" IS NULL;

-- Step 7: Make userId NOT NULL (only if all rows were updated successfully)
ALTER TABLE "Workflow" ALTER COLUMN "userId" SET NOT NULL;

-- Step 8: Add foreign key constraint
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
