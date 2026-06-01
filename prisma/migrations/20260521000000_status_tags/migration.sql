-- Migrate Deactivation table to a generic CustomerStatus table that tracks
-- any of the 7 customer-status tags (deactivated/dormant/no_response/...)

-- CreateTable
CREATE TABLE "CustomerStatus" (
    "customerId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "approvalStatus" TEXT NOT NULL DEFAULT 'approved',
    "reason" TEXT,
    "setById" TEXT NOT NULL,
    "setAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    CONSTRAINT "CustomerStatus_pkey" PRIMARY KEY ("customerId")
);

-- Copy existing Deactivation rows in.
--   * tag type   → 'deactivated' (every old row was a deactivation)
--   * approval   → old 'active' became 'approved', 'pending' stays 'pending'
--   * field renames: requestedBy → setBy / requestedAt → setAt
INSERT INTO "CustomerStatus" (
    "customerId", "customerName", "status", "approvalStatus", "reason",
    "setById", "setAt", "approvedById", "approvedAt"
)
SELECT
    "customerId",
    "customerName",
    'deactivated' AS "status",
    CASE WHEN "status" = 'active' THEN 'approved' ELSE 'pending' END AS "approvalStatus",
    "reason",
    "requestedById",
    "requestedAt",
    "approvedById",
    "approvedAt"
FROM "Deactivation";

-- DropTable
DROP TABLE "Deactivation";

-- CreateIndex
CREATE INDEX "CustomerStatus_status_idx" ON "CustomerStatus"("status");
CREATE INDEX "CustomerStatus_approvalStatus_idx" ON "CustomerStatus"("approvalStatus");

-- AddForeignKey
ALTER TABLE "CustomerStatus" ADD CONSTRAINT "CustomerStatus_setById_fkey" FOREIGN KEY ("setById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerStatus" ADD CONSTRAINT "CustomerStatus_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
