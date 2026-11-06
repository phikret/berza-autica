import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email i lozinka su obavezni')
        }

        const member = await prisma.member.findUnique({
          where: { email: credentials.email },
        })

        if (!member) {
          throw new Error('Neispravni podaci za prijavu')
        }

        if (!member.isActive) {
          throw new Error('Nalog je deaktiviran')
        }

        if (!member.emailVerified) {
          throw new Error('Email adresa nije verificirana. Molimo provjerite vašu inbox.')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          member.password
        )

        if (!isPasswordValid) {
          throw new Error('Neispravni podaci za prijavu')
        }

        return {
          id: member.id,
          email: member.email,
          name: member.name,
          role: member.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        console.log('[JWT] Token kreiran sa:', { id: token.id, email: token.email, role: token.role })
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string
        (session.user as any).role = token.role as string
        console.log('[SESSION] Session callback:', { id: token.id, email: token.email, role: token.role })
      } else {
        console.log('[SESSION] Nema user objekta u sesiji!')
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Ako korisnik pokušava pristupiti zaštićenoj stranici tijekom logovanja,
      // pusti ga da ide tamo. Inače, pusti ga na /seller/products
      if (url.startsWith('/')) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/seller/products`
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}


