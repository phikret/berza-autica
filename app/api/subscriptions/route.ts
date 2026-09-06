import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const subscribeSchema = z.object({
  sellerId: z.string(),
})

// POST /api/subscriptions - Subscribe to a seller
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
    const { sellerId } = subscribeSchema.parse(body)

    const subscriberId = (session.user as any).id

    if (subscriberId === sellerId) {
      return NextResponse.json(
        { error: 'Ne možete se pretplatiti na sebe' },
        { status: 400 }
      )
    }

    // Check if seller exists
    const seller = await prisma.member.findUnique({
      where: { id: sellerId },
    })

    if (!seller) {
      return NextResponse.json(
        { error: 'Prodavac nije pronađen' },
        { status: 404 }
      )
    }

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        subscriberId,
        sellerId,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      subscription,
      message: 'Uspešno ste se pretplatili',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    // Handle unique constraint violation
    if ((error as any).code === 'P2002') {
      return NextResponse.json(
        { error: 'Već ste pretplaćeni na ovog prodavca' },
        { status: 400 }
      )
    }

    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}

// GET /api/subscriptions - Get user's subscriptions
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

    const subscriptions = await prisma.subscription.findMany({
      where: { subscriberId: memberId },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      subscriptions,
      total: subscriptions.length,
    })
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    )
  }
}

