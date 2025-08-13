import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from "@shared/schema";

let db: any;
let pool: any;

// Use database when DATABASE_URL is available, fallback to in-memory for local development
if (process.env.DATABASE_URL) {
  // Initialize Neon database connection
  pool = neon(process.env.DATABASE_URL);
  db = drizzle(pool, { schema });
  console.log("Connected to Neon PostgreSQL database");
} else {
  // Development mode with in-memory storage
  console.log("Using in-memory storage for development environment");
  db = null;
  pool = null;
}

export { db, pool };
