'use client'

import { useState } from 'react'
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

  const handleSellerClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.location.href = `/seller/${product.seller.id}`
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
            
            {/* Wishlist Button */}
            <button
              onClick={handleWishlistClick}
              disabled={isLoading}
              className={`absolute top-2 right-2 p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-200 ${
                inWishlist ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              } disabled:opacity-50`}
              title={inWishlist ? 'Ukloni iz liste želja' : 'Dodaj u listu želja'}
            >
              <svg
                className={`w-6 h-6 ${inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                viewBox="0 0 24 24"
                fill={inWishlist ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Content Section */}
        <div className="p-4 space-y-3">
            
          {/* Badge and Category */}
           {promoted && (
            <div className="inline-block bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full">
                    Istaknuto
            </div>)}
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
                  {promoted && (
                    <div className="inline-flex items-center gap-2 w-fit">
                      {/* Description */}
                    <p className="text-sm text-gray-500 line-clamp-2">
                    {product.description}
                  </p>
                </div>
                )}
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
