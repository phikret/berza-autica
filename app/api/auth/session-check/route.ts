import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      user: session.user,
    }, { status: 200 })
  } catch (error) {
    console.error('[Session Check Error]', error)
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}
