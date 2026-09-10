'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ProductCardProps {
  product: any
  promoted?: boolean
  variant?: 'default' | 'seller' | 'list'
}

export default function ProductCard({ product, promoted = false, variant = 'default' }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const handleSellerClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.location.href = `/seller/${product.seller.id}`
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
            <div>
              <h3 className="font-bold text-base text-gray-900 line-clamp-1">
                {product.name}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                {product.description}
              </p>
            </div>
            
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
          <div className="relative h-64 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden group">
            
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />

          </div>
        )}
        
        {/* Content Section */}
        <div className="p-4 space-y-3">
            
          {/* Badge and Category */}
          <div className="flex items-start justify-between gap-3">
            {promoted && (
            <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full">
                    Istaknuto
            </span>)}
             <div>
                <h3 className="font-bold text-lg text-gray-900 leading-snug line-clamp-2">
                  {product.name}
                </h3>
             </div>
          </div>
                        {/* Title */}
             
          <div className="flex gap-4">

            <div id="left" className="flex-1">
                <div className="flex flex-col gap-2">
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
                      <span className="text-xl font-bold text-black">{product.price} RSD </span>
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
                    <span className="text-sm text-gray-700 font-medium">
                      {product.seller.name}
                    </span>
                    <span 
                      className="text-xs text-gray-500 hover:underline hover:text-primary-600"
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
