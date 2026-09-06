'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'

export default function ProductDetail() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    if (params.slug) {
      fetchProduct()
    }
  }, [params.slug])

  const fetchProduct = async () => {
    try {
      // Find product by slug
      const response = await fetch(`/api/products?search=${params.slug}`)
      const data = await response.json()
      const foundProduct = data.products.find((p: any) => p.slug === params.slug)
      
      if (foundProduct) {
        setProduct(foundProduct)
        setSelectedImageIndex(0)
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async () => {
    if (!session) {
      router.push('/auth/login')
      return
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      })

      if (response.ok) {
        alert('Proizvod je dodat u korpu!')
      } else {
        const data = await response.json()
        alert(data.error || 'Greška pri dodavanju u korpu')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Greška pri dodavanju u korpu')
    }
  }

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    )
  }

  const handleNextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    )
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Učitavanje...</div>
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Proizvod nije pronađen</h1>
          <Link href="/" className="text-primary-600 hover:text-primary-700">
            Nazad na početnu
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/" className="text-primary-600 hover:text-primary-700 mb-6 inline-block">
          ← Nazad na proizvode
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Images - Carousel */}
            <div>
              {product.images && product.images.length > 0 ? (
                <div className="space-y-4">
                  {/* Main Image with Navigation */}
                  <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden">
                    <Image
                      src={product.images[selectedImageIndex]}
                      alt={product.name}
                      fill
                      className="object-cover rounded-lg"
                      priority
                    />
                    
                    {/* Navigation Arrows */}
                    {product.images.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition z-10"
                          aria-label="Prethodna slika"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>

                        <button
                          onClick={handleNextImage}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition z-10"
                          aria-label="Sledeća slika"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>

                        {/* Image Counter */}
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm font-medium">
                          {selectedImageIndex + 1} / {product.images.length}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Navigation */}
                  {product.images.length > 1 && (
                    <div className="grid grid-cols-5 gap-2">
                      {product.images.map((img: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`relative h-20 rounded transition-all ${
                            selectedImageIndex === idx
                              ? 'ring-2 ring-primary-500 scale-105'
                              : 'opacity-75 hover:opacity-100'
                          }`}
                        >
                          <Image
                            src={img}
                            alt={`${product.name} ${idx + 1}`}
                            fill
                            className="object-cover rounded"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">Nema slike</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-primary-600">{product.price} RSD</span>
              </div>

              <div className="mb-6">
                <h2 className="font-semibold mb-2">Opis:</h2>
                <p className="text-gray-700">{product.description}</p>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  Kategorija: <span className="font-medium">{product.category.name}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Prodavac: <span className="font-medium">{product.seller.name}</span>
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={addToCart}
                  className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 font-semibold"
                >
                  Dodaj u korpu
                </button>
                
                {session && (session.user as any)?.id !== product.sellerId ? (
                  <Link
                    href={`/messages?sellerId=${product.sellerId}&productId=${product.id}`}
                    className="block w-full bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 font-semibold text-center"
                  >
                    Kontaktiraj prodavca
                  </Link>
                ) : session ? (
                  <button
                    disabled
                    className="w-full bg-gray-300 text-gray-600 py-3 rounded-lg font-semibold cursor-not-allowed"
                    title="Ne možete kontaktirati sebe"
                  >
                    Kontaktiraj prodavca
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

