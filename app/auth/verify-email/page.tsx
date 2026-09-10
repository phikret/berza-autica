'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token')

      if (!token) {
        setError('Token nije pronađen')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`)
        const data = await response.json()

        if (response.ok && data.success) {
          setSuccess(true)
        } else {
          setError(data.error || 'Greška pri verifikaciji')
        }
      } catch (err) {
        setError('Došlo je do greške pri verifikaciji email-a')
        console.error('Verification error:', err)
      } finally {
        setLoading(false)
      }
    }

    verifyEmail()
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Verifikujem vašu email adresu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {success ? (
          <>
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <svg
                  className="h-12 w-12 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Email je verificiran!
            </h2>
            <p className="text-gray-600">
              Hvala što ste potvrdili vašu email adresu. Vaš nalog je sada aktivan i možete se prijaviti.
            </p>
            <div>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center w-full px-6 py-3 mt-6 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition"
              >
                Idite na login
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-center">
              <div className="rounded-full bg-red-100 p-3">
                <svg
                  className="h-12 w-12 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Greška pri verifikaciji
            </h2>
            <p className="text-gray-600">
              {error || 'Link za verifikaciju je nevalidan ili je istekao. Molimo registrujte se ponovo.'}
            </p>
            <div className="space-y-3">
              <Link
                href="/auth/register"
                className="block px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition"
              >
                Nazad na registraciju
              </Link>
              <Link
                href="/auth/resend-verification"
                className="block px-6 py-3 text-sm font-semibold text-blue-600 border border-blue-600 rounded-full hover:bg-blue-50 transition"
              >
                Ponovo pošalji email
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
