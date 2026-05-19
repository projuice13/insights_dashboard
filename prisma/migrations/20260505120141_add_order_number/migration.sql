/*
  Warnings:

  - Added the required column `salesOrderNumber` to the `RawOrderRow` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RawOrderRow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "salesOrderNumber" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "postcode" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "primaryEmail" TEXT,
    "secondaryEmail" TEXT,
    "orderValue" REAL NOT NULL,
    "orderDate" TEXT NOT NULL
);
INSERT INTO "new_RawOrderRow" ("contactName", "customerName", "id", "orderDate", "orderValue", "postcode", "primaryEmail", "secondaryEmail") SELECT "contactName", "customerName", "id", "orderDate", "orderValue", "postcode", "primaryEmail", "secondaryEmail" FROM "RawOrderRow";
DROP TABLE "RawOrderRow";
ALTER TABLE "new_RawOrderRow" RENAME TO "RawOrderRow";
CREATE UNIQUE INDEX "RawOrderRow_salesOrderNumber_key" ON "RawOrderRow"("salesOrderNumber");
CREATE INDEX "RawOrderRow_customerName_postcode_idx" ON "RawOrderRow"("customerName", "postcode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
