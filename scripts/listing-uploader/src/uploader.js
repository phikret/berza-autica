import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { logger, logStats } from './logger.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '../../..');

const CONFIG = {
  email: process.env.KP_EMAIL,
  password: process.env.KP_PASSWORD,
  listingsJson: path.join(PROJECT_ROOT, process.env.LISTINGS_JSON),
  photosRoot: path.resolve(process.env.PHOTOS_ROOT),
  headless: process.env.HEADLESS === 'true',
  slowMo: parseInt(process.env.SLOW_MO) || 0,
  debug: process.env.DEBUG === 'true',
};

const stats = {
  total: 0,
  success: 0,
  failed: 0,
};

logger.header('Inicijalizacija Uploader-a');
logger.info(`Email: ${CONFIG.email}`);
logger.info(`Headless: ${CONFIG.headless}`);
logger.divider();

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

let listings = [];
try {
  const jsonContent = fs.readFileSync(CONFIG.listingsJson, 'utf-8');
  listings = JSON.parse(jsonContent);
  logger.success(`Učitano ${listings.length} oglasa iz JSON fajla`);
  logger.divider();
} catch (error) {
  logger.error(`Greška pri čitanju JSON fajla: ${error.message}`);
  process.exit(1);
}

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

async function performLogin(page) {
  logger.info('Prijavljivanje na localhost...');

  // PRISTUP LOGIN FORMI
  await page.goto('http://localhost:3000/auth/login', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });

  logger.debug('Login stranica učitana');
  await page.waitForTimeout(1500);

  // POPUNI LOGIN FORMU
  await page.fill('input[name="email"]', CONFIG.email);
  await page.fill('input[name="password"]', CONFIG.password);
  
  // KLIKNI SUBMIT - ovo će signIn sa NextAuth-om
  await page.click('button[type="submit"]');

  logger.debug('Submit kliknut, čekam redirect...');
  
  // ČEKAJ na navigation - NextAuth će redirekovati nakon uspešne prijave
  try {
    await page.waitForNavigation({ 
      waitUntil: 'domcontentloaded', 
      timeout: 15000 
    });
    logger.debug('Navigation registrovan');
  } catch (navError) {
    logger.warning('Timeout čekanja na navigation - nastavljam...');
  }

  // DODATNA SIGURNOST: čekaj da se DOM potpuno učita
  await page.waitForTimeout(2000);

  // Čekaj da se NextAuth cookie postavi
  logger.debug('Čekam da se sessionToken postavi...');
  const context = page.context();
  try {
    let cookieSet = false;
    for (let i = 0; i < 10; i++) {
      const cookies = await context.cookies();
      const hasSessionCookie = cookies.some(c => 
        c.name.toLowerCase().includes('session') || 
        c.name === '__Secure-next-auth.session-token' ||
        c.name === 'next-auth.session-token'
      );
      if (hasSessionCookie) {
        cookieSet = true;
        logger.debug(`Session cookie pronađen na pokušaju ${i + 1}`);
        break;
      }
      await page.waitForTimeout(500);
    }
    
    if (!cookieSet) {
      logger.warning('Session cookie nije pronađen nakon 5 sekundi - nastavljam...');
    }
  } catch (cookieError) {
    logger.warning('Greška pri čekanju na session cookie:', cookieError.message);
  }

  // Dodatni korak - proveri da li je sesija validna sa servera
  logger.debug('ProveravamValidnost sesije sa servera...');
  try {
    const sessionResponse = await page.evaluate(async () => {
      const response = await fetch('/api/auth/session-check');
      const data = await response.json();
      return data;
    });
    
    if (sessionResponse.authenticated) {
      logger.debug(`Sesija je validna sa servera - korisnik: ${sessionResponse.user?.email}`);
    } else {
      logger.warning('Sesija NIJE validna sa servera!');
    }
  } catch (sessionCheckError) {
    logger.warning('Greška pri proveravanju sesije sa servera:', sessionCheckError);
  }

  // PROVERI GDE SMO SADA
  const currentUrl = page.url();
  logger.debug(`URL posle logovanja: ${currentUrl}`);

  if (currentUrl.includes('/auth/login')) {
    throw new Error('Prijava nije uspela - još sam na login stranici');
  }

  logger.success('Uspešna prijava!');
}

