'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminConfig() {
  const router = useRouter()
  const [configs, setConfigs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    fetchConfigs()
  }, [])

  const fetchConfigs = async () => {
    try {
      const response = await fetch('/api/admin/config')
      if (response.status === 401) {
        router.push('/auth/login')
        return
      }
      const data = await response.json()
      setConfigs(data.configs)
    } catch (error) {
      console.error('Error fetching configs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (config: any) => {
    setEditingKey(config.key)
    setEditValue(config.value)
  }

  const handleSave = async (key: string) => {
    try {
      const config = configs.find(c => c.key === key)
      const response = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key,
          value: editValue,
          description: config?.description,
        }),
      })

      if (response.ok) {
        await fetchConfigs()
        setEditingKey(null)
      }
    } catch (error) {
      console.error('Error updating config:', error)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Učitavanje...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Konfiguracija platforme</h1>
            </div>
            <div className="flex items-center">
              <Link href="/admin/dashboard" className="text-gray-700 hover:text-gray-900">
                ← Nazad na Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-bold">Podešavanja sistema</h2>
          </div>
          <div className="divide-y">
            {configs.map((config) => (
              <div key={config.key} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{config.key}</div>
                    {config.description && (
                      <div className="text-sm text-gray-600 mt-1">{config.description}</div>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    {editingKey === config.key ? (
                      <>
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="border rounded px-3 py-1 w-32"
                        />
                        <button
                          onClick={() => handleSave(config.key)}
                          className="bg-primary-600 text-white px-4 py-1 rounded hover:bg-primary-700"
                        >
                          Sačuvaj
                        </button>
                        <button
                          onClick={() => setEditingKey(null)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Otkaži
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="font-mono text-lg">{config.value}</span>
                        <button
                          onClick={() => handleEdit(config)}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          Izmeni
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

