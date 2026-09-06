import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateMemberSchema = z.object({
  isActive: z.boolean().optional(),
  role: z.enum(['member', 'admin']).optional(),
})

// PATCH /api/admin/members/[memberId] - Update member status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { memberId } = await params
    const body = await request.json()
    const data = updateMemberSchema.parse(body)

    const member = await prisma.member.update({
      where: { id: memberId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        role: true,
      },
    })

    return NextResponse.json({
      success: true,
      member,
      message: 'Član je ažuriran',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "error.issues[0].message" },
        { status: 400 }
      )
    }

    console.error('Error updating member:', error)
    return NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    )
  }
}





