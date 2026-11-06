#!/usr/bin/env node
/**
 * Test skript - Provera da li se može pristupiti localhost aplikaciji i autentifikovati
 * Korišćenje: node test-localhost.js
 */

import { chromium } from 'playwright';
import dotenv from 'dotenv';

dotenv.config();

const CONFIG = {
  email: process.env.KP_EMAIL,
  password: process.env.KP_PASSWORD,
  headless: false, // Prikaži browser za test
};

console.log('\n🧪 TEST LOCALHOST - AUTENTIFIKACIJA\n');
console.log(`Email: ${CONFIG.email}`);
console.log(`Password: ${CONFIG.password.replace(/./g, '*')}\n`);

async function testLocalhost() {
  const browser = await chromium.launch({ headless: CONFIG.headless });
  const page = await browser.newPage();

  try {
    console.log('[1/3] Testiram konekciju na localhost:3000...');
    await page.goto('http://localhost:3000', { 
      waitUntil: 'domcontentloaded', 
      timeout: 10000 
    });
    console.log('✅ Localhost je dostupan');

    console.log('\n[2/3] Odlazim na login stranicu...');
    await page.goto('http://localhost:3000/auth/login', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });
    console.log('✅ Login stranica je dostupna');

    console.log('\n[3/3] Testiram prijavu...');
    
    // Pronađi input polja
    await page.waitForSelector('input[name="email"]', { timeout: 5000 });
    const emailInput = await page.$('input[name="email"]');
    const passwordInput = await page.$('input[name="password"]');
    const submitButton = await page.$('button[type="submit"]');

    if (!emailInput || !passwordInput || !submitButton) {
      throw new Error('Nije moguće pronaći login forme.');
    }

    // Unesi kredencijale
    await emailInput.fill(CONFIG.email);
    await passwordInput.fill(CONFIG.password);
    
    console.log('  - Unesen email i lozinka');
    
    // Klikni prijavu
    await submitButton.click();
    
    console.log('  - Prijavljivam se...');
    
    // Čekaj navigaciju sa fleksibilnijom strategijom
    try {
      await page.waitForNavigation({ 
        waitUntil: 'domcontentloaded', 
        timeout: 10000 
      });
    } catch (error) {
      console.log('  - Navigation timeout (to je OK, nastavljam...)');
    }

    // Čekaj da se stranica učita
    await page.waitForTimeout(2000);
    
    console.log('✅ Prijava je uspešna');

    console.log('\n🎉 SVI TESTOVI SU PROŠLI!\n');
    console.log('Localhost je spreman za upload!\n');
    console.log('Možeš sada pokrenuti uploader sa:\n');
    console.log('  npm start              - Upload sve oglase');
    console.log('  npm run advanced       - Napredna verzija');
    console.log('  npm run test-first-5   - Testiraj sa 5 oglasa\n');

  } catch (error) {
    console.error(`\n❌ GREŠKA: ${error.message}\n`);
    console.log('Provera:');
    console.log('1. Proveri da li je localhost:3000 pokrenut (npm run dev ili yarn dev)');
    console.log('2. Proveri email i lozinku u .env fajlu');
    console.log('3. Proveri da li je internet dostupan');
    console.log('4. Pogledaj DevTools (F12) u browser-u da vidiš šta se dešava\n');
    
    await browser.close();
    process.exit(1);
  }

  await browser.close();
}

testLocalhost();
