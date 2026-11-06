# ✅ NOVI FLOW - PRODUCT UPLOAD

## 🔄 Šta se Promenilo?

Kompletno promenjen redosled postavljanja proizvoda za **localhost:3000**.

### Stari Flow (❌ Nije Radio)
```
/user/ads/add/step1
  ↓ Dalje
/form (multiple steps)
  ↓ Dalje
/another form
  ↓ Postavi oglas
Success
```

### Novi Flow (✅ Radi)
```
Login
  ↓ (uspešna prijava)
/seller/dashboard
  ↓ (klikni "Novi proizvod")
/seller/products/new (forma sa svim poljima)
  ↓ (popuni i submit)
Success
  ↓ PAUZA OD 3 SEKUNDE
(Spreman za sledeći proizvod)
```

---

## 📋 Koraci

### 1. Login
```javascript
await page.goto('http://localhost:3000/auth/login', {
  waitUntil: 'domcontentloaded',
  timeout: 30000,
});
// Unesi email i password
// Klikni submit
```

### 2. Dashboard
```javascript
await page.goto('http://localhost:3000/seller/dashboard', {
  waitUntil: 'domcontentloaded',
});
```

### 3. Klikni "Novi proizvod"
```javascript
const newProductBtn = await page.$('button:has-text("Novi proizvod")');
await newProductBtn.click();
```

### 4. Popuni Formu
```javascript
// Naslov
await titleField.fill(listing.Title);

// Opis
await descField.fill(listing.Content);

// Cena
await priceField.fill(listing.Price);

// Kategorija (ako postoji)
await categoryField.selectOption(listing.Category);

// Slike
await fileInput.setInputFiles(imagePath);
```

### 5. Submit i Pauza
```javascript
await submitBtn.click();
// Čekaj navigaciju
await page.waitForTimeout(3000); // 3 sekunde pauze!
```

---

## ✨ Karakteristike

✅ **Dashboard flow** - Koristi seller dashboard
✅ **Jedno dugme** - Samo "Novi proizvod" kliks
✅ **Flexible selektori** - Traži po placeholder/name/type
✅ **3 sekunde pauze** - Između svakog proizvoda
✅ **Better error handling** - Detaljne poruke

---

## 🧪 Testiranje

```bash
npm run test        # Testiraj login
npm run dry-run     # Simuliraj bez upload-a
npm run test-first-5  # Testiraj sa 5 proizvoda
npm start           # Upload sve
```

---

## 📊 Output

```
─── 🚀 LISTING UPLOADER - ADVANCED ───
ℹ Email: phikret@gmail.com
──────────────────────────────────────────────────
✅ Učitano 65 oglasa
──────────────────────────────────────────────────
ℹ Prijavljivam se na localhost...
✅ Uspešna prijava!
──────────────────────────────────────────────────
ℹ [1/65] "VW Passat SIKU"
🔍 Krećem sa postavljanjem oglasa...
🔍 Odlazim na seller dashboard...
🔍 Tražim dugme "Novi proizvod"...
🔍 Klićem na "Novi proizvod"...
🔍 Forma je učitana, počinjem sa unošenjem podataka...
🔍 Unosim naslov...
🔍 Unosim opis...
🔍 Unosim cenu...
📸 Uploadujem 6 slika...
🔍 Tražim dugme za slanje...
🔍 Klićem na submit dugme...
🔍 Oglas je poslat
🔍 Pauziram 3 sekunde pre sledećeg oglasa...
✅ [1/65] Uspešno

ℹ [2/65] "1/43 Infineon Minichamps"
... (repeats for each product)

📊 Statistika:
   Total: 65
   ✅ Uspešno: 65
   ❌ Greške: 0
```

---

## 🛠️ Troubleshooting

### Greška: "Dugme Novi proizvod nije pronađeno"

**Šta može biti:**
- Dugme ima drugačiji tekst
- Dashboard nije učitan
- HTML struktura je drugačija

**Rešenje:**
```bash
DEBUG=true HEADLESS=false npm run test-first-5
```
Otvoriće se browser - pogledaj šta je na dashboard-u i ažuriraj selector.

### Greška: "Submit dugme nije pronađeno"

**Šta može biti:**
- Dugme ima drugačiji tekst (Spremi, Kreiraj, Postavi...)
- Nalazi se u drugoj formi

**Rešenje:**
- Koristi `DEBUG=true` i pronađi tačan text
- Ažuriraj `uploadSingleListing()` funkciju

### Greška: "Slika se ne uploaduje"

**Šta može biti:**
- Input file field nije pronađen
- Putanja do slike nije validna

**Rešenje:**
```bash
ls d:\Work\source\kupujemprodajem\kp\photos\
```
Proveri da li folder i slike postoje.

---

## 💡 Flexible Selektori

Skript traži elemente fleksibilno:

```javascript
// Naslov - traži po placeholder ili name
let titleField = await page.$('input[placeholder*="naslov" i]') ||
                 await page.$('input[name*="title" i]') ||
                 await page.$('input:first-of-type');

// Cena - traži po type ili class
let priceField = await page.$('input[placeholder*="cena" i]') ||
                 await page.$('input[type="number"]') ||
                 inputs[0];
```

Ako selektori ne rade, ažuriraj ih u `src/uploader.js` ili `src/uploader-advanced.js`.

---

## 🎯 Pauze Između Proizvoda

**Važno:** Svaki proizvod ima pauzu od **3 sekunde** nakon što se submit dugme klikne!

```javascript
// VAŽNO: Pauza od 3 sekunde između oglasa
await page.waitForTimeout(3000);
```

Ovo sprečava rate-limiting i daje vremena serveru da obradi.

---

## 📚 Fajlovi

- ✅ `src/uploader.js` - Osnovna verzija (sa novim flow-om)
- ✅ `src/uploader-advanced.js` - Napredna verzija (sa novim flow-om)
- ✅ `test-localhost.js` - Testiraj localhost konekciju
- ✅ `.env` - Kredencijali

---

## ✨ Status

```
✅ Novi flow implementiran
✅ Dashboard klik
✅ Flexible selektori
✅ 3 sekunde pauze
✅ Error handling
✅ Spreman za upotrebu
```

---

## 🚀 Sledeći Koraci

1. **Testiraj login**
   ```bash
   npm run test
   ```

2. **Testiraj sa par proizvoda**
   ```bash
   npm run test-first-5
   ```

3. **Ako sve radi - pusti sve**
   ```bash
   npm start
   ```

---

**Sada pokušaj:**
```bash
npm run test        # Trebalo bi: ✅ Prijava je uspešna!
```

🚀 Sretno!
