'use client'

import Image from 'next/image'

interface ProductCardProps {
  product: any
  promoted?: boolean
}

export default function ProductCard({ product, promoted = false }: ProductCardProps) {
  const handleSellerClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.location.href = `/seller/${product.seller.id}`
  }

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
        <div className="p-6 space-y-4 flex flex-col h-full">
          {/* Badge and Category */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-2">
              {promoted && (
                <div className="inline-flex items-center gap-2 w-fit">
                  <span className="text-yellow-500">⭐</span>
                  <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full">
                    Istaknuto
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Title */}
          <div>
            <h3 className="font-bold text-lg text-gray-900 leading-snug line-clamp-2">
              {product.name}
            </h3>
          </div>
          
          {/* Description */}
          <p className="text-sm text-gray-500 line-clamp-2">
            {product.description}
          </p>
          
          {/* Price */}
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Cena</p>
            <p className="text-2xl font-bold text-black">
              {product.price} RSD
            </p>
          </div>
          
          {/* Footer with Seller - pushed to bottom */}
          <div className="flex items-end justify-between pt-2 border-t border-gray-100 mt-auto">
            {/* Seller Info */}
            <div 
              className="flex items-center gap-2 hover:text-primary-600 cursor-pointer"
              onClick={handleSellerClick}
            >
              <span className="text-sm text-gray-700 font-medium">
                {product.seller.name}
              </span>
              <span 
                className="text-xs text-gray-500 hover:underline hover:text-primary-600"
                onClick={handleSellerClick}
              >
                Svi oglasi
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
