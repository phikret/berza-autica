/**
 * ADVANCED UPLOADER - SA BOLJIM TIMEOUT STRATEGIJOM
 * 
 * Korišćenje: node src/uploader-advanced.js --dry-run
 * --dry-run         = samo provera bez upload-a
 * --headless=false  = prikaži browser
 * --listings=5      = upload samo prvih 5 oglasa
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { logger, logStats } from './logger.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '../../..');

// Parse CLI argumenti
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.split('=');
  acc[key.replace('--', '')] = value === undefined ? true : value;
  return acc;
}, {});

const CONFIG = {
  email: process.env.KP_EMAIL,
  password: process.env.KP_PASSWORD,
  listingsJson: path.join(PROJECT_ROOT, process.env.LISTINGS_JSON),
  photosRoot: path.resolve(process.env.PHOTOS_ROOT),
  headless: args['headless'] !== 'false',
  slowMo: parseInt(process.env.SLOW_MO) || 500,
  debug: process.env.DEBUG === 'true' || args.debug,
  dryRun: args['dry-run'],
  maxListings: args.listings ? parseInt(args.listings) : undefined,
};

const stats = {
  total: 0,
  success: 0,
  failed: 0,
  skipped: 0,
  errors: [],
};

// Startup
logger.header('🚀 LISTING UPLOADER - ADVANCED');
logger.info(`Email: ${CONFIG.email}`);
logger.info(`Headless: ${CONFIG.headless}`);
logger.info(`Slowmo: ${CONFIG.slowMo}ms`);
if (CONFIG.dryRun) logger.warning('DRY RUN MODE - Nema upload-a');
if (CONFIG.maxListings) logger.info(`Max oglasa: ${CONFIG.maxListings}`);
logger.divider();

// Validacija
if (!CONFIG.email || !CONFIG.password) {
  logger.error('KP_EMAIL i KP_PASSWORD nisu postavljeni u .env fajlu');
  process.exit(1);
}

if (!fs.existsSync(CONFIG.listingsJson)) {
  logger.error(`Listings JSON fajl nije pronađen: ${CONFIG.listingsJson}`);
  process.exit(1);
}

if (!fs.existsSync(CONFIG.photosRoot)) {
  logger.error(`Photos folder nije pronađen: ${CONFIG.photosRoot}`);
  process.exit(1);
}

// Učitaj oglase
let listings = [];
try {
  const jsonContent = fs.readFileSync(CONFIG.listingsJson, 'utf-8');
  listings = JSON.parse(jsonContent);
  
  if (!CONFIG.maxListings) {
    listings = listings.slice(0, CONFIG.maxListings);
  }
  
  logger.success(`Učitano ${listings.length} oglasa`);
  logger.divider();
} catch (error) {
  logger.error(`Greška pri čitanju JSON: ${error.message}`);
  process.exit(1);
}

// Cache za mapiranje kategorija
let categoryMap = {};

/**
 * Pronađi sve slike za oglas
 */
function getListingImages(listing) {
  const images = listing.Images || [];
  const fullPaths = [];

  for (const imageName of images) {
    const possiblePaths = [
      path.join(CONFIG.photosRoot, imageName),
      path.join(CONFIG.photosRoot, imageName.replace(/\\/g, '/')),
    ];

    let found = false;
    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        fullPaths.push(filePath);
        found = true;
        break;
      }
    }

    if (!found) {
      logger.warning(`Slika nije pronađena: ${imageName}`);
    }
  }

  return fullPaths;
}

/**
 * Validiraj oglas
 */
function validateListing(listing) {
  const errors = [];

  if (!listing.Title || listing.Title.trim().length === 0) {
    errors.push('Title je obavezan');
  }

  if (!listing.Content || listing.Content.trim().length === 0) {
    errors.push('Content je obavezan');
  }

  if (!listing.Price || isNaN(listing.Price)) {
    errors.push('Price mora biti broj');
  }

  const images = getListingImages(listing);
  if (images.length === 0) {
    errors.push('Nema pronađenih slika');
  }

  return errors;
}

/**
 * Upload jednog oglasa
 */
