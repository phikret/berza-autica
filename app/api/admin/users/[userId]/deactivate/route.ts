import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/admin/users/[userId]/deactivate
 * Admin endpoint za deaktivaciju korisnika
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
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
        { error: 'Forbidden - only admins can deactivate users' },
        { status: 403 }
      )
    }

    const { userId } = await params
    const adminId = (session.user as any).id

    // Prevent admin from deactivating themselves
    if (userId === adminId) {
      return NextResponse.json(
        { error: 'Ne možete deaktivirati sami sebe' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.member.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, isActive: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Korisnik nije pronađen' },
        { status: 404 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Korisnik je već deaktiviran' },
        { status: 400 }
      )
    }

    // Deactivate user
    const deactivatedUser = await prisma.member.update({
      where: { id: userId },
      data: { isActive: false },
      select: { id: true, name: true, email: true, isActive: true },
    })

    return NextResponse.json({
      success: true,
      message: `Korisnik ${user.name} je deaktiviran`,
      user: deactivatedUser,
    })
  } catch (error) {
    console.error('Error deactivating user:', error)
    return NextResponse.json(
      { error: 'Failed to deactivate user' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/users/[userId]/deactivate?action=reactivate
 * Admin endpoint za reaktivaciju korisnika
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
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
        { error: 'Forbidden - only admins can reactivate users' },
        { status: 403 }
      )
    }

    const { userId } = await params

    // Check if user exists
    const user = await prisma.member.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, isActive: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Korisnik nije pronađen' },
        { status: 404 }
      )
    }

    if (user.isActive) {
      return NextResponse.json(
        { error: 'Korisnik je već aktivan' },
        { status: 400 }
      )
    }

    // Reactivate user
    const reactivatedUser = await prisma.member.update({
      where: { id: userId },
      data: { isActive: true },
      select: { id: true, name: true, email: true, isActive: true },
    })

    return NextResponse.json({
      success: true,
      message: `Korisnik ${user.name} je reaktiviran`,
      user: reactivatedUser,
    })
  } catch (error) {
    console.error('Error reactivating user:', error)
    return NextResponse.json(
      { error: 'Failed to reactivate user' },
      { status: 500 }
    )
  }
}
