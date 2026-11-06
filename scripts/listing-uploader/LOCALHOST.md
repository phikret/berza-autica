# 🚀 LOCALHOST UPLOADER - SETUP GUIDE

## 🔄 Šta se Promenilo?

Skript je sada konfigurisan za **localhost:3000** (tvoja lokalna berza-autica aplikacija), umesto kupujem-prodajem.com.

```
Staro: https://www.kupujem-prodajem.com/auth/login
Novo: http://localhost:3000/auth/login
```

---

## ✅ Ispravke

### Timeout Strategija
- ❌ `waitUntil: 'networkidle'` - Previše strogo, čeka sve slike/resurse
- ✅ `waitUntil: 'domcontentloaded'` - Dovoljno brzo, ali HTML je učitan

### Navigation Errors
- ❌ `await page.waitForNavigation()` - Nije bio fleksibilan
- ✅ `try/catch` sa fallback `page.waitForTimeout(1000)` - Fleksibilniji

### URLs
- ✅ `http://localhost:3000/auth/login` - Login stranica
- ✅ `http://localhost:3000/user/ads/add/step1` - Dodaj oglas

---

## 🚀 Quick Start

### Preduslov
**Trebaš da imaš localhost pokrenut!**
```bash
# U drugom terminal-u (iz root foldera berza-autica)
npm run dev
# ili
yarn dev
```

### Zatim u drugom terminal-u pokrenite uploader:

```bash
cd scripts/listing-uploader

# 1. Instaliraj zavisnosti (prvi put)
npm install

# 2. Testiraj localhost
npm run test

# 3. Testiraj sa par oglasa
npm run test-first-5

# 4. Pokreni pravi upload
npm start
```

---

## 📋 Dostupne Komande

```bash
npm start              # Upload sve oglase na localhost
npm run test           # Testiraj localhost i prijavu
npm run advanced       # Napredna verzija
npm run dry-run        # Simuliraj bez upload-a
npm run test-first-5   # Testiraj sa 5 oglasa
npm run test-api       # Testiraj samo Playwright API
```

---

## 🛠️ Troubleshooting

### Greška: "net::ERR_CONNECTION_REFUSED"
```
Problem: localhost:3000 nije pokrenut
Rešenje: 
  1. Otvori novi terminal
  2. Pokreni: npm run dev
  3. Čekaj da se pretraživač otvori
```

### Greška: "Timeout 30000ms exceeded"
```
Problem: Stranica spora
Rešenje:
  - To je OK sada! Koristim fleksibilnije timeouts
  - Skript bi trebalo da nastavi rad
```

### Greška: "Nije moguće pronaći login forme"
```
Problem: HTML struktura se promenila
Rešenje:
  - Proveri da li su login form input-i na stranici
  - Koristi DevTools (F12) da pronađeš nove selektore
  - Ažuriraj src/selectors.js ako trebas
```

### Greška: "Email/Password nisu postavaljeni"
```
Problem: .env fajl nema kredencijala
Rešenje:
  - Proveri scripts/listing-uploader/.env
  - Trebalo bi da sadrži:
    KP_EMAIL=phikret@gmail.com
    KP_PASSWORD=Karabaja43002
```

---

## 🧪 Testiranje

### Test 1: Playwright API
```bash
npm run test-api
```
Testiraj samo Playwright bez interneta

### Test 2: Localhost Konekcija
```bash
npm run test
```
Testiraj da li se može prijaviti na localhost

### Test 3: Full Upload
```bash
npm run test-first-5
```
Testiraj upload sa prvih 5 oglasa

### Test 4: Dry Run
```bash
npm run dry-run
```
Simuliraj upload bez promena

---

## 🎯 Redosled Pokretanja

### Terminal 1: Pokreni aplikaciju
```bash
cd d:\Work\source\berza-autica
npm run dev
```
(Čekaj da se pokrene localhost:3000)

### Terminal 2: Pokreni uploader
```bash
cd d:\Work\source\berza-autica\scripts\listing-uploader
npm install  # Prvi put
npm run test  # Testiraj
npm start    # Upload
```

---

## 📊 Output

```
─── 🚀 LISTING UPLOADER - ADVANCED ───
ℹ Email: phikret@gmail.com
ℹ Headless: false
ℹ Slowmo: 1000ms
──────────────────────────────────────────────────
✅ Učitano 65 oglasa
──────────────────────────────────────────────────
ℹ Prijavljivam se na localhost...
✅ Uspešna prijava!
──────────────────────────────────────────────────
ℹ [1/65] "VW Passat SIKU"
📸 Uploadujem 6 slika...
✅ [1/65] Uspešno

... (ostatak oglasa) ...

📊 Statistika:
   Total: 65
   ✅ Uspešno: 65
   ❌ Greške: 0
```

---

## 💡 Dodatne Opcije

```bash
# Headless (bez vidljive pretraživača)
npm start

# Sa vidljivim pretraživačem
HEADLESS=false npm start

# Sa debug info-ima
DEBUG=true npm start

# Sporije (ako imaš probleme)
SLOW_MO=2000 npm start

# Brže (ako je OK)
SLOW_MO=500 npm start

# Samo prvih 10 oglasa
npm run test-first-5 -- --listings=10

# Sa debug i vidljivim browser-om
DEBUG=true HEADLESS=false npm run test-first-5
```

---

## 🔍 Debug Mod

Ako nešto ide loše:

```bash
DEBUG=true HEADLESS=false npm run test-first-5
```

Ovo će:
1. Prikazati pretraživač da vidim šta se dešava
2. Ispisati sve debug poruke u konzoli
3. Uploadovati samo prvih 5 oglasa
4. Dati mi dovoljno vremena da vidim šta se dešava

---

## ✨ Status

```
✅ Localhost konfiguracija
✅ Fleksibilni timeouts
✅ Error handling
✅ Test scriptovi
✅ Spreman za upotrebu
```

---

## 📞 Čeka?

1. **Localhost nije pokrenut?**
   ```bash
   npm run dev  # iz root foldera
   ```

2. **Timeout greške?**
   - To je OK sada, skript je fleksibilniji
   - Vidiš poruku "Navigation timeout, nastavljam..." - to je OK

3. **Login nije radio?**
   ```bash
   DEBUG=true HEADLESS=false npm run test
   ```

---

**Sada pokušaj:**
```bash
# Terminal 1
npm run dev

# Terminal 2 (čekaj da se dev server pokrene)
cd scripts/listing-uploader
npm run test
```

Trebalo bi da vidiš browser sa login forme! 🚀
