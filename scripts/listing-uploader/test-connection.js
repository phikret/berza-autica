#!/usr/bin/env node
/**
 * Test skript - Provera da li se može pristupiti sajtu i autentifikovati
 * Korišćenje: node test-connection.js
 */

import { chromium } from 'playwright';
import dotenv from 'dotenv';

dotenv.config();

const CONFIG = {
  email: process.env.KP_EMAIL,
  password: process.env.KP_PASSWORD,
  headless: false, // Prikaži browser za test
};

console.log('\n🧪 TEST KONEKCIJE I AUTENTIFIKACIJE\n');
console.log(`Email: ${CONFIG.email}`);

async function testConnection() {
  const browser = await chromium.launch({ headless: CONFIG.headless });
  const page = await browser.newPage();

  try {
    console.log('\n[1/3] Testiram konekciju na sajt...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 10000 });
    console.log('✅ Sajt je dostupan');

    console.log('\n[2/3] Odlazim na login stranicu...');
    await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle' });
    console.log('✅ Login stranica je dostupna');

    console.log('\n[3/3] Testiram prijavu...');
    
    // Pronađi input polja
    const emailInput = await page.$('input[name="email"]');
    const passwordInput = await page.$('input[name="password"]');
    const submitButton = await page.$('button[type="submit"]');

    if (!emailInput || !passwordInput || !submitButton) {
      throw new Error('Nije moguće pronaći login forme. HTML struktura se možda promenila.');
    }

    // Unesi kredencijale
    await emailInput.fill(CONFIG.email);
    await passwordInput.fill(CONFIG.password);
    
    console.log('  - Unesen email i lozinka');
    
    // Klikni prijavu
    await submitButton.click();
    
    console.log('  - Prijavljivam se...');
    
    // Čekaj navigaciju
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 });
    
    console.log('✅ Prijava je uspešna');

    console.log('\n🎉 SVI TESTOVI SU PROŠLI!\n');
    console.log('Možeš sada pokrenuti uploader sa: npm start\n');

  } catch (error) {
    console.error(`\n❌ GREŠKA: ${error.message}\n`);
    console.log('Provera:');
    console.log('1. Proveri email i lozinku u .env fajlu');
    console.log('2. Proveri da li je internet dostupan');
    console.log('3. Proveri da li je sajt dostupan');
    console.log('4. Možda je HTML struktura sajta promenjena\n');
    
    await browser.close();
    process.exit(1);
  }

  await browser.close();
}

testConnection();
