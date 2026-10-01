'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import ProductCard from './components/ProductCard'
import MessageBadge from './components/MessageBadge'
import Header from './components/Header'

export default function Home() {
  const { data: session } = useSession()
  const [products, setProducts] = useState<any[]>([])
  const [promotedProducts, setPromotedProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedScale, setSelectedScale] = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set())

  // Available scales
  const scales = ['1:18', '1:24', '1:32', '1:43', '1:64', '1:87', '1:100', '1:144', '1:200']

  // Fetch wishlist once on mount and when session changes
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!session?.user) {
        setWishlistIds(new Set())
        return
      }

      try {
        const response = await fetch('/api/wishlist')
        if (response.ok) {
          const data = await response.json()
          const ids = new Set<string>((data.items || []).map((item: any) => item.productId))
          setWishlistIds(ids)
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error)
      }
    }

    fetchWishlist()
  }, [session?.user])

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [searchQuery, selectedCategory, selectedScale, page, pageSize])

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (selectedCategory) params.append('categoryId', selectedCategory)
      if (selectedScale) params.append('scale', selectedScale)
      params.append('page', page.toString())
      params.append('limit', pageSize.toString())

      const response = await fetch(`/api/products?${params}`)
      const data = await response.json()
      setProducts(data.products || [])
      setPromotedProducts(data.promotedProducts || [])
      setTotalPages(data.pagination?.totalPages || 1)
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

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Search Bar and Filters */}
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Pretraži proizvode..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
            className="flex-1 px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 transition-all shadow-sm"
          />
          <div className="flex gap-3 items-center">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setPage(1)
              }}
              className="px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-all shadow-sm font-medium"
            >
              <option value="">Sve kategorije</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <select
              value={selectedScale}
              onChange={(e) => {
                setSelectedScale(e.target.value)
                setPage(1)
              }}
              className="px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-all shadow-sm font-medium"
            >
              <option value="">Sve razmere</option>
              {scales.map((scale) => (
                <option key={scale} value={scale}>{scale}</option>
              ))}
            </select>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value))
                setPage(1)
              }}
              className="px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-all shadow-sm font-medium"
            >
              <option value="10">10 po stranici</option>
              <option value="25">25 po stranici</option>
              <option value="50">50 po stranici</option>
            </select>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Promoted Products */}
        {promotedProducts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Istaknuti proizvodi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {promotedProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  promoted 
                  isInWishlist={wishlistIds.has(product.id)}
                  onWishlistChange={(isAdded) => {
                    if (isAdded) {
                      setWishlistIds(prev => new Set([...prev, product.id]))
                    } else {
                      setWishlistIds(prev => {
                        const next = new Set(prev)
                        next.delete(product.id)
                        return next
                      })
                    }
                  }}
                />
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
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {products.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product}
                    isInWishlist={wishlistIds.has(product.id)}
                    onWishlistChange={(isAdded) => {
                      if (isAdded) {
                        setWishlistIds(prev => new Set([...prev, product.id]))
                      } else {
                        setWishlistIds(prev => {
                          const next = new Set(prev)
                          next.delete(product.id)
                          return next
                        })
                      }
                    }}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => handlePageChange(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Prethodna
                  </button>

                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Sledeća →
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  )
}
