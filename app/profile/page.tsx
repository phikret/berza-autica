'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ProfilePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [balance, setBalance] = useState(0)
  const [history, setHistory] = useState<any[]>([])
  const [topupAmount, setTopupAmount] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      router.push('/auth/login')
      return
    }
    fetchBalance()
  }, [session])

  const fetchBalance = async () => {
    try {
      const response = await fetch('/api/balance')
      if (response.ok) {
        const data = await response.json()
        setBalance(data.balance)
        setHistory(data.history || [])
      }
    } catch (error) {
      console.error('Error fetching balance:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseInt(topupAmount)
    if (amount <= 0) return

    try {
      const response = await fetch('/api/balance/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      })

      if (response.ok) {
        setTopupAmount('')
        await fetchBalance()
      }
    } catch (error) {
      console.error('Error topping up:', error)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Učitavanje...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Profil</h1>
          <Link href="/" className="text-primary-600 hover:text-primary-700">
            Početna
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* User Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Informacije</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600">Ime:</span>
                <span className="ml-2 font-medium">{session?.user?.name}</span>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <span className="ml-2 font-medium">{session?.user?.email}</span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="mt-4 w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
              >
                Odjavi se
              </button>
            </div>
          </div>

          {/* Balance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Balans tokena</h2>
            <div className="text-4xl font-bold text-primary-600 mb-4">
              {balance} tokena
            </div>
            <form onSubmit={handleTopup} className="space-y-3">
              <input
                type="number"
                min="1"
                placeholder="Iznos"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-2 rounded hover:bg-primary-700"
              >
                Dodaj tokene
              </button>
            </form>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-bold">Istorija transakcija</h2>
          </div>
          <div className="divide-y">
            {history.length === 0 ? (
              <div className="p-6 text-center text-gray-600">
                Nema transakcija
              </div>
            ) : (
              history.map((tx: any, idx) => (
                <div key={idx} className="px-6 py-4 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{tx.description}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(tx.createdAt).toLocaleString('sr-RS')}
                    </div>
                  </div>
                  <div className={`font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount} tokena
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

