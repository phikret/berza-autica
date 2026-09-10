# Registracija sa CAPTCHA i Email Verifikacijom

## Pregled

Proces registracije je ažuriran sa sljedećim sigurnosnim mjerama:

1. **hCaptcha Zaštita** - Sprječava automatizovanu registraciju
2. **Email Verifikacija** - Korisnik mora da potvrdi email prije nego što se može prijaviti
3. **Token-based Verification** - Sigurni tokeni sa vremenskim ograničenjem (24 sata)

## Konfiguracija

### 1. hCaptcha Setup

Trebate da kreirate konto na [hCaptcha.com](https://www.hcaptcha.com) i dobijete:

- `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` - Javni ključ (može biti u .env)
- `HCAPTCHA_SECRET_KEY` - Tajni ključ (mora biti u .env, nikad u javnom kodu)

**Za testiranje**: Koristite test ključeve:
```env
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=10000000-ffff-ffff-ffff-000000000001
HCAPTCHA_SECRET_KEY=0x0000000000000000000000000000000000000000
```

### 2. Email Setup (Resend)

Trebate Resend API ključ:

```env
RESEND_API_KEY=re_your_api_key_here
```

Pridobijte ga na [resend.com](https://resend.com)

### 3. Aplikacijski URL

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Za development
NEXT_PUBLIC_APP_URL=https://yourdomain.com # Za production
```

## Tok Registracije

### 1. Korisnik popunjava formu
- Ime i prezime
- Email adresa
- Lozinka (min 8 karaktera)
- Telefon (opciono)
- **Rješava hCaptcha**

### 2. Sistem validira:
- Svi obavezni polja su popunjena
- Lozinke se poklapaju
- hCaptcha je uspješna
- Email nije već registrovan

### 3. Registracija se kreira sa `emailVerified = false`

Korisnik dobija email sa linkom za verifikaciju:
```
https://yourdomain.com/auth/verify-email?token=VERIFICATION_TOKEN
```

Token je validan 24 sata.

### 4. Korisnik klika na link

Sistem:
- Validira token
- Provjerava vremenske isteke
- Postavi `emailVerified = true`
- Obriše verifikacijski token
- Preusmjerava na stranicu za potvrdu

### 5. Korisnik se može prijaviti

Sada može da se prijavi sa email i lozinkom.

## Baza Podataka

Nove tabele/polja:

### Member (ažurirano)
```prisma
member {
  ...existing fields...
  emailVerified Boolean @default(false)  // Novo polje
  emailVerifications EmailVerification[] // Nova relacija
}
```

### EmailVerification (novo)
```prisma
model EmailVerification {
  id        String   @id @default(cuid())
  memberId  String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  member    Member   @relation(fields: [memberId], references: [id], onDelete: Cascade)
}
```

## API Endpointi

### POST /api/auth/register

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe",
  "phone": "+381611234567",
  "captchaToken": "hcaptcha_token_from_frontend"
}
```

**Response (201):**
```json
{
  "success": true,
  "memberId": "user_id",
  "message": "Nalog je kreiran. Molimo provjerite vašu email adresu za potvrdu."
}
```

**Greške (400):**
- "CAPTCHA verifikacija neuspješna"
- "Email adresa je već registrovana"
- "Neispravna email adresa"
- "Lozinka mora imati najmanje 8 karaktera"

### GET /api/auth/verify-email?token=TOKEN

Automatski pozvan iz email linka.

**Response (302 redirect):**
- `/auth/email-verified?success=true` - Uspješna verifikacija
- `/auth/email-verified?success=false` - Greška (istekao token, itd.)

## Login Validacija

Login endpointi sad provjeravaju:
1. Email/lozinka su ispravni
2. Nalog je aktivan (`isActive = true`)
3. **Email je verificiran** (`emailVerified = true`) - NOVO

Ako email nije verificiran, korisnik dobija grešku:
```
"Email adresa nije verificirana. Molimo provjerite vašu inbox."
```

## Fajlovi koji su Ažurirani

### Frontend
- `app/auth/register/page.tsx` - Registracijska forma sa hCaptcha
- `app/auth/email-verified/page.tsx` - Stranica za potvrdu verifikacije

### Backend
- `app/api/auth/register/route.ts` - Registracijski endpoint
- `app/api/auth/verify-email/route.ts` - Email verifikacijski endpoint
- `lib/auth.ts` - NextAuth konfiguracija sa emailVerified proverom
- `lib/email.ts` - Email slanja sa Resend
- `lib/captcha.ts` - hCaptcha verifikacija
- `lib/tokens.ts` - Token generiranje i upravljanje

### Baza
- `prisma/schema.prisma` - Ažurirana sa EmailVerification modelom

## Testiranje

### 1. Lokalno testiranje
```bash
npm run dev
```

Idite na: http://localhost:3000/auth/register

### 2. Test hCaptcha sa test ključevima
Ako koristite test ključeve, svi CAPTCHA će biti preskočeni.

### 3. Slanje emaila
Za local development, trebate aktivni Resend API ključ ili mock email service.

## Troubleshooting

### "CAPTCHA je obavezna"
- hCaptcha script nije učitan
- Proverite NEXT_PUBLIC_HCAPTCHA_SITE_KEY

### "Email nije verificiran" pri loginu
- Korisnik nije prošao kroz email verifikaciju
- Provjerite inbox i spam folder

### Email nije stigao
- Proverite RESEND_API_KEY
- Provjerite spam folder
- Provjerite logs za greške

## Security Notes

- Svi CAPTCHA tokeni se validiraju na serveru
- Verifikacijski tokeni su random hex stringovi (32 bajta)
- Tokeni se briše nakon verifikacije
- Tokeni imaju vremensko ograničenje (24 sata)
- Email adrese se ne mogu registrirati dva puta

## Budućna Poboljšanja

1. Resend email verifikacije (ako nije primljena u 5 minuta)
2. Social login (Google, GitHub)
3. Two-factor authentication
4. Rate limiting na registracijski endpoint
