import type { Metadata } from 'next'
import { PT_Sans } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const ptSans = PT_Sans({ 
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '700']
})

export const metadata: Metadata = {
  title: 'Berza Autića - Marketplace',
  description: 'Peer-to-peer marketplace platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sr">
      <body className={ptSans.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

