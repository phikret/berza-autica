import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { verifyCaptcha } from '@/lib/captcha'
import { generateEmailVerificationToken, getTokenExpiry } from '@/lib/tokens'
import { sendVerificationEmail } from '@/lib/email'

const registerSchema = z.object({
  email: z.string().email('Neispravna email adresa'),
  password: z.string().min(8, 'Lozinka mora imati najmanje 8 karaktera'),
  name: z.string().min(2, 'Ime mora imati najmanje 2 karaktera'),
  phone: z.string().optional(),
  captchaToken: z.string().min(1, 'CAPTCHA je obavezna'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = registerSchema.parse(body)

    // Verify CAPTCHA
    const captchaValid = await verifyCaptcha(validatedData.captchaToken)
    if (!captchaValid) {
      return NextResponse.json(
        { error: 'CAPTCHA verifikacija neuspješna. Molimo pokušajte ponovo.' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingMember = await prisma.member.findUnique({
      where: { email: validatedData.email },
    })

    if (existingMember) {
      return NextResponse.json(
        { error: 'Email adresa je već registrovana' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(validatedData.password, 10)

    // Create member with emailVerified = false and default balance
    const member = await prisma.member.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        phone: validatedData.phone,
        emailVerified: false,
        balance: 1000, // Default balance for new users
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    })

    // Generate verification token
    const verificationToken = generateEmailVerificationToken()
    const expiresAt = getTokenExpiry(24) // Valid for 24 hours

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
        validatedData.name,
        verificationToken
      )
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      // We'll still return success but log the error
      // In production, you might want to handle this differently
    }

    return NextResponse.json(
      { 
        success: true, 
        memberId: member.id,
        message: 'Nalog je kreiran. Molimo provjerite vašu email adresu za potvrdu.'
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Došlo je do greške pri registraciji' },
      { status: 500 }
    )
  }
}





