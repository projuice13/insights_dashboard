-- Status scheme changed (Ordered / Awaiting Order / Pending / Dormant / Lost / Closed).
-- The old status values (hot, possible, seasonal, no_response, dormant, deactivated) no
-- longer map cleanly, so clear all existing status tags — every customer starts at
-- "No Status" and staff re-tag under the new scheme.
--
-- NOTE: this only touches customer STATUS data. Assignments live in the separate
-- "Assignment" table and are deliberately left untouched.
DELETE FROM "CustomerStatus";

-- Drop any outstanding closure/deactivation approval requests, which referenced the
-- statuses we just cleared.
DELETE FROM "Notification" WHERE "type" = 'deactivation_request';