async function checkAndReloginIfNeeded(page) {
  try {
    const currentUrl = page.url();
    
    if (currentUrl.includes('/auth/login')) {
      logger.warning('Sesija je istekla - ponova prijavljivanje...');
      await performLogin(page);
      return true;
    }
    
    return false;
  } catch (error) {
    logger.warning(`Greška pri proveri sesije: ${error.message}`);
    throw error;
  }
}

async function uploadListings() {
  const browser = await chromium.launch({
    headless: CONFIG.headless,
    slowMo: CONFIG.slowMo,
  });

  // VAŽNO: Čuva cookies između zahteva!
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  const page = await context.newPage();

  if (CONFIG.debug) {
    page.on('console', (msg) => logger.debug(`[BROWSER] ${msg.text()}`));
  }

  try {
    // Početna prijava
    await performLogin(page);
    
    // Log cookies nakon uspešne prijave
    const cookies = await context.cookies();
    logger.debug(`Cookies posle logovanja: ${cookies.length} cookies`);
    cookies.forEach(cookie => {
      logger.debug(`  - ${cookie.name} (httpOnly: ${cookie.httpOnly}, secure: ${cookie.secure})`);
    });
    logger.divider();

    // Sada kreni sa uploadom
    stats.total = listings.length;

    for (let i = 0; i < listings.length; i++) {
      const listing = listings[i];
      const index = i + 1;

      try {
        logger.info(`[${index}/${listings.length}] Obrađujem: "${listing.Title}"`);
        await uploadSingleListing(page, listing);
        logger.success(`[${index}/${listings.length}] Oglas uspešno postavljen`);
        stats.success++;
      } catch (error) {
        logger.error(`[${index}/${listings.length}] ${error.message}`);
        stats.failed++;
        
        // Pokušaj da se ponovo prijavi ako je sesija istekla
        try {
          const needsRelogin = await checkAndReloginIfNeeded(page);
          if (needsRelogin) {
            logger.info(`Pokušavam da ponovno obradi: "${listing.Title}"`);
            await uploadSingleListing(page, listing);
            logger.success(`[${index}/${listings.length}] Oglas uspešno postavljen (posle re-logovanja)`);
            stats.failed--;
            stats.success++;
          }
        } catch (reloginError) {
          logger.error(`Nije moguće nastaviti nakon re-logovanja: ${reloginError.message}`);
        }
      }
      
      // Dodaj malo veću pauzu između uploadovanja
      await page.waitForTimeout(1000);
    }

    logger.divider();
    logStats(stats);
  } catch (error) {
    logger.error(`Kritična greška: ${error.message}`);
  } finally {
    await context.close();
    await browser.close();
    process.exit(stats.failed > 0 ? 1 : 0);
  }
}

