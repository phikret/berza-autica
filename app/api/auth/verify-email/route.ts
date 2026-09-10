import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token nije pronađen' },
        { status: 400 }
      )
    }

    // Find verification token
    const verificationToken = await prisma.emailVerification.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Nevalidan ili istekao token' },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (verificationToken.expiresAt < new Date()) {
      // Delete expired token
      await prisma.emailVerification.delete({
        where: { id: verificationToken.id },
      })

      return NextResponse.json(
        { error: 'Token je istekao. Molimo registrujte se ponovo.' },
        { status: 400 }
      )
    }

    // Update member as verified
    await prisma.member.update({
      where: { id: verificationToken.memberId },
      data: { emailVerified: true },
    })

    // Delete verification token
    await prisma.emailVerification.delete({
      where: { id: verificationToken.id },
    })

    // Return success response (frontend će da redirecta)
    return NextResponse.json(
      { 
        success: true,
        message: 'Email je uspješno verificiran'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Došlo je do greške pri verifikaciji email-a' },
      { status: 500 }
    )
  }
}
