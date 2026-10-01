import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/wishlist - Get user's wishlist
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Fetching wishlist for user:', (session.user as any).id)

    const wishlistItems = await prisma.wishlistItem.findMany({
      where: {
        memberId: (session.user as any).id,
      },
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
      orderBy: {
        createdAt: 'desc',
      },
    })

    console.log('Wishlist items found:', wishlistItems.length)

    return NextResponse.json({
      items: wishlistItems,
      count: wishlistItems.length,
    })
  } catch (error) {
    console.error('Error fetching wishlist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wishlist', details: String(error) },
      { status: 500 }
    )
  }
}

// POST /api/wishlist - Add product to wishlist
export async function POST(request: NextRequest) {
  try {
    console.log('=== WISHLIST POST START ===')
    
    const session = await getServerSession(authOptions)
    console.log('Session obtained:', !!session)

    if (!session?.user) {
      console.error('No session/user found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).id
    console.log('User ID from session:', userId)

    let body
    try {
      body = await request.json()
      console.log('Request body parsed:', body)
    } catch (e) {
      console.error('Failed to parse request body:', e)
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const { productId } = body

    if (!productId) {
      console.error('No productId provided')
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    console.log('Adding to wishlist - User ID:', userId, 'Product ID:', productId)

    // Check if product exists
    console.log('Checking if product exists...')
    let product
    try {
      product = await prisma.product.findUnique({
        where: { id: productId },
      })
    } catch (dbErr) {
      console.error('Database error checking product:', dbErr)
      throw dbErr
    }

    if (!product) {
      console.error('Product not found:', productId)
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    console.log('Product found:', product.name)

    // Check if already in wishlist
    console.log('Checking if already in wishlist...')
    let existing
    try {
      existing = await prisma.wishlistItem.findUnique({
        where: {
          memberId_productId: {
            memberId: userId,
            productId,
          },
        },
      })
    } catch (dbErr) {
      console.error('Database error checking existing wishlist:', dbErr)
      throw dbErr
    }

    if (existing) {
      console.error('Product already in wishlist')
      return NextResponse.json(
        { error: 'Product already in wishlist' },
        { status: 400 }
      )
    }

    console.log('Creating wishlist item...')
    // Add to wishlist
    let wishlistItem
    try {
      wishlistItem = await prisma.wishlistItem.create({
        data: {
          memberId: userId,
          productId,
        },
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
      })
    } catch (dbErr) {
      console.error('Database error creating wishlist item:', dbErr)
      throw dbErr
    }

    console.log('Successfully added to wishlist:', wishlistItem.id)
    console.log('=== WISHLIST POST SUCCESS ===')

    return NextResponse.json(
      {
        success: true,
        item: wishlistItem,
        message: 'Product added to wishlist',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('=== WISHLIST POST ERROR ===')
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    if (error instanceof Error) {
      console.error('Error stack:', error.stack)
    }
    
    let errorMessage = 'Failed to add to wishlist'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { error: errorMessage, details: String(error) },
      { status: 500 }
    )
  }
}
