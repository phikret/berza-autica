import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`

  console.log('\n' + '='.repeat(80))
  console.log('📧 SENDING VERIFICATION EMAIL')
  console.log('='.repeat(80))
  console.log(`To: ${email}`)
  console.log(`Name: ${name}`)
  console.log(`Token: ${token}`)
  console.log(`Resend API Key exists: ${!!process.env.RESEND_API_KEY}`)
  console.log(`Resend API Key preview: ${process.env.RESEND_API_KEY?.slice(0, 10)}...`)
  console.log(`App URL: ${process.env.NEXT_PUBLIC_APP_URL}`)
  console.log(`Verification URL: ${verificationUrl}`)

  // DEV MODE - Ako nema Resend API key-a, prikaži token u konzoli
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.includes('your_')) {
    console.log('⚠️  DEV MODE - Resend API key not configured')
    console.log('🔗 Verification Link:')
    console.log(`${verificationUrl}`)
    console.log('='.repeat(80) + '\n')
    
    return { success: true }
  }

  try {
    console.log('📤 Attempting to send email via Resend...')
    
    // Za development, koristi Resend test domain (onboarding@resend.dev)
    // Za production, trebas da verificiras tvoj domain
    const senderEmail = 'onboarding@resend.dev' // TEST EMAIL
    
    console.log(`📬 Sender: ${senderEmail}`)
    
    const response = await resend.emails.send({
      from: senderEmail,
      to: email,
      subject: 'Potvrdi svoju email adresu - Berza Autica',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Dobrodošli na Berzu Autica!</h2>
          <p>Pozdrav ${name},</p>
          <p>Hvala što ste se registrovali na našoj platformi. Molimo vas da potvrdite vašu email adresu klikom na dugme ispod:</p>
          
          <div style="margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Potvrdi email adresu
            </a>
          </div>

          <p>Ili kopiraj ovaj link u pretraživač:</p>
          <p style="word-break: break-all; color: #666;">
            <a href="${verificationUrl}" style="color: #1e40af;">${verificationUrl}</a>
          </p>

          <p>Ovaj link će biti validan 24 sata.</p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #666; font-size: 12px;">
            Ako niste registrovali ovaj nalog, molimo vas da ignorišete ovu poruku.<br>
            Berza Autica | Sve za vašu autu
          </p>
        </div>
      `,
    })

    console.log('✅ Email sent successfully!')
    console.log('📨 Response ID:', response.id)
    console.log('='.repeat(80) + '\n')

    return { success: true }
  } catch (error) {
    console.error('❌ ERROR sending verification email:', error)
    console.log('Full error details:')
    console.log(JSON.stringify(error, null, 2))
    console.log('='.repeat(80) + '\n')
    throw error
  }
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`

  try {
    const senderEmail = 'onboarding@resend.dev' // TEST EMAIL
    
    await resend.emails.send({
      from: senderEmail,
      to: email,
      subject: 'Resetuj svoju lozinku - Berza Autica',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Resetovanje lozinke</h2>
          <p>Pozdrav ${name},</p>
          <p>Tražili ste da resetujete vašu lozinku. Klikom na dugme ispod možete da postavite novu lozinku:</p>
          
          <div style="margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Resetuj lozinku
            </a>
          </div>

          <p>Ili kopiraj ovaj link u pretraživač:</p>
          <p style="word-break: break-all; color: #666;">
            <a href="${resetUrl}" style="color: #1e40af;">${resetUrl}</a>
          </p>

          <p>Ovaj link će biti validan 1 sat.</p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #666; font-size: 12px;">
            Ako niste tražili resetovanje lozinke, molimo vas da ignorišete ovu poruku.<br>
            Berza Autica | Sve za vašu autu
          </p>
        </div>
      `,
    })

    return { success: true }
  } catch (error) {
    console.error('Error sending password reset email:', error)
    throw error
  }
}
