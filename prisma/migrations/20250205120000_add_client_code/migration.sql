-- Migration for adding optional clientCode to ipk_leadd
-- MongoDB-specific commands; execute via a Mongo shell or Prisma migrate workflow configured for MongoDB.

-- Ensure clientCode field exists on existing documents
-- db.getCollection('ipk_leadd').updateMany({}, { $set: { clientCode: null } });

-- Create index to support lookups by clientCode
-- db.getCollection('ipk_leadd').createIndex({ clientCode: 1 });
