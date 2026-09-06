'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SellerDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [balance, setBalance] = useState(0)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      router.push('/auth/login')
      return
    }
    fetchData()
  }, [session])

  const fetchData = async () => {
    try {
      const [productsRes, balanceRes] = await Promise.all([
        fetch('/api/products?myProducts=true'),
        fetch('/api/balance'),
      ])

      if (productsRes.ok) {
        const data = await productsRes.json()
        setProducts(data.products || [])
      }

      if (balanceRes.ok) {
        const data = await balanceRes.json()
        setBalance(data.balance)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      })

      if (response.ok) {
        alert(!currentStatus ? 'Proizvod je aktiviran' : 'Proizvod je deaktiviran')
        await fetchData()
      } else {
        const data = await response.json()
        alert(data.error || 'Greška pri promeni statusa proizvoda')
      }
    } catch (error) {
      console.error('Error toggling product status:', error)
      alert('Greška pri promeni statusa proizvoda')
    }
  }

  const deleteProduct = async (productId: string) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovaj proizvod?')) {
      return
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const promoteProduct = async (productId: string) => {
    if (!confirm('Promocija proizvoda košta 300 tokena. Nastaviti?')) {
      return
    }

    try {
      const response = await fetch(`/api/products/${productId}/promote`, {
        method: 'POST',
      })

      const data = await response.json()
      
      if (response.ok) {
        alert(data.message)
        await fetchData()
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('Error promoting product:', error)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Učitavanje...</div>
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 mb-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500 mb-2">Prodavac</p>
              <h1 className="text-4xl font-semibold text-slate-900">Moji proizvodi</h1>
              <p className="mt-2 text-sm text-slate-600 max-w-2xl">
                Pregledajte svoje artikle, objavite novi proizvod ili upravljajte aktivnostima prodaje.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center shadow-sm">
                <div className="text-sm text-slate-600">Balans</div>
                <div className="mt-1 text-xl font-semibold text-slate-900">{balance} tokena</div>
              </div>
              <Link
                href="/seller/products/new"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
              >
                + Novi proizvod
              </Link>
              <Link href="/" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                Početna
              </Link>
            </div>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              <span className="text-2xl font-bold">+</span>
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">Nemate objavljenih proizvoda</h2>
            <p className="mx-auto max-w-xl text-sm leading-7 text-slate-600 mb-8">
              Objavite svoj prvi proizvod i počnite sa prodajom odmah. Kliknite na plavo dugme ispod da dodate novi oglas.
            </p>
            <Link
              href="/seller/products/new"
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            >
              Objavi proizvod
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proizvod</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cena</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Akcije</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.category.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.price} RSD
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.isActive ? 'Aktivan' : 'Neaktivan'}
                        </span>
                        {product.isPromoted && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Promovisan
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <Link href={`/products/${product.slug}`} className="text-primary-600 hover:text-primary-900">
                        Pregled
                      </Link>
                      <Link href={`/seller/products/${product.id}/edit`} className="text-blue-600 hover:text-blue-900">
                        Uredi
                      </Link>
                      <button
                        onClick={() => toggleProductStatus(product.id, product.isActive)}
                        className={`${product.isActive ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`}
                      >
                        {product.isActive ? 'Deaktiviraj' : 'Aktiviraj'}
                      </button>
                      {!product.isPromoted && (
                        <button
                          onClick={() => promoteProduct(product.id)}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          Promoviši
                        </button>
                      )}
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Obriši
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

