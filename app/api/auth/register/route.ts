import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

console.log('=== REGISTER ROUTE CALLED ===')
console.log('DATABASE_URL:', process.env.DATABASE_URL)
console.log('All env vars:', Object.keys(process.env).filter(k => k.includes('DATABASE')))

const registerSchema = z.object({
  email: z.string().email('Neispravna email adresa'),
  password: z.string().min(8, 'Lozinka mora imati najmanje 8 karaktera'),
  name: z.string().min(2, 'Ime mora imati najmanje 2 karaktera'),
  phone: z.string().optional(),
})

export async function POST(request: Request) {
  console.log('Register POST handler executing')
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = registerSchema.parse(body)

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
    console.log(validatedData);
    // Create member
    const member = await prisma.member.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        phone: validatedData.phone,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      { 
        success: true, 
        memberId: member.id,
        message: 'Nalog je uspešno kreiran' 
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





