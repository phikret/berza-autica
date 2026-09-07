import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sellerId: string }> }
) {
  const { sellerId } = await params

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '12')

    if (page < 1) {
      return NextResponse.json(
        { error: 'Page must be greater than 0' },
        { status: 400 }
      )
    }

    const skip = (page - 1) * pageSize

    // Get total count
    const total = await prisma.product.count({
      where: {
        sellerId: sellerId,
        isActive: true,
      },
    })

    // Get products for the page
    const products = await prisma.product.findMany({
      where: {
        sellerId: sellerId,
        isActive: true,
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

    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      images: product.images,
      slug: product.slug,
      category: product.category,
      seller: product.seller,
      promoted: product.isPromoted,
    }))

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
