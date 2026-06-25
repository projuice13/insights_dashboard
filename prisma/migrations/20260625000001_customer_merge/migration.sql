CREATE TABLE "CustomerMerge" (
  "id"                TEXT NOT NULL,
  "sourceId"          TEXT NOT NULL,
  "canonicalId"       TEXT NOT NULL,
  "canonicalName"     TEXT NOT NULL,
  "canonicalPostcode" TEXT NOT NULL,
  "mergedAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "mergedById"        TEXT NOT NULL,
  CONSTRAINT "CustomerMerge_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CustomerMerge_sourceId_key" ON "CustomerMerge"("sourceId");
CREATE INDEX "CustomerMerge_canonicalId_idx" ON "CustomerMerge"("canonicalId");
ALTER TABLE "CustomerMerge"
  ADD CONSTRAINT "CustomerMerge_mergedById_fkey"
  FOREIGN KEY ("mergedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
