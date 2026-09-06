import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasInsufficientBalance } from '@/lib/services/balance'
import { getPlatformConfig } from '@/lib/services/products'

// POST /api/products/[productId]/promote - Promote a product
export async function POST(
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
    const sellerId = (session.user as any).id

    // Check if product exists and belongs to seller
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Proizvod nije pronađen' },
        { status: 404 }
      )
    }

    if (product.sellerId !== sellerId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    if (product.isPromoted) {
      return NextResponse.json(
        { error: 'Proizvod je već promovisan' },
        { status: 400 }
      )
    }

    // Check promotion limit
    const maxPromoted = await getPlatformConfig('max_promoted_products')
    const currentPromoted = await prisma.product.count({
      where: {
        sellerId,
        isPromoted: true,
      },
    })

    if (currentPromoted >= maxPromoted) {
      return NextResponse.json(
        { error: `Možete imati maksimalno ${maxPromoted} promovisan proizvoda` },
        { status: 400 }
      )
    }

    // Get promotion cost
    const promotionCost = await getPlatformConfig('promotion_cost')

    // Check balance
    const insufficient = await hasInsufficientBalance(sellerId, promotionCost)
    if (insufficient) {
      return NextResponse.json(
        { error: `Nemate dovoljno tokena. Potrebno je ${promotionCost} tokena.` },
        { status: 400 }
      )
    }

    // Promote product and deduct tokens in a single transaction
    await prisma.$transaction(async (tx: any) => {
      // Check and update member balance
      const member = await tx.member.findUnique({
        where: { id: sellerId },
        select: { balance: true },
      })

      if (!member) {
        throw new Error('Member not found')
      }

      if (member.balance < promotionCost) {
        throw new Error('Insufficient balance')
      }

      const balanceBefore = member.balance
      const balanceAfter = balanceBefore - promotionCost

      // Update member balance
      await tx.member.update({
        where: { id: sellerId },
        data: { balance: balanceAfter },
      })

      // Record transaction
      await tx.balanceTransaction.create({
        data: {
          memberId: sellerId,
          amount: -promotionCost,
          type: 'promotion_fee',
          description: `Promocija proizvoda: ${product.name}`,
          balanceBefore,
          balanceAfter,
        },
      })

      // Update product promotion status
      await tx.product.update({
        where: { id: productId },
        data: {
          isPromoted: true,
          promotedAt: new Date(),
        },
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Proizvod je uspešno promovisan',
    })
  } catch (error) {
    console.error('Error promoting product:', error)
    return NextResponse.json(
      { error: 'Failed to promote product' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[productId]/promote - Remove promotion
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
    const sellerId = (session.user as any).id

    // Check if product exists and belongs to seller
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Proizvod nije pronađen' },
        { status: 404 }
      )
    }

    if (product.sellerId !== sellerId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    if (!product.isPromoted) {
      return NextResponse.json(
        { error: 'Proizvod nije promovisan' },
        { status: 400 }
      )
    }

    // Remove promotion
    await prisma.product.update({
      where: { id: productId },
      data: {
        isPromoted: false,
        promotedAt: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Promocija je uklonjena',
    })
  } catch (error) {
    console.error('Error removing promotion:', error)
    return NextResponse.json(
      { error: 'Failed to remove promotion' },
      { status: 500 }
    )
  }
}

