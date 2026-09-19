'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import MessageBadge from './MessageBadge'

export default function Header() {
  const { data: session, status } = useSession()

  return (
    <header className="bg-gradient-to-r from-blue-50 to-blue-10 border-b border-blue-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.svg"
              alt="Berza Autića - Mali modeli, velika strast"
              width={150}
              height={50}
            />
          </Link>
          <nav className="flex items-center space-x-6">
            {status === 'loading' ? (
              // Skeleton loading state
              <div className="flex items-center space-x-4">
                <div className="h-6 w-24 bg-blue-200 rounded animate-pulse"></div>
                <div className="h-6 w-24 bg-blue-200 rounded animate-pulse"></div>
              </div>
            ) : session ? (
              <>
                <Link href="/seller/dashboard" className="text-blue-900 hover:text-blue-900 font-semibold transition-colors">
                  Moji proizvodi
                </Link>

                <Link href="/messages" className="text-blue-900 hover:text-blue-900 font-semibold transition-colors relative">
                  Poruke
                  <MessageBadge />
                </Link>
                
                {(session.user as any)?.role === 'admin' && (
                  <Link href="/admin/members" className="text-red-600 hover:text-red-900 font-semibold transition-colors">
                    Admin Panel
                  </Link>
                )}
                
                <Link href="/profile" className="text-blue-900 hover:text-blue-900 font-semibold transition-colors">
                  Profil
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-blue-900 hover:text-blue-900 font-semibold transition-colors">
                  Prijava
                </Link>
                <Link href="/auth/register" className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold shadow-md hover:shadow-lg transition-all">
                  Registracija
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
