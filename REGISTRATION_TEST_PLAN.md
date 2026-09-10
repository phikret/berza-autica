# Registracija - Test Plan

## Test Scenario 1: Uspješna Registracija sa Email Verifikacijom

**Preduslov:**
- hCaptcha test ključevi su konfigurirani
- Resend API ključ je aktivan
- Aplikacija je pokrenuta: `npm run dev`

**Koraci:**

1. Idite na http://localhost:3000/auth/register
2. Popunite formu:
   - **Ime**: Test Korisnik
   - **Email**: testuser@example.com
   - **Lozinka**: TestPassword123
   - **Potvrdite lozinku**: TestPassword123
   - **Telefon**: +381611234567 (opciono)
3. Kliknite CAPTCHA checkbox (sa test ključevima, automatski će biti riješeno)
4. Kliknite "Registrujte se"

**Očekivani rezultat:**
- Forma se šalje
- Prikaže se zelena poruka: "Provjerite vašu email adresu za potvrdu registracije!"
- Forma se resetuje
- Email je stigao (provjerite inbox ili logs)

**Email sadrži:**
- Pozdrav sa imenom korisnika
- Link: `http://localhost:3000/auth/verify-email?token=XXXX`
- Informaciju da link važi 24 sata

---

## Test Scenario 2: Email Verifikacija

**Preduslov:**
- Test Scenario 1 je završen
- Email je primljen

**Koraci:**

1. Kopirajte verifikacijski link iz emaila
2. Zalijepite u pretraživač ili kliknite direktno
3. Trebao bi da vas prebaci na `/auth/email-verified?success=true`

**Očekivani rezultat:**
- Prikazana je zelena poruka "Email je verificiran!"
- Dugme "Idite na login" je vidljivo
- U bazi, `emailVerified` je postavljen na `true`

---

## Test Scenario 3: Login Provjera

**Preduslov:**
- Test Scenario 2 je završen (email je verificiran)

**Koraci:**

1. Kliknite "Idite na login"
2. Prijavite se sa:
   - **Email**: testuser@example.com
   - **Lozinka**: TestPassword123

**Očekivani rezultat:**
- Prijava je uspješna
- Prebacuje vas na dashboard ili home stranicu
- Vidljiv je login korisnik

---

## Test Scenario 4: Login Neće Raditi Bez Email Verifikacije

**Preduslov:**
- Trebate neverificiranog korisnika

**Koraci:**

1. Kreirajte novu registraciju sa drugim emailom
2. NE kliknite na verifikacijski link
3. Pokušajte da se prijavite sa tim kreditivalima

**Očekivani rezultat:**
- Prikaže se greška: "Email adresa nije verificirana. Molimo provjerite vašu inbox."
- Login nije dozvoljen

---

## Test Scenario 5: CAPTCHA Nije Riješena

**Koraci:**

1. Idite na `/auth/register`
2. Popunite sve polje OSIM CAPTCHA
3. Kliknite "Registrujte se"

**Očekivani rezultat:**
- Dugme je disabled
- Prikaže se poruka: "Molimo riješite CAPTCHA"

---

## Test Scenario 6: Greške pri Registraciji

### 6.1: Email je već registrovan

**Koraci:**
1. Pokušajte da registrujete sa istim emailom kao Test Scenario 1
2. Rješite CAPTCHA
3. Kliknite "Registrujte se"

**Očekivani rezultat:**
- Prikaže se greška: "Email adresa je već registrovana"

### 6.2: Lozinke se ne poklapaju

**Koraci:**
1. Popunite formu sa različitim lozinkama
2. Kliknite "Registrujte se"

**Očekivalni rezultat:**
- Prikaže se greška: "Lozinke se ne poklapaju"

### 6.3: Kratka lozinka

**Koraci:**
1. Unesite lozinku od 7 karaktera
2. Kliknite "Registrujte se"

**Očekivani rezultat:**
- Prikaže se greška: "Lozinka mora imati najmanje 8 karaktera"

