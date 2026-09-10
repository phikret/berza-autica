# Brz Start - Registracija sa CAPTCHA i Email Verifikacijom

## 1️⃣ Setup (5 minuta)

### Korak 1: hCaptcha Ključevi
```env
# .env file
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=10000000-ffff-ffff-ffff-000000000001
HCAPTCHA_SECRET_KEY=0x0000000000000000000000000000000000000000
```
*(Za development, koristite test ključeve iznad)*

### Korak 2: Resend API
```env
# .env file
RESEND_API_KEY=re_your_api_key_here
```
Dobijte sa https://resend.com - besplatno za testiranje

### Korak 3: App URL
```env
# .env file
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Korak 4: Instalirajte pakete
```bash
npm install
npx prisma generate
```

## 2️⃣ Pokrenite (2 minuta)

```bash
npm run dev
```

Aplikacija je dostupna na http://localhost:3000

## 3️⃣ Testirajte (5 minuta)

### Registracija
1. Idite na http://localhost:3000/auth/register
2. Popunite formu:
   - Ime: Nikola Teste
   - Email: nikola@test.com
   - Lozinka: TestPassword123
   - Telefon: +381611234567
3. Kliknite CAPTCHA checkbox
4. Kliknite "Registrujte se"
5. Trebali bi da vidite zelenu poruku "Email je verificiran..."

### Email Verifikacija
1. Provjerite terminal - trebat će da vidite log sa verification linkom
2. *Ili* - Ako imate Resend, email će biti poslán

### Login
1. Idite na http://localhost:3000/auth/login
2. Unesite:
   - Email: nikola@test.com
   - Lozinka: TestPassword123
3. Trebalo bi da vas prebaci na dashboard

## 🛠️ Za Production

### 1. Pravi hCaptcha ključevi
Idite na https://hcaptcha.com i kreirajte konto

### 2. Pravi Resend API
Idite na https://resend.com, kreirajte API ključ

### 3. Postavite .env
```env
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=your_real_site_key
HCAPTCHA_SECRET_KEY=your_real_secret_key
RESEND_API_KEY=your_real_resend_key
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 4. Build
```bash
npm run build
npm start
```

## 📋 Što Se Dešava

```
Korisnik popuni formu
        ↓
Klikne na CAPTCHA checkbox
        ↓
Klikne "Registrujte se"
        ↓
Server validira sve
Server pošalje email sa linkom
        ↓
Korisnik vidi "Provjerite email"
        ↓
Korisnik klikne na link iz emaila
        ↓
Email je verificiran
        ↓
Korisnik se može prijaviti
```

## 🔑 Test Kredencijali

Ako koristite test hCaptcha ključeve:
- Svi CAPTCHA su automatski riješeni
- Trebate Resend API da pošaljete email
- *Ili* - Čitajte tokene iz baze direktno

## ❓ Često Pitana

### "Email nije stigao"
1. Provjerite spam folder
2. Provjerite Resend dashboard za errors
3. Provjerite da je RESEND_API_KEY postavljen

### "CAPTCHA nije riješen"
1. Provjerite NEXT_PUBLIC_HCAPTCHA_SITE_KEY
2. Hcaptcha skript se učitava iz https://js.hcaptcha.com
3. Internet veza mora biti aktivna

### "Korisnik ne može da se prijavi"
1. Email mora biti verificiran
2. Korisnik će dobiti grešku "Email nije verificiran"
3. Nudi se opcija da resend email

### "Database greške"
1. Provjerite DATABASE_URL
2. Pokrenite `npx prisma db push`
3. Ili `npx prisma migrate dev`

## 📚 Detaljnija Dokumentacija

- **Setup detalji**: `REGISTRATION_SETUP.md`
- **Test planovi**: `REGISTRATION_TEST_PLAN.md`
- **Kompletan summary**: `IMPLEMENTATION_SUMMARY.md`

## 🎯 Ključne Datoteke

Frontend:
- `app/auth/register/page.tsx` - Registracijska forma
- `app/auth/login/page.tsx` - Login sa resend opcijom

Backend:
- `app/api/auth/register/route.ts` - Registracija
- `app/api/auth/verify-email/route.ts` - Verifikacija
- `app/api/auth/resend-verification/route.ts` - Resend

Utilities:
- `lib/email.ts` - Email slanja
- `lib/captcha.ts` - CAPTCHA validacija
- `lib/tokens.ts` - Token management

## ✅ Готов za korišćenje!

Sve je postavljeno i testirano. Počnite sa Development test-om pa onda pređite na Production kada ste sigurni.
