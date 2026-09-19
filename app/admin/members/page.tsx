'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminMembers() {
  const router = useRouter()
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showTokenModal, setShowTokenModal] = useState(false)
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [tokenAmount, setTokenAmount] = useState('')
  const [tokenReason, setTokenReason] = useState('')
  const [tokenLoading, setTokenLoading] = useState(false)

  useEffect(() => {
    fetchMembers()
  }, [page])

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/admin/members?page=${page}&limit=20`)
      if (response.status === 401) {
        router.push('/auth/login')
        return
      }
      const data = await response.json()
      setMembers(data.members)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleMemberStatus = async (memberId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${memberId}/deactivate`, {
        method: currentStatus ? 'POST' : 'PUT',
      })

      if (response.ok) {
        await fetchMembers()
      } else {
        const data = await response.json()
        alert(data.error || 'Greška pri promeni statusa')
      }
    } catch (error) {
      console.error('Error updating member:', error)
      alert('Greška pri promeni statusa')
    }
  }

  const openTokenModal = (memberId: string) => {
    setSelectedMemberId(memberId)
    setTokenAmount('')
    setTokenReason('')
    setShowTokenModal(true)
  }

  const handleAddTokens = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMemberId || !tokenAmount || !tokenReason) {
      alert('Popunite sva polja')
      return
    }

    setTokenLoading(true)
    try {
      const response = await fetch('/api/admin/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedMemberId,
          amount: parseInt(tokenAmount),
          reason: tokenReason,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert(data.message)
        setShowTokenModal(false)
        await fetchMembers()
      } else {
        alert(data.error || 'Greška pri dodavanju tokena')
      }
    } catch (error) {
      console.error('Error adding tokens:', error)
      alert('Greška pri dodavanju tokena')
    } finally {
      setTokenLoading(false)
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
              <h1 className="text-2xl font-bold text-gray-900">Upravljanje članovima</h1>
            </div>
            <div className="flex items-center">
              <Link href="/admin/dashboard" className="text-gray-700 hover:text-gray-900">
                ← Nazad na Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ime</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balans</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proizvodi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ocene</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Akcije</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{member.name}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(member.createdAt).toLocaleDateString('sr-RS')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {member.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {member.balance} tokena
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {member._count.products}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {member._count.ratingsReceived}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {member.isActive ? 'Aktivan' : 'Neaktivan'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => openTokenModal(member.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Dodaj tokene
                    </button>
                    <button
                      onClick={() => toggleMemberStatus(member.id, member.isActive)}
                      className={`${
                        member.isActive
                          ? 'text-red-600 hover:text-red-900'
                          : 'text-green-600 hover:text-green-900'
                      }`}
                    >
                      {member.isActive ? 'Deaktiviraj' : 'Aktiviraj'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Prethodna
            </button>
            <span className="px-4 py-2">
              Strana {page} od {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Sledeća
            </button>
          </div>
        )}
      </div>

      {/* Token Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Dodaj tokene korisniku</h2>
            <form onSubmit={handleAddTokens}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Iznos (broj tokena)
                </label>
                <input
                  type="number"
                  value={tokenAmount}
                  onChange={(e) => setTokenAmount(e.target.value)}
                  placeholder="npr. 100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Razlog
                </label>
                <input
                  type="text"
                  value={tokenReason}
                  onChange={(e) => setTokenReason(e.target.value)}
                  placeholder="npr. Nadoknada za grešku"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowTokenModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Odustani
                </button>
                <button
                  type="submit"
                  disabled={tokenLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {tokenLoading ? 'Učitavanje...' : 'Dodaj'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