### 6.4: Neispravna email adresa

**Koraci:**
1. Unesite email kao "invalid-email"
2. Kliknite "Registrujte se"

**Očekivani rezultat:**
- Prikaže se greška: "Neispravna email adresa"

---

## Test Scenario 7: Istekao Verifikacijski Token

**Preduslov:**
- Trebate pristupa bazi podataka
- Trebate znati kako direktno modifikovati `expiresAt` u `EmailVerification` tabeli

**Koraci:**

1. Kreirajte novu registraciju
2. U bazi, promijenite `expiresAt` u prošlost
3. Pokušajte da kliknete na verifikacijski link

**Očekivani rezultat:**
- Prebacuje vas na `/auth/email-verified?success=false`
- Prikaže se greška: "Nevalidan ili istekao token"
- Verifikacijski token je obrisan iz baze

---

## Test Scenario 8: CAPTCHA Greška

**Preduslov:**
- Trebate invalid CAPTCHA secret key

**Koraci:**

1. Promijenite `HCAPTCHA_SECRET_KEY` na netačnu vrijednost
2. Popunite formu i rješite CAPTCHA
3. Kliknite "Registrujte se"

**Očekivani rezultat:**
- Prikaže se greška: "CAPTCHA verifikacija neuspješna. Molimo pokušajte ponovo."
- Forma je resetovana

---

## Test Scenario 9: CAPTCHA Reset na Greške

**Koraci:**

1. Popunite formu
2. Rješite CAPTCHA
3. Namjerno kreirajte grešku (npr. email koji je već registrovan)
4. Kliknite "Registrujte se"

**Očekivani rezultat:**
- Prikaže se greška
- CAPTCHA je resetovana
- Trebate da je ponovo riješite za sljedeću registraciju

---

## Test Scenario 10: Email u Inbox vs Spam

**Koraci:**

1. Obavite Test Scenario 1
2. Provjerite inbox
3. Ako nije u inbox-u, provjerite spam folder

**Očekivani rezultat:**
- Email je primljen sa markerom "From: Berza Automotivna <noreply@berza-autica.rs>"

---

## Test Scenario 11: Multi-Account Registracija

**Koraci:**

1. Kreirajte 3 različita naloga sa različitim emailima
2. Verificirajte jedan od njih
3. Pokušajte da se prijavite sa sva tri

**Očekivani rezultat:**
- Samo verificirani nalog može da se prijavi
- Ostala dva daju grešku o email verifikaciji

---

## Test Scenario 12: Link Reusability

**Preduslov:**
- Trebate pristupa bazi

**Koraci:**

1. Obavite Test Scenario 1 i 2
2. Pokušajte da koristite isti verifikacijski link ponovo
3. Idite na URL: `http://localhost:3000/auth/verify-email?token=XXXX` (isti token)

**Očekivani rezultat:**
- Link ne radi drugi put
- Prikaže se greška: "Nevalidan ili istekao token"
- Token je već obrisan iz baze

---

## Zaključak

Ako su svi scenariji prošli uspješno, registracijski sistem sa CAPTCHA i email verifikacijom je ispravno implementiran.

### Checklist:
- [ ] Scenario 1 - Uspješna registracija
- [ ] Scenario 2 - Email verifikacija
- [ ] Scenario 3 - Login nakon verifikacije
- [ ] Scenario 4 - Login bez verifikacije
- [ ] Scenario 5 - CAPTCHA obaveza
- [ ] Scenario 6.1 - Email duplikat
- [ ] Scenario 6.2 - Lozinke se ne poklapaju
- [ ] Scenario 6.3 - Kratka lozinka
- [ ] Scenario 6.4 - Neispravna email
- [ ] Scenario 7 - Istekao token
- [ ] Scenario 8 - CAPTCHA greška
- [ ] Scenario 9 - CAPTCHA reset
- [ ] Scenario 10 - Email dostava
- [ ] Scenario 11 - Multi-account
- [ ] Scenario 12 - Link reusability
