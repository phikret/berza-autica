'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export default function WishlistBadge() {
  const { data: session } = useSession()
  const [wishlistCount, setWishlistCount] = useState(0)

  useEffect(() => {
    if (!session?.user) {
      setWishlistCount(0)
      return
    }

    // Fetch wishlist count on mount and when session changes
    fetchWishlistCount()

    // Listen for custom wishlist change events
    const handleWishlistChange = () => {
      fetchWishlistCount()
    }
    window.addEventListener('wishlistChanged', handleWishlistChange)

    return () => {
      window.removeEventListener('wishlistChanged', handleWishlistChange)
    }
  }, [session])

  const fetchWishlistCount = async () => {
    try {
      const response = await fetch('/api/wishlist')
      if (response.ok) {
        const data = await response.json()
        setWishlistCount(data.items?.length || 0)
      }
    } catch (error) {
      console.error('Error fetching wishlist count:', error)
    }
  }

  if (!session?.user || wishlistCount === 0) {
    return null
  }

  return (
    <span className="relative inline-block">
      <svg
        className="w-5 h-5 text-blue-900"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
      </svg>
      {/* Red checkmark badge */}
      <span className="absolute -top-1 -right-1 flex items-center justify-center bg-red-600 text-white rounded-full w-4 h-4">
        <svg
          className="w-2.5 h-2.5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    </span>
  )
}
