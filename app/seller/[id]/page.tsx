'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import ProductCard from '@/app/components/ProductCard'
import Header from '@/app/components/Header'

export default function SellerPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const sellerId = params.id as string
  const currentPage = parseInt(searchParams.get('page') || '1')

  const [products, setProducts] = useState<any[]>([])
  const [pagination, setPagination] = useState<any>(null)
  const [sellerName, setSellerName] = useState('')
  const [sellerPhone, setSellerPhone] = useState<string | null>(null)
  const [phoneRevealed, setPhoneRevealed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    fetchSellerProducts()
    fetchCategories()
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

  const handlePhoneClick = () => {
    if (sellerPhone && sellerPhone !== 'Broj telefona nije dostupan') {
      window.location.href = `tel:${sellerPhone}`
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Seller Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-primary-600 hover:text-primary-700">
                ← Nazad
              </Link>
              <h2 className="text-2xl font-bold text-gray-900">
                {sellerName || 'Proizvodi prodavca'}
              </h2>
            </div>
            
            <button
              onClick={() => {
                if (phoneRevealed && sellerPhone) {
                  handlePhoneClick()
                } else {
                  handleShowPhone()
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition font-semibold text-base shadow-md cursor-pointer"
            >
              {phoneRevealed && sellerPhone ? (
                <span>{sellerPhone}</span>
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
            {/* Products List */}
            <div className="mb-8">
              <p className="text-gray-600 mb-6">
                Ukupno proizvoda: {pagination?.total}
              </p>
              <div className="space-y-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} variant="list" />
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
