import { v2 as cloudinary } from 'cloudinary'
import { Buffer } from 'buffer'

// Configure Cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const cloudApiKey = process.env.CLOUDINARY_API_KEY
const cloudApiSecret = process.env.CLOUDINARY_API_SECRET

if (!cloudName || !cloudApiKey || !cloudApiSecret) {
  console.error('Cloudinary environment variables missing:', {
    cloudName: !!cloudName,
    cloudApiKey: !!cloudApiKey,
    cloudApiSecret: !!cloudApiSecret,
  })
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: cloudApiKey,
  api_secret: cloudApiSecret,
})

export default cloudinary

// Upload image to Cloudinary
export async function uploadImage(file: File | string, folder: string = 'products') {
  try {
    let uploadSource = file as string

    if (typeof file !== 'string') {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const base64 = buffer.toString('base64')
      uploadSource = `data:${file.type};base64,${base64}`
    }

    const result = await cloudinary.uploader.upload(uploadSource, {
      folder: `berza-autica/${folder}`,
      transformation: [
        { width: 1000, height: 1000, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    })
    return result.secure_url
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to upload image: ${error.message}`)
    }
    throw new Error('Failed to upload image')
  }
}

// Delete image from Cloudinary
export async function deleteImage(publicId: string) {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error)
    throw new Error('Failed to delete image')
  }
}

// Get public ID from Cloudinary URL
export function getPublicIdFromUrl(url: string): string {
  const parts = url.split('/')
  const filename = parts[parts.length - 1]
  const publicId = filename.split('.')[0]
  return `berza-autica/${parts[parts.length - 2]}/${publicId}`
}

