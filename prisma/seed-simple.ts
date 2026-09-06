import { Pool } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}

async function main() {
  const pool = new Pool({ connectionString })
  const client = await pool.connect()

  try {
    console.log('Seeding database...')

    // Insert platform config
    await client.query(`
      INSERT INTO "PlatformConfig" (id, key, value, description, "updatedAt")
      VALUES 
        (gen_random_uuid(), 'free_tier_limit', '15', 'Number of free product listings per seller', NOW()),
        (gen_random_uuid(), 'listing_fee', '10', 'Token cost per listing beyond free tier', NOW()),
        (gen_random_uuid(), 'promotion_cost', '300', 'Token cost to promote a product', NOW()),
        (gen_random_uuid(), 'max_promoted_products', '3', 'Maximum number of promoted products per seller', NOW())
      ON CONFLICT (key) DO NOTHING
    `)

    // Insert categories
    await client.query(`
      INSERT INTO "Category" (id, name, slug, "createdAt")
      VALUES 
        (gen_random_uuid(), 'Autici', 'autici', NOW()),
        (gen_random_uuid(), 'Kamioni', 'kamioni', NOW()),
        (gen_random_uuid(), 'Autobusi', 'autobusi', NOW()),
        (gen_random_uuid(), 'Avioni', 'avioni', NOW())
      ON CONFLICT (slug) DO NOTHING
    `)

    console.log('Seeding completed!')
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

main()
  .then(() => {
    console.log('Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

