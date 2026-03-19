import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Fix SSL connection issues for Supabase edge connections
const connectionString = process.env.DATABASE_URL!

// To force IPv4 in Node.js for the database connection:
import dns from 'dns'
dns.setDefaultResultOrder('ipv4first')

// postgres.js config: we pass rejectUnauthorized: false to prevent self-signed cert errors
const client = postgres(connectionString, { 
  prepare: false, 
  ssl: { rejectUnauthorized: false },
  connect_timeout: 10,
})

export const db = drizzle(client, { schema })
