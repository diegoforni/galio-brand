#!/usr/bin/env node

/**
 * Auto-generate PDF from HTML guide
 * Usage: node generate-pdf.js
 *
 * This script generates Galio-Living-Metal-Red-Team-Guide.pdf
 * from guide-warm.html using Puppeteer for accurate rendering.
 */

const fs = require('fs');
const path = require('path');

const HTML_FILE = path.join(__dirname, 'guide-warm.html');
const PDF_FILE = path.join(__dirname, 'Galio-Living-Metal-Red-Team-Guide.pdf');

async function generatePDF() {
  console.log('📄 Generating PDF from HTML...');

  // Check if puppeteer is installed
  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch (err) {
    console.error('❌ Puppeteer not found. Installing...');
    const { execSync } = require('child_process');
    try {
      execSync('npm install puppeteer', { cwd: __dirname, stdio: 'inherit' });
      puppeteer = require('puppeteer');
    } catch (installErr) {
      console.error('❌ Failed to install puppeteer. Please run: npm install puppeteer');
      process.exit(1);
    }
  }

  // Check if HTML exists
  if (!fs.existsSync(HTML_FILE)) {
    console.error(`❌ HTML file not found: ${HTML_FILE}`);
    process.exit(1);
  }

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      executablePath: '/usr/bin/google-chrome-stable',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    const page = await browser.newPage();

    // Load the HTML file
    const htmlUrl = `file://${HTML_FILE}`;
    await page.goto(htmlUrl, { waitUntil: 'networkidle0' });

    // Generate PDF with print settings
    await page.pdf({
      path: PDF_FILE,
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0'
      }
    });

    await browser.close();

    const stats = fs.statSync(PDF_FILE);
    console.log(`✅ PDF generated successfully!`);
    console.log(`📁 ${PDF_FILE}`);
    console.log(`📊 Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  } catch (err) {
    console.error('❌ Error generating PDF:', err.message);
    process.exit(1);
  }
}

generatePDF();
