'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import Image from 'next/image'

export default function SellerPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const sellerId = params.id as string
  const currentPage = parseInt(searchParams.get('page') || '1')

  const [products, setProducts] = useState<any[]>([])
  const [pagination, setPagination] = useState<any>(null)
  const [sellerName, setSellerName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSellerProducts()
  }, [sellerId, currentPage])

  const fetchSellerProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/products/seller/${sellerId}?page=${currentPage}&pageSize=12`
      )
      const data = await response.json()

      if (data.products && data.products.length > 0) {
        setSellerName(data.products[0].seller.name)
      }

      setProducts(data.products || [])
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching seller products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const goToPage = (page: number) => {
    const url = new URL(window.location.href)
    url.searchParams.set('page', page.toString())
    window.history.pushState({}, '', url)
    fetchSellerProducts()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-primary-600 hover:text-primary-700">
              ← Nazad
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              {sellerName || 'Proizvodi prodavca'}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">Učitavanje...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            Nema proizvoda od ovog prodavca
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="mb-8">
              <p className="text-gray-600 mb-6">
                Ukupno proizvoda: {pagination?.total}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Prethodna
                </button>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-2 rounded-lg ${
                        page === currentPage
                          ? 'bg-primary-600 text-white'
                          : 'border hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Sljedeća
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function ProductCard({ product }: { product: any }) {
  return (
    <Link href={`/products/${product.slug}`}>
      <div className={`bg-white rounded-xl overflow-hidden shadow hover:shadow-xl transition-all duration-300 ${product.promoted ? 'ring-2 ring-yellow-400' : ''}`}>
        {/* Image Section */}
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
              {product.promoted && (
                <div className="inline-flex items-center gap-2 w-fit">
                  <span className="text-yellow-500">⭐</span>
                  <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full">
                    Istaknuto
                  </span>
                </div>
              )}
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
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                Cena
                <span className="text-m font-bold text-black">
                  {product.price} RSD{' '}
                </span>
              </p>
            </div>

            {/* Seller Info */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {product.seller.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-700 font-medium">
                {product.seller.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
