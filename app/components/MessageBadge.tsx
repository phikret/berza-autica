'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export default function MessageBadge() {
  const { data: session } = useSession()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!session?.user) return

    // Fetch unread messages on mount
    fetchUnreadCount()

    // Optionally poll for updates every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)

    return () => clearInterval(interval)
  }, [session?.user])

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/messages')
      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  if (!session?.user || unreadCount === 0) {
    return null
  }

  return (
    <span className="relative">
      <span className="absolute -top-2 -right-2 flex items-center justify-center bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full">
        {unreadCount > 9 ? '9+' : unreadCount}
      </span>
    </span>
  )
}