async function uploadSingleListing(page, listing) {
  logger.debug('Krećem sa postavljanjem oglasa...');

  // Prvo proveri da li smo ulogovani, i ako nismo, prijavi se
  await checkAndReloginIfNeeded(page);

  // Proveri cookies pre navigacije
  const pageContext = page.context();
  const contextCookies = await pageContext.cookies();
  logger.debug(`Cookies pre navigacije na formu: ${contextCookies.length} cookies`);
  const sessionCookie = contextCookies.find(c => 
    c.name.toLowerCase().includes('session') || 
    c.name === '__Secure-next-auth.session-token' ||
    c.name === 'next-auth.session-token'
  );
  if (sessionCookie) {
    logger.debug(`  - Session cookie pronađen: ${sessionCookie.name}`);
  } else {
    logger.warning('  - Session cookie NIJE pronađen! Može biti problem.');
  }

  // Idi direktno na formu za novi proizvod
  logger.debug('Idim na /seller/products/new');
  await page.goto('http://localhost:3000/seller/products/new', {
    waitUntil: 'networkidle',
    timeout: 15000,
  });

  // Čekaj da se stranica učita i da React komponenta proveri sesiju
  // NextAuth `useSession()` hook proveri sesiju i ako nije validna, redirekovuje na /auth/login
  await page.waitForTimeout(4000);
  
  // Proveri ponovo nakon navigacije da li smo ulogovani
  let currentUrl = page.url();
  logger.debug(`Trenutni URL: ${currentUrl}`);
  
  if (currentUrl.includes('/auth/login')) {
    logger.warning('Detektovan redirect na /auth/login - sesija je izgubljena');
    
    // Pokušaj da se ponovo prijavi
    await performLogin(page);
    
    // I ponovo navigiraj na stranicu za nove oglase
    logger.debug('Ponovna navigacija na /seller/products/new posle re-logovanja');
    await page.goto('http://localhost:3000/seller/products/new', {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    });
    
    await page.waitForTimeout(3000);
    currentUrl = page.url();
    
    if (currentUrl.includes('/auth/login')) {
      throw new Error('KRITIČNA GREŠKA: Ne mogu da ostanu ulogovana čak ni posle re-logovanja');
    }
  }
  
  logger.debug('Sesija je aktuelna - nastavljam sa formom');

  // Čekaj da se forma učita - trebalo bi da bude input polje sa name="name"
  logger.debug('Čekam da se forma učita...');
  try {
    await page.waitForSelector('input[name="name"]', { timeout: 10000 });
    logger.debug('Forma je učitana');
  } catch (formError) {
    // Ako forma nije učitana, proveri ponovo URL
    const finalUrl = page.url();
    logger.error(`Forma nije učitana. URL: ${finalUrl}`);
    
    // Proveili šta kaže server - proveri console i network
    const logs = await page.evaluate(() => {
      return {
        url: window.location.href,
        cookies: document.cookie,
      };
    });
    logger.debug(`Browser state:`, logs);
    
    if (finalUrl.includes('/auth/login')) {
      throw new Error('Sesija je izgubljena - redirekovana na login');
    }
    
    throw new Error(`Forma nije učitana - URL: ${finalUrl}`);
  }

  // Popuni formu
  logger.debug('Unosim podatke...');
  
  // Naslov - input[name="name"]
  await page.fill('input[name="name"]', listing.Title);
  await page.waitForTimeout(300);

  // Opis - textarea[name="description"]
  const descField = await page.$('textarea[name="description"]');
  if (descField) {
    await descField.fill(listing.Content);
  }
  await page.waitForTimeout(300);

  // Cena - input[name="price"]
  await page.fill('input[name="price"]', listing.Price);
  await page.waitForTimeout(300);

  // Kategorija - select[name="categoryId"]
  if (listing.Category) {
    try {
      await page.selectOption('select[name="categoryId"]', listing.Category);
    } catch (e) {
      logger.warning('Kategorija nije pronađena');
    }
  }
  await page.waitForTimeout(300);

  // Scale - select[name="scale"]
  if (listing.Scale || listing.Title.includes('1/')) {
    const scale = listing.Scale || '1:43';
    try {
      await page.selectOption('select[name="scale"]', scale);
    } catch (e) {
      logger.warning('Scale nije pronađen');
    }
  }

  // Upload slika
  const images = getListingImages(listing);
  if (images.length > 0) {
    logger.debug(`Uploadujem ${images.length} slika...`);
    
    for (const imagePath of images) {
      try {
        const fileInput = await page.$('input[type="file"]');
        if (fileInput) {
          await fileInput.setInputFiles(imagePath);
          await page.waitForTimeout(800);
        }
      } catch (error) {
        logger.warning(`Greška pri uploadovanju slike`);
      }
    }
  }

  // Pronađi i klikni submit
  logger.debug('Tražim submit dugme...');
  const submitBtn = await page.$('button[type="submit"]');
  
  if (submitBtn) {
    logger.debug('Klićem submit...');
    await submitBtn.click();
    await page.waitForTimeout(2000);
  }

  logger.debug('Oglas je obrađen');
  await page.waitForTimeout(2000);
}

uploadListings().catch(console.error);
