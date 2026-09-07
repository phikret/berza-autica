import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params

  try {
    const member = await prisma.member.findUnique({
      where: { id: userId },
      select: { phone: true },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      phone: member.phone || 'Broj telefona nije dostupan',
    })
  } catch (error) {
    console.error('Error fetching member phone:', error)
    return NextResponse.json(
      { error: 'Failed to fetch phone' },
      { status: 500 }
    )
  }
}
