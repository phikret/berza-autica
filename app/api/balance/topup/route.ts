import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { addTokens } from '@/lib/services/balance'
import { z } from 'zod'

const topupSchema = z.object({
  amount: z.number().int().positive('Amount must be positive'),
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
    const { amount } = topupSchema.parse(body)

    const memberId = (session.user as any).id
    const newBalance = await addTokens(
      memberId,
      amount,
      'topup',
      `Dodato ${amount} tokena`
    )

    return NextResponse.json({
      success: true,
      balance: newBalance,
      message: `Uspešno dodato ${amount} tokena`,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Error topping up balance:', error)
    return NextResponse.json(
      { error: 'Failed to top up balance' },
      { status: 500 }
    )
  }
}

