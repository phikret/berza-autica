import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// DELETE /api/wishlist/[productId] - Remove product from wishlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { productId } = await params

    const wishlistItem = await prisma.wishlistItem.findUnique({
      where: {
        memberId_productId: {
          memberId: (session.user as any).id,
          productId,
        },
      },
    })

    if (!wishlistItem) {
      return NextResponse.json(
        { error: 'Item not found in wishlist' },
        { status: 404 }
      )
    }

    await prisma.wishlistItem.delete({
      where: {
        memberId_productId: {
          memberId: (session.user as any).id,
          productId,
        },
      },
    })

    return NextResponse.json(
      { success: true, message: 'Product removed from wishlist' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error removing from wishlist:', error)
    return NextResponse.json(
      { error: 'Failed to remove from wishlist' },
      { status: 500 }
    )
  }
}
