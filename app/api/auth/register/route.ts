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
  console.log('\n' + '='.repeat(80))
  console.log('📝 REGISTRATION REQUEST STARTED')
  console.log('='.repeat(80))
  
  try {
    const body = await request.json()
    console.log('✅ Body parsed:', { email: body.email, name: body.name })
    
    // Validate input
    const validatedData = registerSchema.parse(body)
    console.log('✅ Validation passed')

    // Verify CAPTCHA
    console.log('🔐 Verifying CAPTCHA...')
    const captchaValid = await verifyCaptcha(validatedData.captchaToken)
    if (!captchaValid) {
      console.log('❌ CAPTCHA verification failed')
      return NextResponse.json(
        { error: 'CAPTCHA verifikacija neuspješna. Molimo pokušajte ponovo.' },
        { status: 400 }
      )
    }
    console.log('✅ CAPTCHA verified')

    // Check if user already exists
    console.log('🔍 Checking if user exists...')
    const existingMember = await prisma.member.findUnique({
      where: { email: validatedData.email },
    })

    if (existingMember) {
      console.log('❌ User already exists:', validatedData.email)
      return NextResponse.json(
        { error: 'Email adresa je već registrovana' },
        { status: 400 }
      )
    }
    console.log('✅ User does not exist')

    // Hash password
    console.log('🔐 Hashing password...')
    const hashedPassword = await hash(validatedData.password, 10)
    console.log('✅ Password hashed')

    // Generate verification token before transaction
    console.log('🎫 Generating verification token...')
    const verificationToken = generateEmailVerificationToken()
    const expiresAt = getTokenExpiry(24)
    console.log('✅ Token generated:', verificationToken.slice(0, 10) + '...')

    // Use transaction - all or nothing
    console.log('💾 Starting database transaction...')
    const member = await prisma.$transaction(async (tx) => {
      console.log('  → Creating member...')
      const newMember = await tx.member.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          name: validatedData.name,
          phone: validatedData.phone,
          emailVerified: false,
          balance: 1000,
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      })
      console.log('  ✅ Member created:', newMember.id)

      console.log('  → Creating email verification token...')
      await tx.emailVerification.create({
        data: {
          memberId: newMember.id,
          token: verificationToken,
          expiresAt,
        },
      })
      console.log('  ✅ Email verification token created')

      return newMember
    })
    console.log('✅ Transaction completed successfully')

    // Send verification email AFTER transaction succeeds
    console.log('📧 Sending verification email...')
    try {
      await sendVerificationEmail(
        validatedData.email,
        validatedData.name,
        verificationToken
      )
      console.log('✅ Verification email sent successfully')
    } catch (emailError) {
      console.error('⚠️  Email sending failed (non-critical):', emailError)
    }

    console.log('✅ Registration successful!')
    console.log('='.repeat(80) + '\n')

    return NextResponse.json(
      { 
        success: true, 
        memberId: member.id,
        message: 'Nalog je kreiran. Molimo provjerite vašu email adresu za potvrdu.'
      },
      { status: 201 }
    )
  } catch (error) {
    console.log('❌ ERROR during registration:')
    
    if (error instanceof z.ZodError) {
      console.log('❌ Validation error:', error.issues[0].message)
      console.log('='.repeat(80) + '\n')
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('❌ Registration error details:', error)
    console.log('='.repeat(80) + '\n')
    
    return NextResponse.json(
      { error: 'Došlo je do greške pri registraciji' },
      { status: 500 }
    )
  }
}





