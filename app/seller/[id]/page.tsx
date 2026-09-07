'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import ProductCard from '@/app/components/ProductCard'

export default function SellerPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const sellerId = params.id as string
  const currentPage = parseInt(searchParams.get('page') || '1')

  const [products, setProducts] = useState<any[]>([])
  const [pagination, setPagination] = useState<any>(null)
  const [sellerName, setSellerName] = useState('')
  const [sellerPhone, setSellerPhone] = useState<string | null>(null)
  const [phoneRevealed, setPhoneRevealed] = useState(false)
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

  const fetchSellerPhone = async () => {
    try {
      const response = await fetch(`/api/users/${sellerId}/phone`)
      if (response.ok) {
        const data = await response.json()
        setSellerPhone(data.phone)
      }
    } catch (error) {
      console.error('Error fetching seller phone:', error)
    }
  }

  const handleShowPhone = () => {
    if (!phoneRevealed && !sellerPhone) {
      fetchSellerPhone()
    }
    setPhoneRevealed(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-primary-600 hover:text-primary-700">
                ← Nazad
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">
                {sellerName || 'Proizvodi prodavca'}
              </h1>
            </div>
            
            <button
              onClick={handleShowPhone}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition font-medium"
            >
              {phoneRevealed && sellerPhone ? (
                <a href={`tel:${sellerPhone}`} className="hover:underline">
                  {sellerPhone}
                </a>
              ) : (
                'Klikni za broj telefona'
              )}
            </button>
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
                  <ProductCard key={product.id} product={product} variant="seller" />
                ))}
              </div>
            </div>
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
