# ✅ SETUP JE GOTOV!

Uspešno sam kreirao automatizovani sistem za upload oglasa na kupujem-prodajem.com

---

## 📦 Šta je kreirano?

### Struktura projekta
```
scripts/listing-uploader/
├── .env                      # Konfiguracija (email, password, putanje)
├── package.json              # Zavisnosti (Playwright, dotenv)
├── README.md                 # Detaljnodokumentacija
├── QUICKSTART.md            # Brz start (preporuka za početak)
├── test-connection.js        # Test skript za debug
└── src/
    ├── uploader.js           # Osnovna verzija uploader-a
    ├── uploader-advanced.js  # Napredna verzija sa boljim error handling-om
    ├── logger.js             # Logging utilities sa bojama
    └── selectors.js          # CSS selektori za sajt
```

---

## 🚀 SLEDEĆI KORACI

### 1. Instaliraj zavisnosti
```bash
cd scripts/listing-uploader
npm install
```

### 2. Konfiguriraj .env
Već je kreiran `.env` fajl sa svim što trebaš. Proveri da li su vrednosti ispravne:
- `KP_EMAIL=phikret@gmail.com`
- `KP_PASSWORD=Karabaja43002`
- `LISTINGS_JSON=../../autici.kupujemprodajem@gmail.com.json`
- `PHOTOS_ROOT=../../../kupujemprodajem/kp/photos/`

### 3. Testiraj konekciju
```bash
npm run test
```
Trebalo bi da vidiš browser sa prijavom. Ako se uspešno prijavi - odličan početak!

### 4. Testiraj upload sa par oglasa
```bash
npm run test-first-5
```
Ovo će simulirati upload sa prvih 5 oglasa sa vidljivim browser-om.

### 5. Pokreni pravi upload
```bash
npm start
```

---

## 📋 Dostupne Komande

```bash
# Osnovne komande
npm start                    # Uploaduj sve oglase
npm run test                 # Testiraj konekciju
npm run dry-run              # Simuliraj upload bez promena

# Napredne komande
npm run advanced             # Napredna verzija sa detaljnijim error handling-om
npm run test-first-5         # Testiraj sa prvih 5 oglasa
DEBUG=true npm start         # Upload sa debug info-ima
HEADLESS=false npm start     # Upload sa vidljivim browser-om
```

---

## ✨ Karakteristike

✅ **Automatizovani upload** - Svi oglasi se postavljaju automatski
✅ **Error handling** - Ako nešto pođe naopako, skript će te obaveztiti
✅ **Logging sa bojama** - Lako čitljivi output
✅ **Test mode** - Testiraj sa par oglasa pre nego što kreneš sa svima
✅ **Dry run** - Simuliraj upload bez promena
✅ **Debug mode** - Detaljni info o tome šta se dešava
✅ **Selektori** - Lako se mogu ažurirati ako sajt promeni HTML

---

## 🛡️ Sigurnost

⚠️ **Kredencijali su sigurni:**
- `.env` fajl je u `.gitignore` - nikada se neće commitati
- JSON fajl sa oglasima takođe u `.gitignore`
- Sve zavisnosti su sigurne i od poznatih izdavača

---

## 🔧 Ako Nešto Pođe Naopako

1. **Greška pri loginu?**
   ```bash
   npm run test
   ```
   Videćeš šta nije u redu sa prijavom

2. **Slike se ne uploaduju?**
   - Proveri `PHOTOS_ROOT` putanju
   - Proveri paths u JSON fajlu
   - Koristi `DEBUG=true` za više info

3. **HTML struktura sajta se promenila?**
   - Uredi `src/selectors.js` sa novim CSS selektorima
   - Koristi DevTools (F12) da pronađeš nove selektore
   - `HEADLESS=false DEBUG=true` je odličan za debug

---

## 📚 Dokumentacija

Detaljnu dokumentaciju pogledaj u:
- `README.md` - Kompletan guide
- `QUICKSTART.md` - Brz start (preporučeno za prvi put)
- `src/selectors.js` - CSS selektori (ako trebaš prilagoditi)

---

## 🎯 Preporučeni Redosled

```bash
# Putanja: d:\Work\source\berza-autica\scripts\listing-uploader

# Korak 1: Instaliraj zavisnosti
npm install

# Korak 2: Proveri .env fajl
# (trebalo bi da bude OK, ali proveri)

# Korak 3: Testiraj konekciju
npm run test

# Korak 4: Testiraj dry run
npm run dry-run

# Korak 5: Testiraj sa par oglasa
npm run test-first-5

# Korak 6: KRENI! 🚀
npm start
```

---

## 📞 Napomene

- Prvi upload može biti sporiji jer Playwright trebamoraju da preuzme browser
- `SLOW_MO=1000` dodaje 1 sekandu između akcija - može se izmeniti
- Ako server baca rate limit greške, povećaj `SLOW_MO` vrednost
- Svi oglasi se uploaduju sa tvojim nalogom `phikret@gmail.com`

---

## ✨ Bonus

Ako želiš da dodaš nova svojstva, izmeni:
- JSON struktura - dodaj nova polja
- `uploader.js` - dodaj logiku za ta polja
- `selectors.js` - dodaj nove selektore ako trebaš

---

**Spreman? Kreni sa `npm run test` 🚀**
