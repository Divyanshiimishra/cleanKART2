-- Prevent duplicate participation rows when two join requests arrive together.
-- Resolve any existing duplicate (communityId, userId) pairs before applying this migration.
CREATE UNIQUE INDEX "Drive_communityId_userId_key"
ON "Drive"("communityId", "userId");
