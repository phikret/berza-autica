#!/usr/bin/env node
/**
 * Debug skript - Pronađi elemente na dashboard-u
 * Korišćenje: node debug-dashboard.js
 */

import { chromium } from 'playwright';
import dotenv from 'dotenv';

dotenv.config();

const CONFIG = {
  email: process.env.KP_EMAIL,
  password: process.env.KP_PASSWORD,
  headless: false,
};

console.log('\n🔍 DEBUG - PRONALAŽENJE ELEMENATA NA DASHBOARD-U\n');

async function debugDashboard() {
  const browser = await chromium.launch({ headless: CONFIG.headless });
  const page = await browser.newPage();

  try {
    // Login
    console.log('[1/3] Prijavljivam se...');
    await page.goto('http://localhost:3000/auth/login', { 
      waitUntil: 'domcontentloaded', 
      timeout: 10000 
    });

    await page.waitForSelector('input[name="email"]', { timeout: 5000 });
    const emailInput = await page.$('input[name="email"]');
    const passwordInput = await page.$('input[name="password"]');
    const submitButton = await page.$('button[type="submit"]');

    await emailInput.fill(CONFIG.email);
    await passwordInput.fill(CONFIG.password);
    await submitButton.click();

    try {
      await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 });
    } catch (error) {
      // OK
    }
    await page.waitForTimeout(2000);
    console.log('✅ Uspešna prijava\n');

    // Kreni na dashboard
    console.log('[2/3] Odlazim na dashboard...');
    await page.goto('http://localhost:3000/seller/dashboard', {
      waitUntil: 'domcontentloaded',
      timeout: 10000,
    });
    await page.waitForTimeout(1500);
    console.log('✅ Dashboard učitan\n');

    // Pronađi elemente
    console.log('[3/3] Pronalazim elemente:\n');

    // Pronađi sve buttonse
    const buttons = await page.$$('button');
    console.log(`📍 Ukupno dugmadi: ${buttons.length}`);
    console.log('Tekst na dugmadi:');
    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      const text = await buttons[i].textContent();
      console.log(`   [${i}] "${text.trim()}"`);
    }

    // Pronađi link za novi proizvod
    const newProductBtn = await page.$('button:has-text("Novi proizvod")');
    if (newProductBtn) {
      console.log('\n✅ PRONAĐENO: button:has-text("Novi proizvod")');
    } else {
      console.log('\n❌ NIJE PRONAĐENO: button:has-text("Novi proizvod")');
    }

    // Pronađi sve links
    console.log('\n📍 Links na stranici:');
    const links = await page.$$('a');
    console.log(`Ukupno linkova: ${links.length}`);
    for (let i = 0; i < Math.min(links.length, 10); i++) {
      const text = await links[i].textContent();
      const href = await links[i].getAttribute('href');
      console.log(`   [${i}] "${text.trim()}" → ${href}`);
    }

    console.log('\n✅ Debug završen\n');
    console.log('Šta vidim:');
    console.log('- Tekst na dugmadi je napisan iznad');
    console.log('- Ako vidim "Novi proizvod" dugme, onda je selektor ok');
    console.log('- Ako ga nema, onda trebam da pronađem drugačiji selektor\n');

    // Ostani u browser-u da vidim šta se dešava
    console.log('Browser ostaje otvoren - pogledaj šta je na ekranu');
    console.log('Zatvori browser kada završiš sa pregledom\n');

  } catch (error) {
    console.error(`\n❌ GREŠKA: ${error.message}\n`);
    await browser.close();
    process.exit(1);
  }
}

debugDashboard();
