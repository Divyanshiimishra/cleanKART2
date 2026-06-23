import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: "postgresql://postgres:Devesh%401509@db.vlhjjayxofofxaxhzhdy.supabase.co:5432/postgres",
  },
});