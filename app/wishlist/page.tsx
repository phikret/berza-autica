'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/app/components/Header'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  price: number
  images: string[]
  slug: string
  scale?: string
  seller: {
    id: string
    name: string
  }
}

interface WishlistItem {
  id: string
  product: Product
}

export default function WishlistPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated') {
      fetchWishlist()
    }
  }, [status, router])

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist')
      if (response.ok) {
        const data = await response.json()
        setWishlistItems(data.items || [])
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (productId: string) => {
    try {
      const response = await fetch(`/api/wishlist/${productId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setWishlistItems(wishlistItems.filter(item => item.product.id !== productId))
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error)
    }
  }

  const groupBySeller = () => {
    const grouped: { [sellerId: string]: WishlistItem[] } = {}
    wishlistItems.forEach(item => {
      const sellerId = item.product.seller.id
      if (!grouped[sellerId]) {
        grouped[sellerId] = []
      }
      grouped[sellerId].push(item)
    })
    return grouped
  }

  const handleContactSeller = async (sellerName: string, products: Product[], sellerId: string) => {
    setSendingMessage(sellerId)
    try {
      const productIds = products.map(p => p.id)
      const productList = products.map(p => `- ${p.name} (${p.price} RSD)`).join('\n')
      const messageContent = `Poštovani, zainteresovan sam da kupim ove proizvode od vas:\n\n${productList}`

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: sellerId,
          content: messageContent,
          productIds: productIds,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Poruka je poslana!')
        // Preusmeravanje na messages stranicu
        router.push(`/messages?sellerId=${sellerId}`)
      } else {
        const error = await response.json()
        toast.error('Greška pri slanju poruke: ' + error.error)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Greška pri slanju poruke')
    } finally {
      setSendingMessage(null)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">Učitavanje...</div>
        </div>
      </div>
    )
  }

  const groupedBySeller = groupBySeller()
  const sellerGroups = Object.entries(groupedBySeller)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Moja lista želja</h1>

        {loading ? (
          <div className="text-center py-12">Učitavanje...</div>
        ) : wishlistItems.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <p className="mb-4">Tvoja lista želja je prazna</p>
            <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
              Vrati se na početnu stranicu
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {sellerGroups.map(([sellerId, items]) => {
              const sellerName = items[0].product.seller.name
              const products = items.map(i => i.product)

              return (
                <div key={sellerId} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                      Prodavac: {sellerName}
                    </h2>
                    <button
                      onClick={() => handleContactSeller(sellerName, products, sellerId)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={sendingMessage === sellerId}
                    >
                      {sendingMessage === sellerId ? 'Slanje...' : 'Pošalji poruku'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => window.location.href = `/products/${item.product.slug}`}
                        className="cursor-pointer"
                      >
                        <div className="bg-white rounded-xl overflow-hidden shadow hover:shadow-xl transition-all duration-300">
                          {/* Image Section */}
                          <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                            {item.product.images && item.product.images.length > 0 ? (
                              <Image
                                src={item.product.images[0]}
                                alt={item.product.name}
                                fill
                                className="object-cover object-center"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">Nema slike</div>
                            )}
                          </div>

                          {/* Content Section */}
                          <div className="p-4 space-y-3">
                            {/* Title */}
                            <Link
                              href={`/products/${item.product.slug}`}
                              className="font-bold text-base text-gray-900 leading-snug line-clamp-2 hover:text-blue-600 block"
                            >
                              {item.product.scale && `${item.product.scale} `}
                              {item.product.name}
                            </Link>

                            {/* Price and Remove Button */}
                            <div className="flex gap-4 pt-2">
                              <div className="flex-1">
                                <p className="text-m text-gray-400 tracking-wide font-medium">
                                  Cena &nbsp;
                                  <span className="text-sm font-bold text-black">{item.product.price} RSD</span>
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeFromWishlist(item.product.id)
                                }}
                                className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm flex-shrink-0"
                              >
                                Ukloni
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
