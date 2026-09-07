
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

export default function Home() {
  const { data: session } = useSession()
  const [products, setProducts] = useState<any[]>([])
  const [promotedProducts, setPromotedProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [searchQuery, selectedCategory])

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (selectedCategory) params.append('categoryId', selectedCategory)

      const response = await fetch(`/api/products?${params}`)
      const data = await response.json()
      setProducts(data.products || [])
      setPromotedProducts(data.promotedProducts || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
      setPromotedProducts([])
    } finally {
      setLoading(false)
    }
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Berza Autica</h1>
            <nav className="flex items-center space-x-4">
              {session ? (
                <>
                  <Link href="/seller/dashboard" className="text-gray-700 hover:text-gray-900">
                    Moji proizvodi
                  </Link>
                  <Link href="/cart" className="text-gray-700 hover:text-gray-900">
                    Korpa
                  </Link>
                  <Link href="/messages" className="text-gray-700 hover:text-gray-900">
                    Poruke
                  </Link>
                  <Link href="/profile" className="text-gray-700 hover:text-gray-900">
                    Profil
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="text-gray-700 hover:text-gray-900">
                    Prijava
                  </Link>
                  <Link href="/auth/register" className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">
                    Registracija
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Search Bar */}
          <div className="mt-4 flex gap-4">
            <input
              type="text"
              placeholder="Pretraži proizvode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Sve kategorije</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Promoted Products */}
        {promotedProducts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Istaknuti proizvodi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promotedProducts.map((product) => (
                <ProductCard key={product.id} product={product} promoted />
              ))}
            </div>
          </section>
        )}

        {/* Regular Products */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Svi proizvodi</h2>
          {loading ? (
            <div className="text-center py-12">Učitavanje...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-gray-600">Nema proizvoda</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

function ProductCard({ product, promoted = false }: { product: any; promoted?: boolean }) {
  return (
    <Link href={`/products/${product.slug}`}>
      <div className={`bg-white rounded-xl overflow-hidden shadow hover:shadow-xl transition-all duration-300 ${promoted ? 'ring-2 ring-yellow-400' : ''}`}>
        {/* Image Section - Full width */}
        {product.images && product.images[0] && (
          <div className="relative h-64 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden group">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        
        {/* Content Section */}
        <div className="p-6 space-y-4">
          {/* Badge and Category */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-2">
              {promoted && (
                <div className="inline-flex items-center gap-2 w-fit">
                  <span className="text-yellow-500">⭐</span>
                  <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full">
                    Istaknuto
                  </span>
                </div>
              )}
              <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">
                {product.category.name}
              </p>
            </div>
          </div>
          
          {/* Title */}
          <div>
            <h3 className="font-bold text-lg text-gray-900 leading-snug line-clamp-2">
              {product.name}
            </h3>
          </div>
          
          {/* Description */}
          <p className="text-sm text-gray-500 line-clamp-2">
            {product.description}
          </p>
          
          {/* Footer with Price and Seller */}
          <div className="flex items-end justify-between pt-2 border-t border-gray-100">
            <div className="flex flex-col gap-2">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Cena</p>
              <p className="text-2xl font-bold text-primary-600">
                {product.price} RSD
              </p>
            </div>
            
            {/* Seller Info */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {product.seller.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-700 font-medium">{product.seller.name}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}


