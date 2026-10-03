import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/contact
 * Public endpoint to get admin contact info for users to send messages
 * Does not require authentication
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await prisma.member.findFirst({
      where: {
        role: 'admin',
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    if (!admin) {
      return NextResponse.json(
        { error: 'No admin available' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      admin,
    })
  } catch (error) {
    console.error('Error fetching admin contact:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin contact' },
      { status: 500 }
    )
  }
}
