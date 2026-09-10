import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { generateEmailVerificationToken, getTokenExpiry } from '@/lib/tokens'
import { sendVerificationEmail } from '@/lib/email'

const resendSchema = z.object({
  email: z.string().email('Neispravna email adresa'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = resendSchema.parse(body)

    // Find member by email
    const member = await prisma.member.findUnique({
      where: { email: validatedData.email },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Email nije pronađen u sistemu' },
        { status: 404 }
      )
    }

    // Check if already verified
    if (member.emailVerified) {
      return NextResponse.json(
        { error: 'Email je već verificiran' },
        { status: 400 }
      )
    }

    // Delete old verification tokens
    await prisma.emailVerification.deleteMany({
      where: { memberId: member.id },
    })

    // Generate new verification token
    const verificationToken = generateEmailVerificationToken()
    const expiresAt = getTokenExpiry(24)

    // Store verification token in database
    await prisma.emailVerification.create({
      data: {
        memberId: member.id,
        token: verificationToken,
        expiresAt,
      },
    })

    // Send verification email
    try {
      await sendVerificationEmail(
        validatedData.email,
        member.name,
        verificationToken
      )
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      return NextResponse.json(
        { error: 'Greška pri slanju emaila' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Verifikacijski email je ponovo poslан. Molimo provjerite vašu inbox.'
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Resend verification email error:', error)
    return NextResponse.json(
      { error: 'Došlo je do greške' },
      { status: 500 }
    )
  }
}