async function uploadSingleListing(page, listing, index, total) {
  // Validiraj pre nego što počneš
  const errors = validateListing(listing);
  if (errors.length > 0) {
    throw new Error(`Validacija neuspešna: ${errors.join(', ')}`);
  }

  if (CONFIG.dryRun) {
    logger.info(`[DRY RUN] Bio bi uploadovan oglas: "${listing.Title}"`);
    return;
  }

  logger.debug('Krećem sa postavljanjem oglasa...');

  // Pronađi slike i ograniči na max 5
  const images = getListingImages(listing).slice(0, 5);
  if (images.length === 0) {
    throw new Error('Nema pronađenih slika za ovaj oglas');
  }

  logger.debug(`Uploadujem preko API-ja (${images.length} slika)...`);
  
  // Čitaj slike kao base64 na Node.js side
  const imageDataList = [];
  for (const imagePath of images) {
    try {
      const fileBuffer = fs.readFileSync(imagePath);
      const base64Data = fileBuffer.toString('base64');
      const fileName = path.basename(imagePath);
      imageDataList.push({
        data: base64Data,
        name: fileName,
      });
    } catch (err) {
      logger.warning(`Ne mogu da čitam sliku: ${imagePath}`);
    }
  }

  if (imageDataList.length === 0) {
    throw new Error('Ne mogu da učitam slike');
  }

  // Pronađi ili koristi defaultnu kategoriju
  // TODO: Trebalo bi mapirati kategorije iz JSON-a u prave IDs
  // Za sada koristi 'autici' kao default
  let categoryId = listing.Category;
  if (!categoryId || categoryId === '584') {
    // Koristi default 'Autici' kategoriju
    categoryId = 'autici';
    logger.debug(`Korišćenje default kategorije: ${categoryId}`);
  }

  // Kreiraj FormData sa base64 podacima
  const formDataJson = {
    name: listing.Title,
    description: listing.Content,
    price: parseInt(listing.Price),
    categoryId: categoryId,
    scale: listing.Scale || '1:43',
    images: imageDataList,
  };

  logger.debug(`FormData: ${JSON.stringify(formDataJson).substring(0, 100)}`);

  // Koristi Playwright da uploaduje direktno preko API-ja
  const apiResponse = await page.evaluate(
    async (args) => {
      const { data } = args;
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('price', data.price);
      formData.append('categoryId', data.categoryId);
      formData.append('scale', data.scale);

      // Konvertuj base64 slike u blobs
      for (const image of data.images) {
        try {
          const binaryString = atob(image.data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: 'image/jpeg' });
          formData.append('images', blob, image.name);
        } catch (e) {
          console.error(`Failed to convert image: ${image.name}`);
        }
      }

      const res = await fetch('/api/products', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      return {
        status: res.status,
        body: await res.json(),
      };
    },
    { data: formDataJson }
  );

  logger.debug(`API response status: ${apiResponse.status}`);
  logger.debug(`API response: ${JSON.stringify(apiResponse.body).substring(0, 100)}`);

  if (apiResponse.status !== 201) {
    throw new Error(`API greška: ${apiResponse.body.error || 'Nepoznata greška'}`);
  }

  logger.debug('Oglas je uspešno uploadovan preko API-ja');
  
  // Čekaj 3 sekunde pre sledećeg oglasa
  logger.debug('Pauziram 3 sekunde pre sledećeg oglasa...');
  await page.waitForTimeout(3000);
}

/**
 * Glavni proces
 */
async function main() {
  const browser = await chromium.launch({
    headless: CONFIG.headless,
    slowMo: CONFIG.slowMo,
  });

  // VAŽNO: Koristi browserContext da čuvaju cookies između zahteva!
  const context = await browser.newContext();
  const page = await context.newPage();

  if (CONFIG.debug) {
    page.on('console', (msg) => logger.debug(`[BROWSER] ${msg.text()}`));
  }

  try {
    // Prijava
    logger.info('Prijavljivam se na localhost...');
    await page.goto('http://localhost:3000/auth/login', { 
      waitUntil: 'domcontentloaded', 
      timeout: 30000 
    });

    // Čekaj da se forma učita
    await page.waitForSelector('input[name="email"]', { timeout: 10000 }).catch(() => {});

    const emailInput = await page.$('input[name="email"]');
    const passwordInput = await page.$('input[name="password"]');
    const submitButton = await page.$('button[type="submit"]');

    if (!emailInput || !passwordInput || !submitButton) {
      throw new Error('Login forma nije pronađena - HTML struktura se možda promenila');
    }

    await emailInput.fill(CONFIG.email);
    await passwordInput.fill(CONFIG.password);
    await submitButton.click();

    try {
      await page.waitForNavigation({ 
        waitUntil: 'domcontentloaded', 
        timeout: 10000 
      });
    } catch (error) {
      logger.warning('Navigation timeout, nastavljam...');
    }

    await page.waitForTimeout(2000);

    const urlAfterLogin = page.url();
    logger.debug(`URL nakon logovanja: ${urlAfterLogin}`);
    
    if (urlAfterLogin.includes('/auth/login')) {
      throw new Error('Login nije uspeo - i dalje sam na login stranici');
    }

    // Proveri cookies
    const cookies = await context.cookies();
    logger.debug(`Cookies nakon logovanja: ${cookies.length}`);
    cookies.forEach(c => {
      if (c.name.includes('next') || c.name.includes('auth')) {
        logger.debug(`  - ${c.name}: ${c.value.substring(0, 30)}...`);
      }
    });

    logger.success('Uspešna prijava!');
    logger.divider();

    // Testiraj API sesije
    logger.debug('Testiram /api/auth/session endpoint...');
    const sessionResponse = await page.evaluate(async () => {
      const res = await fetch('/api/auth/session');
      return {
        status: res.status,
        headers: Object.fromEntries(res.headers),
        body: await res.json(),
      };
    });
    logger.debug(`Session endpoint: ${sessionResponse.status}`);
    logger.debug(`Session data: ${JSON.stringify(sessionResponse.body).substring(0, 100)}`);

    logger.divider();

    // Upload svih oglasa
    stats.total = listings.length;

    for (let i = 0; i < listings.length; i++) {
      const listing = listings[i];
      const index = i + 1;

      try {
        logger.info(`[${index}/${listings.length}] "${listing.Title}"`);
        await uploadSingleListing(page, listing, index, listings.length);
        logger.success(`[${index}/${listings.length}] Uspešno`);
        stats.success++;
      } catch (error) {
        logger.error(`[${index}/${listings.length}] ${error.message}`);
        stats.failed++;
        stats.errors.push({ listing: listing.Title, error: error.message });
      }
    }

    logger.divider();
    logStats(stats);

    if (stats.errors.length > 0) {
      logger.warning('\nGreške:');
      stats.errors.forEach((err) => {
        console.log(`  - ${err.listing}: ${err.error}`);
      });
    }
  } catch (error) {
    logger.error(`Kritična greška: ${error.message}`);
    if (CONFIG.debug) console.error(error);
  } finally {
    await context.close();
    await browser.close();
    process.exit(stats.failed > 0 ? 1 : 0);
  }
}

main();
