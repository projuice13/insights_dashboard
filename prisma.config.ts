import { defineConfig } from "prisma/config";

// Vercel Postgres (Neon) exposes POSTGRES_URL_NON_POOLING for migrations.
// Fall back to DATABASE_URL for custom setups.
// We pass through whatever's set (or an empty string for generate, which
// doesn't need a connection); migrate deploy will fail loudly if missing.
const migrateUrl =
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.DATABASE_URL ??
  '';

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: migrateUrl,
  },
});
