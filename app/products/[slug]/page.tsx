'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'

export default function ProductDetail() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showTooltip, setShowTooltip] = useState(false)
  const [inWishlist, setInWishlist] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)

  useEffect(() => {
    if (params.slug) {
      fetchProduct()
    }
  }, [params.slug])

  useEffect(() => {
    if (product && session) {
      checkWishlist()
    }
  }, [product, session])

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

  const checkWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist')
      if (response.ok) {
        const data = await response.json()
        const exists = data.items?.some((item: any) => item.product.id === product.id)
        setInWishlist(exists || false)
      }
    } catch (error) {
      console.error('Error checking wishlist:', error)
    }
  }

  const handleWishlistClick = async () => {
    if (!session) {
      router.push('/auth/login')
      return
    }

    setWishlistLoading(true)
    try {
      if (inWishlist) {
        const response = await fetch(`/api/wishlist/${product.id}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          setInWishlist(false)
          toast.success('Proizvod je uklonjen iz liste želja')
          window.dispatchEvent(new Event('wishlistChanged'))
        } else {
          const error = await response.json()
          toast.error('Greška pri brisanju iz liste želja: ' + error.error)
        }
      } else {
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId: product.id }),
        })
        
        if (response.ok) {
          setInWishlist(true)
          toast.success('Proizvod je dodan u listu želja!')
          window.dispatchEvent(new Event('wishlistChanged'))
        } else {
          const error = await response.json()
          toast.error(`Greška: ${error.error}`)
        }
      }
    } catch (error) {
      console.error('Error updating wishlist:', error)
      toast.error('Greška pri ažuriranju liste želja')
    } finally {
      setWishlistLoading(false)
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

        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 lg:p-10">
            {/* Images - Carousel */}
            <div className="lg:col-span-2">
              {product.images && product.images.length > 0 ? (
                <div className="space-y-4">
                  {/* Main Image with Navigation */}
                  <div className="relative h-96 lg:h-full lg:min-h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-lg group">
                    <Image
                      src={product.images[selectedImageIndex]}
                      alt={product.name}
                      fill
                      className="object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                      priority
                    />
                    
                    {/* Navigation Arrows */}
                    {product.images.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-900 p-3 rounded-full transition duration-200 shadow-md hover:shadow-lg z-10"
                          aria-label="Prethodna slika"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>

                        <button
                          onClick={handleNextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-900 p-3 rounded-full transition duration-200 shadow-md hover:shadow-lg z-10"
                          aria-label="Sledeća slika"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>

                        {/* Image Counter */}
                        <div className="absolute bottom-4 right-4 bg-gray-900 bg-opacity-70 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
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
                          className={`relative h-24 rounded-lg transition-all overflow-hidden border-2 ${
                            selectedImageIndex === idx
                              ? 'border-primary-500 ring-2 ring-primary-300 shadow-lg scale-105'
                              : 'border-gray-200 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <Image
                            src={img}
                            alt={`${product.name} ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* "Kako da kupim?" Link with Tooltip */}
                  <div className="mt-4 relative inline-block">
                    <button
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                      onClick={() => setShowTooltip(!showTooltip)}
                      className="text-blue-600 hover:text-blue-700 hover:underline font-medium text-sm transition flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Kako da kupim?
                    </button>
                    
                    {showTooltip && (
                      <div className="absolute bottom-full mb-2 left-0 w-72 bg-gray-900 text-white text-sm rounded-lg p-4 shadow-xl z-20">
                        <p className="leading-relaxed">
                          Možete kontaktirati prodavca putem Berza Autica poruka ako ste registrovani i prijavljeni član. Klikom na link "Svi oglasi" vodi vas na stranu gde možete da vidite broj prodavca.
                        </p>
                        <div className="absolute top-full left-6 w-3 h-3 bg-gray-900 transform rotate-45"></div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-96 lg:h-full lg:min-h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                  <span className="text-gray-400 text-lg">Nema slike</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="lg:col-span-1 flex flex-col justify-between">
              <div className="space-y-6">
                {/* Category */}
                <div>
                  <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-2">
                    {product.category.name}
                  </p>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                    {product.name}
                  </h1>
                </div>
                
                {/* Price Section */}
                <div className="border-l-4 border-primary-500 pl-4 py-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Cena</p>
                  <p className="text-4xl font-bold text-primary-600">
                    {product.price} RSD
                  </p>
                </div>

                {/* Description */}
                <div>
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Opis proizvoda</h2>
                  <p className="text-base text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                    {product.description}
                  </p>
                </div>

                {/* Seller Info */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Prodavac</p>
                      <p className="font-bold text-gray-900 text-lg">{product.seller.name}</p>
                    </div>
                    <button
                      onClick={() => window.location.href = `/seller/${product.seller.id}`}
                      className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition duration-200"
                    >
                      Svi oglasi
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-8">
                {/* Wishlist Button */}
                <button
                  onClick={handleWishlistClick}
                  disabled={wishlistLoading}
                  className={`w-full py-3 px-6 rounded-lg font-bold text-base transition duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 border-2 ${
                    inWishlist
                      ? 'bg-red-50 text-red-600 border-red-300 hover:bg-red-100'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={inWishlist ? 'Ukloni iz liste želja' : 'Dodaj u listu želja'}
                >
                  {inWishlist ? (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      U listi želja
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      Dodaj u listu želja
                    </>
                  )}
                </button>
                
                {session && (session.user as any)?.id !== product.sellerId ? (
                  <Link
                    href={`/messages?sellerId=${product.sellerId}&productId=${product.id}`}
                    className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-200 font-bold text-base text-center shadow-md hover:shadow-lg"
                  >
                    Kontaktiraj prodavca
                  </Link>
                ) : session ? (
                  <button
                    disabled
                    className="w-full bg-gray-200 text-gray-500 py-3 px-6 rounded-lg font-bold text-base cursor-not-allowed shadow-sm"
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

