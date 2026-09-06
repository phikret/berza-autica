interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.warn('RESEND_API_KEY is not configured. Email will not be sent.')
    return null
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'noreply@berza-autica.com',
        to,
        subject,
        html,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Error sending email:', error)
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to send email:', error)
    return null
  }
}

export function createNewMessageEmailTemplate(
  recipientName: string,
  senderName: string,
  senderEmail: string,
  message: string,
  conversationUrl: string
) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            background-color: #007bff;
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
            text-align: center;
          }
          .content {
            background-color: white;
            padding: 20px;
            border: 1px solid #e0e0e0;
          }
          .message-box {
            background-color: #f5f5f5;
            padding: 15px;
            border-left: 4px solid #007bff;
            margin: 15px 0;
            border-radius: 4px;
          }
          .button {
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 20px;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 12px;
            background-color: #f9f9f9;
            border-radius: 0 0 8px 8px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Nova poruka na Berza Autica</h2>
          </div>
          <div class="content">
            <p>Zdravo ${recipientName},</p>
            <p><strong>${senderName}</strong> (${senderEmail}) vam je poslao novu poruku:</p>
            <div class="message-box">
              <p>${message}</p>
            </div>
            <p>Kliknite na dugme ispod da odgovorite na poruku:</p>
            <a href="${conversationUrl}" class="button">Odgovori na poruku</a>
          </div>
          <div class="footer">
            <p>© 2024 Berza Autica. Sve prava zadržana.</p>
            <p>Ako ne želite da dobijate emaile, možete promeniti postavke u vašem profilu.</p>
          </div>
        </div>
      </body>
    </html>
  `
}
