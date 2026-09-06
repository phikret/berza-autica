import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createRatingSchema = z.object({
  transactionId: z.string(),
  ratedId: z.string(),
  stars: z.number().int().min(1).max(5, 'Ocena mora biti između 1 i 5'),
  comment: z.string().min(5, 'Komentar mora imati najmanje 5 karaktera'),
})

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
    const { transactionId, ratedId, stars, comment } = createRatingSchema.parse(body)

    const raterId = (session.user as any).id

    if (raterId === ratedId) {
      return NextResponse.json(
        { error: 'Ne možete oceniti sebe' },
        { status: 400 }
      )
    }

    const deal = await prisma.deal.findUnique({
      where: { id: transactionId },
    })

    if (!deal) {
      return NextResponse.json(
        { error: 'Transakcija nije pronađena' },
        { status: 404 }
      )
    }

    if (deal.buyerId !== raterId && deal.sellerId !== raterId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const isBuyer = deal.buyerId === raterId

    if (!isBuyer && !deal.buyerRated) {
      return NextResponse.json(
        { error: 'Kupac mora prvo da oceni prodavca' },
        { status: 400 }
      )
    }

    const existingRating = await prisma.rating.findUnique({
      where: {
        transactionId_raterId: {
          transactionId,
          raterId,
        },
      },
    })

    if (existingRating) {
      return NextResponse.json(
        { error: isBuyer ? 'Već ste ocenili ovu transakciju' : 'Već ste ocenili kupca' },
        { status: 400 }
      )
    }

    const rating = await prisma.$transaction(async (tx: any) => {
      const created = await tx.rating.create({
        data: {
          raterId,
          ratedId,
          stars,
          comment,
          transactionId,
        },
        include: {
          rater: {
            select: {
              id: true,
              name: true,
            },
          },
          rated: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      await tx.deal.update({
        where: { id: transactionId },
        data: isBuyer ? { buyerRated: true } : { sellerRated: true },
      })

      return created
    })

    return NextResponse.json({
      success: true,
      rating,
      message: 'Ocena je uspešno dodata',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Error creating rating:', error)
    return NextResponse.json(
      { error: 'Failed to create rating' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')

    if (!memberId) {
      return NextResponse.json(
        { error: 'memberId is required' },
        { status: 400 }
      )
    }

    const ratings = await prisma.rating.findMany({
      where: { ratedId: memberId },
      include: {
        rater: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const avgRating = ratings.length > 0
      ? ratings.reduce((sum: number, r: typeof ratings[0]) => sum + r.stars, 0) / ratings.length
      : 0

    return NextResponse.json({
      ratings,
      averageRating: avgRating,
      totalRatings: ratings.length,
    })
  } catch (error) {
    console.error('Error fetching ratings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ratings' },
      { status: 500 }
    )
  }
}
