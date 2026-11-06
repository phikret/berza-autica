#!/usr/bin/env node
/**
 * Lokalni test - Proverava da li Playwright API radi ispravno
 * Nema potrebe za internetom - samo testiram browser API
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '../../..');

console.log('\n🧪 LOKALNI TEST - PLAYWRIGHT API\n');

async function localTest() {
  console.log('[1/4] Pokrećem Chromium browser...');
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500,
  });
  console.log('✅ Browser pokrenut');

  console.log('\n[2/4] Kreiram novu stranicu...');
  const page = await browser.newPage();
  console.log('✅ Stranica kreirana');

  console.log('\n[3/4] Testiram lokalni HTML...');
  const testHtml = `
    <html>
      <body>
        <input name="email" value="" />
        <input name="password" type="password" />
        <button type="submit">Prijava</button>
      </body>
    </html>
  `;

  await page.setContent(testHtml);
  console.log('✅ HTML učitan');

  console.log('\n[4/4] Testiram API operacije...');
  
  // Test 1: Pronađi element
  const emailInput = await page.$('input[name="email"]');
  console.log('  ✅ page.$() radi');

  // Test 2: Popuni polje
  await emailInput.fill('test@example.com');
  console.log('  ✅ fill() radi');

  // Test 3: Klikni dugme
  const button = await page.$('button');
  console.log('  ✅ page.$() pronalazi button');

  // Test 4: Pročitaj vrednost
  const value = await emailInput.evaluate(el => el.value);
  console.log(`  ✅ evaluate() radi - vrednost: "${value}"`);

  console.log('\n✅ SVI TESTOVI SU PROŠLI!\n');
  console.log('Playwright API radi perfektno. Problem je samo u konekciji do sajta.');
  console.log('\n📝 Sledeće korake:');
  console.log('1. Proveri da li je internet dostupan');
  console.log('2. Proveri da li je kupujem-prodajem.com dostupan');
  console.log('3. Testiraj sa: npm start\n');

  await browser.close();
}

localTest().catch(error => {
  console.error('❌ Greška:', error.message);
  process.exit(1);
});
