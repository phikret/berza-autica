import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const addTokensSchema = z.object({
  userId: z.string(),
  amount: z.number().int().positive('Iznos mora biti pozitivan broj'),
  reason: z.string().min(3, 'Razlog mora imati najmanje 3 karaktera'),
})

/**
 * POST /api/admin/tokens
 * Admin endpoint za dodavanje tokena korisniku
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const admin = await prisma.member.findUnique({
      where: { id: (session.user as any).id },
      select: { role: true },
    })

    if (!admin || admin.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - only admins can add tokens' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { userId, amount, reason } = addTokensSchema.parse(body)

    // Check if user exists
    const user = await prisma.member.findUnique({
      where: { id: userId },
      select: { id: true, balance: true, name: true, email: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Korisnik nije pronađen' },
        { status: 404 }
      )
    }

    // Add tokens and record transaction
    const result = await prisma.$transaction(async (tx: any) => {
      const balanceBefore = user.balance
      const balanceAfter = balanceBefore + amount

      // Update user balance
      const updatedUser = await tx.member.update({
        where: { id: userId },
        data: { balance: balanceAfter },
        select: { id: true, balance: true, name: true, email: true },
      })

      // Record transaction
      await tx.balanceTransaction.create({
        data: {
          memberId: userId,
          amount,
          type: 'admin_topup',
          description: `Admin dodao tokene: ${reason}`,
          balanceBefore,
          balanceAfter,
        },
      })

      return updatedUser
    })

    return NextResponse.json({
      success: true,
      message: `Uspešno dodano ${amount} tokena korisniku ${user.name}`,
      user: result,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    console.error('Error adding tokens:', error)
    return NextResponse.json(
      { error: 'Failed to add tokens' },
      { status: 500 }
    )
  }
}
