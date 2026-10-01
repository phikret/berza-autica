'use client'

import { Toaster } from 'sonner'

export function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      duration={4000}
      theme="light"
      style={{
        zIndex: 9999,
      }}
    />
  )
}
