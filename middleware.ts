import { withAuth } from 'next-auth/middleware'
import { NextRequest } from 'next/server'

export default withAuth(
  function middleware(request: NextRequest) {
    // Middleware je prošao auth proveru zahvaljujući withAuth
    return null
  },
  {
    callbacks: {
      authorized({ req, token }) {
        // Zaštitene rute
        const protectedPaths = ['/seller', '/admin', '/profile', '/messages', '/cart', '/wishlist']
        
        const isProtectedPath = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path))
        
        // Ako je protected path, proveri da li korisnik ima token
        if (isProtectedPath) {
          return !!token
        }
        
        // Ostale rute su javne
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    // Štiti sve rute osim auth i public resursa
    '/((?!auth|api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}
