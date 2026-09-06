'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function CartPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [groupedBySeller, setGroupedBySeller] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      router.push('/auth/login')
      return
    }
    fetchCart()
  }, [session])

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart')
      if (response.ok) {
        const data = await response.json()
        setGroupedBySeller(data.groupedBySeller || [])
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchCart()
      }
    } catch (error) {
      console.error('Error removing item:', error)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Učitavanje...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Korpa</h1>
          <Link href="/" className="text-primary-600 hover:text-primary-700">
            Nastavi kupovinu
          </Link>
        </div>

        {groupedBySeller.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <h2 className="text-xl font-semibold mb-4">Vaša korpa je prazna</h2>
            <p className="text-gray-600 mb-6">Dodajte proizvode u korpu da biste nastavili</p>
            <Link href="/" className="bg-primary-600 text-white px-6 py-3 rounded hover:bg-primary-700 inline-block">
              Pregledaj proizvode
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedBySeller.map((group: any) => (
              <div key={group.seller.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold">Prodavac: {group.seller.name}</h2>
                  <p className="text-sm text-gray-600">Ukupno: {group.totalPrice} RSD</p>
                </div>
                <div className="divide-y">
                  {group.items.map((item: any) => (
                    <div key={item.id} className="p-6 flex items-center gap-4">
                      {item.product.images && item.product.images[0] && (
                        <div className="relative w-24 h-24 bg-gray-200 rounded flex-shrink-0">
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.product.name}</h3>
                        <p className="text-sm text-gray-600">{item.product.category.name}</p>
                        <p className="text-lg font-bold text-primary-600 mt-2">
                          {item.product.price} RSD
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-600">Količina: {item.quantity}</span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Ukloni
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-50 px-6 py-4 border-t">
                  <Link
                    href={`/messages?sellerId=${group.seller.id}`}
                    className="bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700 inline-block"
                  >
                    Kontaktiraj prodavca
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

