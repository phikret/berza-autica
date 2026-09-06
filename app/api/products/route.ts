import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createProductWithFee } from '@/lib/services/products'
import { uploadImage } from '@/lib/cloudinary'
import { z } from 'zod'

const createProductSchema = z.object({
  name: z.string().min(3, 'Naziv mora imati najmanje 3 karaktera'),
  description: z.string().min(10, 'Opis mora imati najmanje 10 karaktera'),
  price: z.number().int().positive('Cena mora biti pozitivan broj'),
  categoryId: z.string(),
  images: z.array(z.string()).min(1, 'Potrebna je najmanje 1 slika').max(5, 'Maksimalno 5 slika'),
})

async function parseProductRequest(request: NextRequest) {
  const contentType = request.headers.get('content-type') || ''

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData()
    const name = formData.get('name')?.toString() || ''
    const description = formData.get('description')?.toString() || ''
    const priceString = formData.get('price')?.toString() || ''
    const categoryId = formData.get('categoryId')?.toString() || ''

    const imageItems = formData.getAll('images')
    const images: string[] = []

    for (const item of imageItems) {
      if (item instanceof File) {
        if (!item.type.startsWith('image/')) {
          throw new Error('Samo slike su dozvoljene za upload')
        }
        const imageUrl = await uploadImage(item)
        images.push(imageUrl)
      } else if (typeof item === 'string' && item.trim()) {
        images.push(item.trim())
      }
    }

    return {
      name,
      description,
      price: parseInt(priceString, 10),
      categoryId,
      images,
    }
  }

  const body = await request.json()
  return body
}

// GET /api/products - Search and browse products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId')
    const sort = searchParams.get('sort') || 'recent'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      isActive: true,
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    // Build order by clause
    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'price_asc') {
      orderBy = { price: 'asc' }
    } else if (sort === 'price_desc') {
      orderBy = { price: 'desc' }
    }

    // Get promoted products separately
    const promotedProducts = await prisma.product.findMany({
      where: {
        ...where,
        isPromoted: true,
      },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: 10,
      orderBy: { promotedAt: 'desc' },
    })

    // Get regular products
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          seller: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      products,
      promotedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST /api/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await parseProductRequest(request)
    const validatedData = createProductSchema.parse(body)

    const sellerId = (session.user as any).id
    const product = await createProductWithFee(sellerId, validatedData)

    return NextResponse.json(
      {
        success: true,
        product,
        message: 'Proizvod je uspešno kreiran',
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

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}



