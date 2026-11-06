#!/usr/bin/env node
/**
 * Inspect skript - Proverava šta se dešava sa aplikacijom
 * Korišćenje: node inspect-app.js
 */

import { chromium } from 'playwright';
import dotenv from 'dotenv';

dotenv.config();

const CONFIG = {
  email: process.env.KP_EMAIL,
  password: process.env.KP_PASSWORD,
  headless: false,
};

console.log('\n🔍 INSPECT - PROVERAVANJE APLIKACIJE\n');

async function inspectApp() {
  const browser = await chromium.launch({ headless: CONFIG.headless });
  const page = await browser.newPage();

  try {
    // Prati sve zahteve
    page.on('request', (request) => {
      console.log(`📡 REQUEST: ${request.method()} ${request.url()}`);
    });

    page.on('response', (response) => {
      console.log(`📦 RESPONSE: ${response.status()} ${response.url()}`);
    });

    console.log('[1/5] Odlazim na login stranicu...');
    await page.goto('http://localhost:3000/auth/login', { 
      waitUntil: 'domcontentloaded', 
      timeout: 10000 
    });
    console.log('✅ Login stranica učitana\n');

    await page.waitForSelector('input[name="email"]', { timeout: 5000 });
    const emailInput = await page.$('input[name="email"]');
    const passwordInput = await page.$('input[name="password"]');
    const submitButton = await page.$('button[type="submit"]');

    console.log('[2/5] Unošenje kredencijala...');
    await emailInput.fill(CONFIG.email);
    await passwordInput.fill(CONFIG.password);
    console.log('✅ Kredencijali uneti\n');

    console.log('[3/5] Klićem submit...');
    await submitButton.click();
    console.log('✅ Submit kliknut\n');

    console.log('[4/5] Čekam da se nešto desi...');
    await page.waitForTimeout(3000);
    console.log('✅ 3 sekunde prošle\n');

    console.log('[5/5] Provera statusa:\n');
    const currentUrl = page.url();
    console.log(`📍 Trenutni URL: ${currentUrl}`);

    if (currentUrl.includes('/auth/login')) {
      console.log('❌ JOŠ SAM NA LOGIN STRANICI!');
    } else if (currentUrl.includes('/seller/dashboard')) {
      console.log('✅ NA DASHBOARD-U!');
    } else if (currentUrl.includes('/seller')) {
      console.log('✅ U SELLER SEKCIJI');
    } else {
      console.log('❓ NA DRUGOJ STRANICI');
    }

    console.log('\n🧪 Dodatne Provere:\n');

    // Proveri HTML
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log(`Tekst na stranici (prvih 200 karaktera):`);
    console.log(`"${bodyText.substring(0, 200)}..."\n`);

    // Proveri URL nakon logovanja
    console.log('📍 Čekaj - možda je samo loading...');
    console.log('Ostani u browser-u da vidim šta se dešava...\n');

    console.log('Zatvori browser kada završiš sa pregledom\n');

  } catch (error) {
    console.error(`\n❌ GREŠKA: ${error.message}\n`);
    await browser.close();
    process.exit(1);
  }
}

inspectApp();
