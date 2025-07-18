import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Create a development fallback database URL if none is provided
const getDatabaseUrl = () => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  
  // For development, we'll use environment variables if available
  const host = process.env.PGHOST || 'localhost';
  const port = process.env.PGPORT || '5432';
  const database = process.env.PGDATABASE || 'replit_db';
  const username = process.env.PGUSER || 'replit';
  const password = process.env.PGPASSWORD || 'password';
  
  return `postgresql://${username}:${password}@${host}:${port}/${database}`;
};

const databaseUrl = getDatabaseUrl();

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });