export async function verifyCaptcha(token: string): Promise<boolean> {
  try {
    const response = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        response: token,
        secret: process.env.HCAPTCHA_SECRET_KEY || '',
      }).toString(),
    })

    const data = await response.json()
    return data.success === true
  } catch (error) {
    console.error('Error verifying captcha:', error)
    return false
  }
}
