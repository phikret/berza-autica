'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ImageUploadDragDrop from '@/app/components/ImageUploadDragDrop'

export default function NewProduct() {
  const { data: session } = useSession()
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    scale: '1:43',
  })
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session) {
      router.push('/auth/login')
      return
    }
    fetchCategories()
  }, [session])

  useEffect(() => {
    const urls = selectedFiles.map((file) => URL.createObjectURL(file))
    setPreviewUrls(urls)

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [selectedFiles])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setIsUploading(true)

    try {
      const body = new FormData()
      body.append('name', formData.name)
      body.append('description', formData.description)
      body.append('price', formData.price)
      body.append('categoryId', formData.categoryId)
      body.append('scale', formData.scale)

      selectedFiles.slice(0, 5).forEach((file) => {
        body.append('images', file)
      })

      const response = await fetch('/api/products', {
        method: 'POST',
        body,
      })

      const data = await response.json()

      if (response.ok) {
        setIsUploading(false)
        router.push('/seller/dashboard')
      } else {
        setError(data.error || 'Greška pri kreiranju proizvoda')
        setIsUploading(false)
      }
    } catch (err) {
      setError('Greška pri kreiranju proizvoda')
      setIsUploading(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/seller/dashboard" className="text-primary-600 hover:text-primary-700">
            ← Nazad na dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold mb-6">Novi proizvod</h1>

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
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Slike - prevucite ili kliknite za učitavanje *
              </label>
              <ImageUploadDragDrop
                maxFiles={5}
                selectedFiles={selectedFiles}
                previewUrls={previewUrls}
                onFilesSelected={setSelectedFiles}
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Postavljanje...' : 'Sačuvaj oglas'}
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

      {/* Upload Overlay with Loader */}
      {isUploading && (
        <div className="fixed inset-0 bg-white/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 flex flex-col items-center gap-4">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-600 animate-spin"></div>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">Postavljam slike...</p>
              <p className="text-sm text-gray-500 mt-2">Molim vas čekajte dok se slike učitavaju</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

