'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.status === 401) {
        router.push('/auth/login')
        return
      }
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Učitavanje...</div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Greška pri učitavanju podataka</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin/config" className="text-gray-700 hover:text-gray-900">
                Konfiguracija
              </Link>
              <Link href="/admin/members" className="text-gray-700 hover:text-gray-900">
                Članovi
              </Link>
              <Link href="/" className="text-gray-700 hover:text-gray-900">
                Početna
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Statistika platforme</h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Ukupno članova" value={stats.stats.members.total} subtitle={`${stats.stats.members.active} aktivnih`} />
          <StatCard title="Ukupno proizvoda" value={stats.stats.products.total} subtitle={`${stats.stats.products.active} aktivnih`} />
          <StatCard title="Promovisan proizvoda" value={stats.stats.products.promoted} />
          <StatCard title="Ukupno tokena" value={stats.stats.tokens.total} subtitle={`${stats.stats.tokens.transactions} transakcija`} />
          <StatCard title="Kategorije" value={stats.stats.categories} />
          <StatCard title="Ocene" value={stats.stats.ratings} />
          <StatCard title="Pretplate" value={stats.stats.subscriptions} />
          <StatCard title="Poruke" value={stats.stats.messages} subtitle={`${stats.stats.conversations} konverzacija`} />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Products */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">Najnoviji proizvodi</h3>
            <div className="space-y-4">
              {stats.recentActivity.products.map((product: any) => (
                <div key={product.id} className="border-b pb-3">
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-600">
                    {product.seller.name} • {product.category.name} • {product.price} RSD
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(product.createdAt).toLocaleDateString('sr-RS')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Members */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">Novi članovi</h3>
            <div className="space-y-4">
              {stats.recentActivity.members.map((member: any) => (
                <div key={member.id} className="border-b pb-3">
                  <div className="font-medium">{member.name}</div>
                  <div className="text-sm text-gray-600">{member.email}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(member.createdAt).toLocaleDateString('sr-RS')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, subtitle }: { title: string; value: number; subtitle?: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-sm font-medium text-gray-600 mb-1">{title}</div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      {subtitle && <div className="text-sm text-gray-500 mt-1">{subtitle}</div>}
    </div>
  )
}

