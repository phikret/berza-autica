import { prisma } from '@/lib/prisma'
import { deductTokens, hasInsufficientBalance } from './balance'

// Generate unique slug from product name
export function generateSlug(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
  
  // Add random suffix to ensure uniqueness
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  return `${slug}-${randomSuffix}`
}

// Get platform configuration values
export async function getPlatformConfig(key: string): Promise<number> {
  const config = await prisma.platformConfig.findUnique({
    where: { key },
  })
  return config ? parseInt(config.value) : 0
}

// Calculate listing fee for a seller
export async function calculateListingFee(sellerId: string): Promise<number> {
  const freeTierLimit = await getPlatformConfig('free_tier_limit')
  const listingFee = await getPlatformConfig('listing_fee')
  
  // Count total products created by seller (active or not)
  const productCount = await prisma.product.count({
    where: { sellerId },
  })
  
  // If within free tier, no fee
  if (productCount < freeTierLimit) {
    return 0
  }
  
  return listingFee
}

// Check if seller can create a product
export async function canCreateProduct(sellerId: string): Promise<{
  canCreate: boolean
  fee: number
  reason?: string
}> {
  const fee = await calculateListingFee(sellerId)
  
  if (fee === 0) {
    return { canCreate: true, fee: 0 }
  }
  
  const insufficient = await hasInsufficientBalance(sellerId, fee)
  
  if (insufficient) {
    return {
      canCreate: false,
      fee,
      reason: `Nemate dovoljno tokena. Potrebno je ${fee} tokena.`,
    }
  }
  
  return { canCreate: true, fee }
}

// Create product with fee deduction
export async function createProductWithFee(
  sellerId: string,
  data: {
    name: string
    description: string
    price: number
    categoryId: string
    images: string[]
  }
) {
  const { canCreate, fee, reason } = await canCreateProduct(sellerId)
  
  if (!canCreate) {
    throw new Error(reason)
  }
  
  // Generate unique slug
  const slug = generateSlug(data.name)
  
  // Create product and deduct fee in a transaction
  const product = await prisma.$transaction(async (tx) => {
    // Create product
    const newProduct = await tx.product.create({
      data: {
        ...data,
        slug,
        sellerId,
      },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
    
    // Deduct fee if applicable
    if (fee > 0) {
      await deductTokens(
        sellerId,
        fee,
        'listing_fee',
        `Naknada za objavljivanje proizvoda: ${data.name}`
      )
    }
    
    return newProduct
  })
  
  return product
}

// Get seller's product count and remaining free listings
export async function getSellerListingStats(sellerId: string) {
  const freeTierLimit = await getPlatformConfig('free_tier_limit')
  const productCount = await prisma.product.count({
    where: { sellerId },
  })
  
  const remainingFree = Math.max(0, freeTierLimit - productCount)
  const nextListingFee = await calculateListingFee(sellerId)
  
  return {
    totalProducts: productCount,
    freeTierLimit,
    remainingFree,
    nextListingFee,
  }
}

// Re-export balance functions for convenience
export { deductTokens, hasInsufficientBalance } from './balance'

