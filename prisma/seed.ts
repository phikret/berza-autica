import { PrismaClient } from '@prisma/client'
import { Pool, neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import ws from 'ws'
import * as dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

neonConfig.webSocketConstructor = ws

const connectionString = "postgresql://neondb_owner:npg_uiPsh9E3mKZU@ep-green-firefly-aiivlusj-pooler.c-4.us-east-1.aws.neon.tech/berza_autica?sslmode=require&channel_binding=require"

if (!connectionString) {
  console.error('DATABASE_URL is not set. Please check your .env file.')
  process.exit(1)
}

console.log('Using database:', connectionString.split('@')[1]?.split('/')[0])

const pool = new Pool({ connectionString })
const adapter = new PrismaNeon(pool as any)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  // Create platform configuration
  await prisma.platformConfig.upsert({
    where: { key: 'free_tier_limit' },
    update: {},
    create: {
      key: 'free_tier_limit',
      value: '15',
      description: 'Number of free product listings per seller',
    },
  })

  await prisma.platformConfig.upsert({
    where: { key: 'listing_fee' },
    update: {},
    create: {
      key: 'listing_fee',
      value: '10',
      description: 'Token cost per listing beyond free tier',
    },
  })

  await prisma.platformConfig.upsert({
    where: { key: 'promotion_cost' },
    update: {},
    create: {
      key: 'promotion_cost',
      value: '300',
      description: 'Token cost to promote a product',
    },
  })

  await prisma.platformConfig.upsert({
    where: { key: 'max_promoted_products' },
    update: {},
    create: {
      key: 'max_promoted_products',
      value: '3',
      description: 'Maximum number of promoted products per seller',
    },
  })

  // Create default categories
  await prisma.category.upsert({
    where: { slug: 'autici' },
    update: {},
    create: {
      name: 'Autici',
      slug: 'autici',
    },
  })

  await prisma.category.upsert({
    where: { slug: 'kamioni' },
    update: {},
    create: {
      name: 'Kamioni',
      slug: 'kamioni',
    },
  })

  await prisma.category.upsert({
    where: { slug: 'autobusi' },
    update: {},
    create: {
      name: 'Autobusi',
      slug: 'autobusi',
    },
  })

  await prisma.category.upsert({
    where: { slug: 'avioni' },
    update: {},
    create: {
      name: 'Avioni',
      slug: 'avioni',
    },
  })

  console.log('Seeding completed!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

