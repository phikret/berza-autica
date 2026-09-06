import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const addToCartSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive().default(1),
})

// GET /api/cart - Get cart items grouped by seller
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const memberId = (session.user as any).id

    // Get cart items with product and seller details
    const cartItems = await prisma.cartItem.findMany({
      where: { memberId },
      include: {
        product: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
              },
            },
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Group by seller
    type CartItemType = typeof cartItems[0]
    const groupedBySeller = cartItems.reduce((acc: Record<string, any>, item: CartItemType) => {
      const sellerId = item.product.sellerId
      if (!acc[sellerId]) {
        acc[sellerId] = {
          seller: item.product.seller,
          items: [],
          totalPrice: 0,
        }
      }
      acc[sellerId].items.push(item)
      acc[sellerId].totalPrice += item.product.price * item.quantity
      return acc
    }, {})

    return NextResponse.json({
      cartItems,
      groupedBySeller: Object.values(groupedBySeller),
      totalItems: cartItems.length,
    })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { productId, quantity } = addToCartSchema.parse(body)

    const memberId = (session.user as any).id

    // Check if product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Proizvod nije pronađen' },
        { status: 404 }
      )
    }

    if (!product.isActive) {
      return NextResponse.json(
        { error: 'Proizvod nije aktivan' },
        { status: 400 }
      )
    }

    // Check if seller is trying to add their own product
    if (product.sellerId === memberId) {
      return NextResponse.json(
        { error: 'Ne možete dodati svoj proizvod u korpu' },
        { status: 400 }
      )
    }

    // Add or update cart item
    const cartItem = await prisma.cartItem.upsert({
      where: {
        memberId_productId: {
          memberId,
          productId,
        },
      },
      update: {
        quantity,
      },
      create: {
        memberId,
        productId,
        quantity,
      },
      include: {
        product: true,
      },
    })

    return NextResponse.json({
      success: true,
      cartItem,
      message: 'Proizvod je dodat u korpu',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Error adding to cart:', error)
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    )
  }
}

