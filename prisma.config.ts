import { defineConfig } from "prisma/config";

// Vercel Postgres (Neon) exposes POSTGRES_URL_NON_POOLING for migrations.
// Fall back to DATABASE_URL for custom setups.
const migrateUrl =
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.DATABASE_URL;

if (!migrateUrl) {
  throw new Error(
    "No database URL found. Set POSTGRES_URL_NON_POOLING or DATABASE_URL."
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: migrateUrl,
  },
});
