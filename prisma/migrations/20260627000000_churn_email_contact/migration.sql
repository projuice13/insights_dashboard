CREATE TABLE "ChurnEmailContact" (
  "customerId" TEXT NOT NULL,
  "addedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "addedById"  TEXT NOT NULL,
  CONSTRAINT "ChurnEmailContact_pkey" PRIMARY KEY ("customerId")
);
ALTER TABLE "ChurnEmailContact"
  ADD CONSTRAINT "ChurnEmailContact_addedById_fkey"
  FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
