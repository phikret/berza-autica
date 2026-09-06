import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Niste prijavljeni' },
        { status: 401 }
      )
    }

    const { currentPassword, newPassword, confirmPassword } = await request.json()

    // Validacija
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'Sva polja su obavezna' },
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'Nove lozinke se ne poklapaju' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Lozinka mora imati najmanje 6 znakova' },
        { status: 400 }
      )
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: 'Nova lozinka mora biti različita od trenutne' },
        { status: 400 }
      )
    }

    // Pronađi korisnika
    const member = await prisma.member.findUnique({
      where: { id: (session.user as any).id },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Korisnik nije pronađen' },
        { status: 404 }
      )
    }

    // Provjeri trenutnu lozinku
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      member.password
    )

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Trenutna lozinka nije ispravna' },
        { status: 400 }
      )
    }

    // Heširaj novu lozinku
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Ažuriraj lozinku
    await prisma.member.update({
      where: { id: member.id },
      data: { password: hashedPassword },
    })

    // Loguj aktivnost
    await prisma.activityLog.create({
      data: {
        memberId: member.id,
        action: 'CHANGE_PASSWORD',
        details: { timestamp: new Date().toISOString() },
      },
    })

    return NextResponse.json(
      { message: 'Lozinka je uspješno promijenjena' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: 'Greška pri promjeni lozinke' },
      { status: 500 }
    )
  }
}
