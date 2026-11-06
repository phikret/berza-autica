# Listing Uploader - Automatizovani Postavljač Oglasa

Ovaj skript automatizovano postavlja oglase na **localhost:3000** (berza-autica) na osnovu JSON fajla sa svim detaljima oglasa i slikama.

> **Napomena:** Skript je konfigurisan za `localhost:3000`. Ako hoćeš da ga koristiš za kupujem-prodajem.com, vidi `LOCALHOST.md` za instrukcije.

## 🎯 Šta radi?

- Čita JSON fajl sa informacijama o oglasima
- Prijavljivuje se na tvoj nalog
- Za svaki oglas:
  - Bira kategoriju i grupu
  - Unosi naslov, opis i cenu
  - Postavlja stanje oglasa
  - Uploaduje sve slike
  - Završava postavljanje oglasa

## 📋 Preduslov

1. **Node.js** verzija 16+ treba da bude instalirana
2. JSON fajl sa oglasima (npr. `autici.kupujemprodajem@gmail.com.json`)
3. Folder sa slikama (npr. `d:\Work\source\kupujemprodajem\kp\photos\`)

## 🚀 Kako pokrenuti?

### 1. Instaliraj zavisnosti
```bash
cd scripts/listing-uploader
npm install
```

### 2. Konfiguriši `.env` fajl
Uredi `scripts/listing-uploader/.env` i postavi:
```env
KP_EMAIL=phikret@gmail.com
KP_PASSWORD=Karabaja43002
LISTINGS_JSON=../../autici.kupujemprodajem@gmail.com.json
PHOTOS_ROOT=../../../kupujemprodajem/kp/photos/
HEADLESS=true
SLOW_MO=1000
DEBUG=false
```

**Opcije:**
- `HEADLESS=true` - Pokreni bez vidljive pretraživača (brže)
- `HEADLESS=false` - Prikaži pretraživač (za debugging)
- `SLOW_MO=1000` - Usporenje između akcija u ms (default: 0)
- `DEBUG=true` - Prikaži konzolu pretraživača i greške

### 3. Pokreni uploader
```bash
npm start
```

ili sa watch mode-om:
```bash
npm run dev
```

## 📁 Struktura JSON fajla

```json
[
  {
    "Title": "1/43 VW Passat SIKU",
    "Content": "Opis oglasa...",
    "Price": "400",
    "Category": "584",
    "Group": "1122",
    "Condition": 2,
    "Images": [
      "143/IMG_4149.JPG",
      "143/IMG_4150.JPG"
    ]
  }
]
```

### Polja:
- `Title` - Naslov oglasa ✅ obavezno
- `Content` - Opis oglasa ✅ obavezno
- `Price` - Cena ✅ obavezno
- `Category` - ID kategorije (može biti bilo koja vrednost iz sistema)
- `Group` - ID grupe (može biti bilo koja vrednost iz sistema)
- `Condition` - 1=Polovan, 2=Nov (default: 2)
- `Images` - Niz putanja do slika (relativno od `PHOTOS_ROOT`)

## ⚠️ Važne napomene

1. **Slike moraju biti dostupne** - Skript će prijaviti upozorenje ako neka slika nedostaje
2. **Pauziran između oglasa** - Koristi `SLOW_MO` da spreči blokiranje od strane sajta
3. **Kredencijali su sigurni** - `.env` fajl je u `.gitignore`, nikada se neće commitati
4. **Prvo testiraj sa malim brojem** - Počni sa 1-2 oglasa da vidiš kako radi

## 🔧 Troubleshooting

### Greška: "Listings JSON fajl nije pronađen"
- Proveri putanju u `.env` fajlu
- Proveri da li JSON fajl postoji na toj lokaciji

### Greška: "Photos folder nije pronađen"
- Proveri putanju u `.env` fajlu
- Proveri da li folder sa slikama postoji

### Greška: "Slika nije pronađena"
- Proveri da li je putanja u JSON fajlu ispravna
- Proveri format putanje (može biti sa `\` ili `/`)

### Uploader se zaglavie ili sporije ide
- Prosledi `SLOW_MO` vrednost (npr. 2000 ms)
- Setuj `DEBUG=true` da vidiš šta se dešava

### Greška: "Neuspešna prijava"
- Proveri email i lozinku u `.env` fajlu
- Proveri da li sajt ima potrebne selektore (mogu se promeniti)

## 📝 Primer pokretanja

```bash
# Iz root foldera projekta
cd scripts/listing-uploader

# Instaliraj zavisnosti (prvi put)
npm install

# Pokreni uploader
npm start

# Ili sa debug opcijama
HEADLESS=false DEBUG=true npm start
```

## 🛡️ Sigurnost

⚠️ **NIKADA** ne commituj `.env` fajl sa kredencijalima! Fajl je automatski u `.gitignore`.

## 📞 Support

Ako naiđeš na probleme:
1. Setuj `DEBUG=true` u `.env` fajlu
2. Pokreni sa `HEADLESS=false` da vidim šta se dešava
3. Proveri da li HTML struktura sajta jeste promenjena (selektori mogu biti drugačiji)
