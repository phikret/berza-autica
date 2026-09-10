import crypto from 'crypto'

export function generateEmailVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function getTokenExpiry(hours: number = 24): Date {
  const now = new Date()
  return new Date(now.getTime() + hours * 60 * 60 * 1000)
}
