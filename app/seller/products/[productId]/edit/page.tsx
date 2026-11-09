'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ImageUploadDragDrop from '@/app/components/ImageUploadDragDrop'

export default function EditProduct({ params }: { params: Promise<{ productId: string }> }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [productId, setProductId] = useState<string>('')
  const [categories, setCategories] = useState<any[]>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    scale: ''
  })
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const getParams = async () => {
      const { productId } = await params
      setProductId(productId)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (!session) {
      router.push('/auth/login')
      return
    }
    if (productId) {
      fetchData()
    }
  }, [session, productId])

  useEffect(() => {
    const urls = selectedFiles.map((file) => URL.createObjectURL(file))
    setPreviewUrls(urls)

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [selectedFiles])

  const fetchData = async () => {
    try {
      const [productRes, categoriesRes] = await Promise.all([
        fetch(`/api/products/${productId}`),
        fetch('/api/categories'),
      ])


      if (productRes.ok) {
        const data = await productRes.json()
        const product = data.product
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price.toString(),
          categoryId: product.categoryId,
          scale: product.scale
        })
        setExistingImages(product.images || [])
      }

      if (categoriesRes.ok) {
        const data = await categoriesRes.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Greška pri učitavanju proizvoda')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const body = new FormData()
      body.append('name', formData.name)
      body.append('description', formData.description)
      body.append('price', formData.price)
      body.append('categoryId', formData.categoryId)
      body.append('scale', formData.scale)

      // Add new images
      selectedFiles.forEach((file) => {
        body.append('images', file)
      })

      // Add existing images that should be kept
      const imagesToKeep = existingImages.filter((img) => !imagesToRemove.includes(img))
      body.append('existingImages', JSON.stringify(imagesToKeep))

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        body,
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/seller/dashboard')
      } else {
        setError(data.error || 'Greška pri ažuriranju proizvoda')
      }
    } catch (err) {
      setError('Greška pri ažuriranju proizvoda')
    } finally {
      setSaving(false)
    }
  }

  const toggleImageRemoval = (image: string) => {
    setImagesToRemove((prev) =>
      prev.includes(image) ? prev.filter((img) => img !== image) : [...prev, image]
    )
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Učitavanje...</div>
  }

  const currentImageCount = existingImages.length - imagesToRemove.length + selectedFiles.length
  const canAddMoreImages = currentImageCount < 5

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/seller/dashboard" className="text-primary-600 hover:text-primary-700">
            ← Nazad na dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold mb-6">Uredi proizvod</h1>

          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Naziv proizvoda *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opis *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cena (RSD) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategorija *
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Izaberite kategoriju</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Razmera (Scale) *
              </label>
              <select
                required
                value={formData.scale}
                onChange={(e) => setFormData({ ...formData, scale: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="1:18">1:18</option>
                <option value="1:24">1:24</option>
                <option value="1:32">1:32</option>
                <option value="1:43">1:43</option>
                <option value="1:64">1:64</option>
                <option value="1:87">1:87</option>
                <option value="1:100">1:100</option>
                <option value="1:120">1:120</option>
                <option value="1:160">1:160</option>
                <option value="Ostalo">Ostalo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postojeće slike ({existingImages.length - imagesToRemove.length}/{existingImages.length})
              </label>
              <p className="text-xs text-slate-500 mb-3">
                💡 Prevucite slike da biste promenili redosled. Prva slika je thumbnail. Kliknite na sliku da je obrišete.
              </p>
              {existingImages.length > 0 && (
                <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {existingImages.map((image, index) => (
                    <div
                      key={index}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = 'move'
                        e.dataTransfer.setData('existingImageIndex', index.toString())
                      }}
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.dataTransfer.dropEffect = 'move'
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        const sourceIndex = parseInt(e.dataTransfer.getData('existingImageIndex'))
                        if (sourceIndex === index) return
                        
                        const newImages = [...existingImages]
                        const [movedImage] = newImages.splice(sourceIndex, 1)
                        newImages.splice(index, 0, movedImage)
                        setExistingImages(newImages)
                      }}
                      onClick={() => toggleImageRemoval(image)}
                      className={`overflow-hidden rounded-3xl border-2 transition-all cursor-move ${
                        imagesToRemove.includes(image)
                          ? 'border-red-300 bg-red-50 opacity-50'
                          : 'border-slate-200 bg-slate-50 hover:border-blue-400'
                      } shadow-sm`}
                    >
                      <div className="relative h-36 w-full bg-slate-100">
                        <img
                          src={image}
                          alt={`Product image ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        {/* First Image Badge */}
                        {index === 0 && !imagesToRemove.includes(image) && (
                          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                            </svg>
                            Thumb
                          </div>
                        )}
                        {imagesToRemove.includes(image) && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                            <span className="text-white font-semibold">Obriši</span>
                          </div>
                        )}
                      </div>
                      <div className="p-2 text-xs text-slate-600 text-center">
                        Kliknite da obrišete
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {canAddMoreImages && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Dodaj nove slike - prevucite ili kliknite za učitavanje ({selectedFiles.length} nova)
                </label>
                <ImageUploadDragDrop
                  maxFiles={5 - (existingImages.length - imagesToRemove.length)}
                  selectedFiles={selectedFiles}
                  previewUrls={previewUrls}
                  onFilesSelected={setSelectedFiles}
                  onClearAll={() => setSelectedFiles([])}
                />
              </div>
            )}

            {!canAddMoreImages && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
                Dostigli ste maksimalnih 5 slika.
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Čuvanje...' : 'Sačuvaj izmene'}
              </button>
              <Link
                href="/seller/dashboard"
                className="flex-1 rounded-full bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 text-center"
              >
                Otkaži
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
