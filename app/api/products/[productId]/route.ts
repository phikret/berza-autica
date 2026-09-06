import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uploadImage, getPublicIdFromUrl, deleteImage } from '@/lib/cloudinary'
import { z } from 'zod'

const updateProductSchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  price: z.number().int().positive().optional(),
  categoryId: z.string().optional(),
  images: z.array(z.string()).min(1).max(5).optional(),
  isActive: z.boolean().optional(),
})

async function parseUpdateProductRequest(request: NextRequest) {
  const contentType = request.headers.get('content-type') || ''

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData()
    const name = formData.get('name')?.toString()
    const description = formData.get('description')?.toString()
    const priceString = formData.get('price')?.toString()
    const categoryId = formData.get('categoryId')?.toString()
    const existingImagesStr = formData.get('existingImages')?.toString() || '[]'
    const isActiveStr = formData.get('isActive')?.toString()

    const existingImages: string[] = JSON.parse(existingImagesStr)
    const imageItems = formData.getAll('images')
    const newImages: string[] = []

    for (const item of imageItems) {
      if (item instanceof File) {
        if (!item.type.startsWith('image/')) {
          throw new Error('Samo slike su dozvoljene za upload')
        }
        const imageUrl = await uploadImage(item)
        newImages.push(imageUrl)
      }
    }

    const images = [...existingImages, ...newImages]

    const result: any = {
      images: images.length > 0 ? images : undefined,
    }

    if (name) result.name = name
    if (description) result.description = description
    if (priceString) result.price = parseInt(priceString, 10)
    if (categoryId) result.categoryId = categoryId
    if (isActiveStr !== undefined && isActiveStr !== '') result.isActive = isActiveStr === 'true'

    return result
  }

  const body = await request.json()
  return body
}

// GET /api/products/[productId] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

// PATCH /api/products/[productId] - Update product
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { productId } = await params
    const sellerId = (session.user as any).id

    // Check if product belongs to seller
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    if (existingProduct.sellerId !== sellerId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await parseUpdateProductRequest(request)
    const validatedData = updateProductSchema.parse(body)

    // If images were updated, delete old images that are no longer used
    if (validatedData.images && validatedData.images.length > 0) {
      const oldImages = (existingProduct.images as string[]) || []
      const newImages = validatedData.images || []
      const imagesToDelete = oldImages.filter((img) => !newImages.includes(img))

      for (const imageUrl of imagesToDelete) {
        try {
          const publicId = getPublicIdFromUrl(imageUrl)
          await deleteImage(publicId)
        } catch (error) {
          console.error('Error deleting image:', error)
          // Continue even if delete fails
        }
      }
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: validatedData,
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      product,
      message: 'Proizvod je uspešno ažuriran',
    })
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

    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[productId] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { productId } = await params
    const sellerId = (session.user as any).id

    // Check if product belongs to seller
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    if (existingProduct.sellerId !== sellerId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Delete product images from Cloudinary
    if (existingProduct.images && (existingProduct.images as string[]).length > 0) {
      for (const imageUrl of (existingProduct.images as string[])) {
        try {
          const publicId = getPublicIdFromUrl(imageUrl)
          await deleteImage(publicId)
        } catch (error) {
          console.error('Error deleting image:', error)
          // Continue even if delete fails
        }
      }
    }

    await prisma.product.delete({
      where: { id: productId },
    })

    return NextResponse.json({
      success: true,
      message: 'Proizvod je uspešno obrisan',
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
