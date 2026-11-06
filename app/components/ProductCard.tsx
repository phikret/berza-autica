'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

interface ProductCardProps {
  product: any
  promoted?: boolean
  variant?: 'default' | 'seller' | 'list'
  isInWishlist?: boolean
  onWishlistChange?: (isInWishlist: boolean) => void
}

export default function ProductCard({ product, promoted = false, variant = 'default', isInWishlist = false, onWishlistChange }: ProductCardProps) {
  const { data: session } = useSession()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [inWishlist, setInWishlist] = useState(isInWishlist)
  const [isLoading, setIsLoading] = useState(false)

  // Sync inWishlist state with prop changes
  useEffect(() => {
    setInWishlist(isInWishlist)
  }, [isInWishlist])

  const handleSellerClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.location.href = `/seller/${product.seller.id}`
  }

  const handleViewWishlist = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.location.href = '/wishlist'
  }

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!session?.user) {
      console.log('No session, redirecting to login')
      window.location.href = '/auth/login'
      return
    }

    setIsLoading(true)
    try {
      if (inWishlist) {
        const response = await fetch(`/api/wishlist/${product.id}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          setInWishlist(false)
          onWishlistChange?.(false)
          toast.success('Proizvod je uklonjen iz liste želja')
          // Dispatch custom event to update badge
          window.dispatchEvent(new Event('wishlistChanged'))
        } else {
          const error = await response.json()
          console.error('Error removing from wishlist:', error)
          toast.error('Greška pri brisanju iz liste želja: ' + error.error)
        }
      } else {
        console.log('Adding to wishlist, product ID:', product.id, 'User:', session.user)
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId: product.id }),
        })
        
        const responseData = await response.json()
        console.log('Response status:', response.status, 'Data:', responseData)
        
        if (response.ok) {
          setInWishlist(true)
          onWishlistChange?.(true)
          toast.success('Proizvod je dodan u listu želja!')
          // Dispatch custom event to update badge
          window.dispatchEvent(new Event('wishlistChanged'))
        } else {
          console.error('Error adding to wishlist:', responseData)
          toast.error(`Greška: ${responseData.error}`)
        }
      }
    } catch (error) {
      console.error('Error updating wishlist:', error)
      toast.error('Greška pri ažuriranju liste želja: ' + String(error))
    } finally {
      setIsLoading(false)
    }
  }

  const images = product.images || []

  // List variant - horizontal layout
  if (variant === 'list') {
    return (
      <div
        onClick={() => window.location.href = `/products/${product.slug}`}
        className="cursor-pointer"
      >
        <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 p-4 flex gap-4 items-start">
          {/* Thumbnail */}
          {product.images && product.images[0] && (
            <div className="relative h-32 w-32 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden rounded-lg flex-shrink-0">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover object-center"
              />
            </div>
          )}
          
          {/* Content */}
          <div className="flex-1 flex flex-col justify-between py-2">
            {/* Title and Description */}
              <h3 className="font-bold text-base text-gray-900 line-clamp-1">
                {product.name}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                {product.description}
              </p>
            
            {/* Price and Seller */}
            <div className="flex items-center justify-between mt-3">
              <div>
                <p className="text-lg font-bold text-black">
                  {product.price} RSD
                </p>
              </div>
              <p className="text-xs text-gray-500">{product.seller.name}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Featured variant - large showcase card
  if (promoted) {
    return (
      <div
        onClick={() => window.location.href = `/products/${product.slug}`}
        className="cursor-pointer"
      >
        <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
          {/* Image Section with Istaknuto Badge */}
          {product.images && product.images[0] && (
            <div className="relative h-62 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden group">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Istaknuto Badge - Top Right */}
              <div className="absolute top-4 right-4">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-4 py-2 rounded-full font-bold text-sm shadow-lg hover:shadow-xl transition-all">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>

              {/* Dot indicators - Bottom */}
              <div className="absolute bottom-4 right-0 transform -translate-x-5 flex gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full opacity-50"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full opacity-50"></div>
              </div>
            </div>
          )}
          
          {/* Content Section */}
          <div className="p-5 pt-4 space-y-1">
            
            {/* Scale and Category */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg">
                <span className="text-sm font-semibold text-gray-700">{product.scale}</span>
              </div>
              <span className="text-sm text-gray-500">|</span>
              <span className="text-sm text-gray-600">{typeof product.category === 'string' ? product.category : product.category?.name || 'Kategorija'}</span>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h2>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-base leading-relaxed">
              {product.description}
            </p>

            {/* Price Section */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">CENA</p>
                <p className="text-xl font-bold text-gray-900">
                  {product.price} RSD
                </p>
              </div>
            </div>

            {/* Seller and Time Info */}
            <div className="flex items-center gap-6 pt-2">
              <div 
                className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={handleSellerClick}
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                <span className="text-sm font-semibold text-gray-900">{product.seller.name}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect x="3" y="3" width="4" height="4" />
                  <rect x="10" y="3" width="4" height="4" />
                  <rect x="17" y="3" width="4" height="4" />
                  <rect x="3" y="10" width="4" height="4" />
                  <rect x="10" y="10" width="4" height="4" />
                  <rect x="17" y="10" width="4" height="4" />
                  <rect x="3" y="17" width="4" height="4" />
                  <rect x="10" y="17" width="4" height="4" />
                  <rect x="17" y="17" width="4" height="4" />
                </svg>
                <span className="text-sm">Svi oglasi</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default and seller variants - card layout. When in seller page, do not show 'Show all'
  return (
    <div
      onClick={() => window.location.href = `/products/${product.slug}`}
      className="cursor-pointer"
    >
      <div className={`bg-white rounded-xl overflow-hidden shadow hover:shadow-xl transition-all duration-300 ${promoted ? 'ring-2 ring-yellow-400' : ''}`}>
        {/* Image Section - Full width */}
        {product.images && product.images[0] && (
          <div className="relative h-25 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden group">
            
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Contact Seller Button Overlay - Only show when in wishlist */}
            {inWishlist && (
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                  onClick={handleViewWishlist}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all"
                >
                  Prikazi listu
                </button>
              </div>
            )}
            
            {/* Wishlist Button */}
            <button
              onClick={handleWishlistClick}
              disabled={isLoading}
              className={`absolute top-2 right-2 p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-200 ${
                inWishlist ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              } disabled:opacity-50`}
              title={inWishlist ? 'Ukloni iz liste želja' : 'Dodaj u listu želja'}
            >
              {inWishlist ? (
                // Same icon as header badge - list with red checkmark
                <span className="relative inline-block">
                  <svg
                    className="w-6 h-6 text-blue-900"
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
              ) : (
                // Outline list icon when not in wishlist
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              )}
            </button>
          </div>
        )}
        
        {/* Content Section */}
        <div className="p-4 space-y-3">
            
          {/* Badge and Category */}
          <div className="flex items-start gap-3 mb-3">
           
             <div>
                <h3 className="font-bold text-base text-gray-900 leading-snug line-clamp-2 truncate">
                  {product.scale} {product.name}
                </h3>
             </div>
          </div>
                        {/* Title */}
             
          <div className="flex gap-4">

            <div id="left" className="flex-1">
                <div className="flex flex-col gap-2 mb-0">
                  <div className="inline-flex items-center gap-2 w-fit">
                    {/* Description */}
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {product.description}
                    </p>
                  </div>
                </div>
            </div>            
            <div id="right" className="flex-shrink-0">
              {/* Footer with Price and Seller */}
              <div className="flex flex-col items-end justify-between pt-2">
                <div className="flex flex-col gap-2">
                  <p className="text-m text-gray-400  tracking-wide font-medium">Cena &nbsp; 
                      <span className="text-sm font-bold text-black">{product.price} RSD </span>
                  </p>
                </div>
             </div>
           
              </div>
              
          </div>
          {/* Seller Info */}
                {variant !== 'seller' && (
                  <div 
                    className="flex items-center gap-2 hover:text-primary-600 cursor-pointer justify-end"
                    onClick={handleSellerClick}
                  >
                    <span className="text-xs text-gray-700 font-medium">
                      {product.seller.name}
                    </span>
                    <span 
                      className="text-xs text-blue-900 hover:underline hover:text-blue-700 font-semibold"
                    >
                      Svi oglasi
                    </span>
                  </div>
                )}
        </div>    
      </div>
    </div>
  )
}
