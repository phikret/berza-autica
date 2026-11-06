# ⚡ QUICK START GUIDE

## 5 minut do upload-a

### 1️⃣ Instaliraj zavisnosti (prvi put)
```bash
cd scripts/listing-uploader
npm install
```

### 2️⃣ Konfiguriraj `.env` fajl
```env
KP_EMAIL=phikret@gmail.com
KP_PASSWORD=Karabaja43002
LISTINGS_JSON=../../autici.kupujemprodajem@gmail.com.json
PHOTOS_ROOT=../../../kupujemprodajem/kp/photos/
HEADLESS=true
SLOW_MO=1000
DEBUG=false
```

### 3️⃣ Testiraj konekciju
```bash
npm run test
```
Trebalo bi da vidiš browser sa prijavom. Ako se uspešno prijavi, odličnog!

### 4️⃣ Testiraj sa par oglasa
```bash
npm run test-first-5
```
Ovo će uploadovati samo prvih 5 oglasa sa `HEADLESS=false` da vidiš kako radi.

### 5️⃣ Pokreni pravi upload
```bash
npm start
```

---

## 🧪 Testiranje

### Dry Run (Bez Upload-a)
```bash
npm run dry-run
```
Simulira upload - odličan test pre nego što kreneš sa pravim!

### Debug Mod
```bash
DEBUG=true npm start
```
Prikaži sve što se dešava u browser-u

### Vidi Browser
```bash
HEADLESS=false npm start
```

---

## 📋 Skratke

| Komanda | Šta radi |
|---------|----------|
| `npm start` | Uploaduj sve oglase |
| `npm run advanced` | Napredna verzija sa boljim error handling-om |
| `npm run test` | Testiraj konekciju i prijavu |
| `npm run dry-run` | Simuliraj upload bez promenina |
| `npm run test-first-5` | Testiraj sa prvih 5 oglasa |

---

## ⚠️ Česta Pitanja

### Q: Koliko dugo traje upload?
A: ~2-3 sekunde po oglasu sa `SLOW_MO=1000`. Bez toga može biti brže ali sajt može blokirati.

### Q: Greška "Slika nije pronađena"
A: Proveri putanju `PHOTOS_ROOT` i paths u JSON fajlu. Trebale bi biti relativne putanje od tog foldera.

### Q: Greška "Login forma nije pronađena"
A: Sajt je možda promenio HTML. Koristi `HEADLESS=false` da vidiš šta se dešava i ažurira selektore u `src/selectors.js`

### Q: Mogu li da pauzem i nastavn upload?
A: Trenutno nema. Kreiram verziju sa state fajlom - slobodno reci ako treba!

---

## 🎯 Preporučeni Tok

1. `npm install` - Instaliraj zavisnosti
2. Postavi `.env` fajl sa kredencijalima
3. `npm run test` - Testiraj konekciju
4. `npm run test-first-5` - Testiraj sa par oglasa
5. `npm run dry-run` - Simuliraj sve
6. `npm start` - KRENI! 🚀

---

## 📞 Greške?

Pogledaj `README.md` za detaljnije troubleshooting, ili pokreni sa:
```bash
DEBUG=true HEADLESS=false npm run advanced --listings=1
```

Ovo će uploadovati samo 1 oglas sa svim debug info-ima vidljivim.
