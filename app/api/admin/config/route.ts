import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateConfigSchema = z.object({
  key: z.string(),
  value: z.string(),
  description: z.string().optional(),
})

// GET /api/admin/config - Get all platform configurations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const configs = await prisma.platformConfig.findMany({
      orderBy: { key: 'asc' },
    })

    return NextResponse.json({ configs })
  } catch (error) {
    console.error('Error fetching configs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch configs' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/config - Update platform configuration
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { key, value, description } = updateConfigSchema.parse(body)

    const config = await prisma.platformConfig.upsert({
      where: { key },
      update: {
        value,
        description: description || undefined,
      },
      create: {
        key,
        value,
        description,
      },
    })

    return NextResponse.json({
      success: true,
      config,
      message: 'Konfiguracija je ažurirana',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Error updating config:', error)
    return NextResponse.json(
      { error: 'Failed to update config' },
      { status: 500 }
    )
  }
}

