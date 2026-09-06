import { PrismaClient } from '@prisma/client'
import { Pool, neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import ws from 'ws'

console.log('=== PRISMA INITIALIZATION ===')
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
console.log('DATABASE_URL value:', process.env.DATABASE_URL?.substring(0, 30) + '...')

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const connectionString = "postgresql://neondb_owner:npg_uiPsh9E3mKZU@ep-green-firefly-aiivlusj-pooler.c-4.us-east-1.aws.neon.tech/berza_autica?sslmode=require&channel_binding=require"

if (!connectionString) {
  console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('DATABASE')))
  throw new Error('DATABASE_URL environment variable is not set')
}

neonConfig.webSocketConstructor = ws

const adapter = new PrismaNeon({ connectionString}); 


export const prisma = globalForPrisma.prisma ?? new PrismaClient({ 
  adapter
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma


