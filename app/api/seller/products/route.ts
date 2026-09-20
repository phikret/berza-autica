import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { removeExpiredPromotions } from '@/lib/services/products'

/**
 * GET /api/seller/products
 * Returns all products (active and inactive) for the authenticated seller
 * Requires authentication
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const sellerId = (session.user as any).id
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const skip = (page - 1) * pageSize

    // Get total count
    const total = await prisma.product.count({
      where: {
        sellerId,
      },
    })

    // Get products for the page
    let products = await prisma.product.findMany({
      where: {
        sellerId,
      },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: pageSize,
    })

    // Check and remove expired promotions
    await removeExpiredPromotions(products)

    const formattedProducts = products.map((product) => {
      // Calculate remaining days for promotion (7-day duration)
      let promotionDaysRemaining = null
      if (product.isPromoted && product.promotedAt) {
        const promotionEndDate = new Date(product.promotedAt)
        promotionEndDate.setDate(promotionEndDate.getDate() + 7)
        const now = new Date()
        const daysRemaining = Math.ceil((promotionEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        promotionDaysRemaining = Math.max(0, daysRemaining)
      }

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        images: product.images,
        slug: product.slug,
        category: product.category,
        scale: product.scale,
        seller: product.seller,
        promoted: product.isPromoted,
        isActive: product.isActive,
        isPromoted: product.isPromoted,
        promotedAt: product.promotedAt,
        promotionDaysRemaining,
      }
    })

    return NextResponse.json({
      products: formattedProducts,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('Error fetching seller products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch seller products' },
      { status: 500 }
    )
  }
}
