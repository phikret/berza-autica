import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const defaultCategories = [
  { name: 'Autici', slug: 'autici' },
  { name: 'Kamioni', slug: 'kamioni' },
  { name: 'Autobusi', slug: 'autobusi' },
  { name: 'Avioni', slug: 'avioni' },
]

// GET /api/categories - Get default categories
export async function GET(request: NextRequest) {
  try {
    const categoryPromises = defaultCategories.map((category) =>
      prisma.category.upsert({
        where: { slug: category.slug },
        update: { name: category.name },
        create: category,
      })
    )

    const categories = await Promise.all(categoryPromises)

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

