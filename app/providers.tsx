'use client'

import { SessionProvider } from 'next-auth/react'
import { ToasterProvider } from './components/ToasterProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToasterProvider />
      {children}
    </SessionProvider>
  )
}

