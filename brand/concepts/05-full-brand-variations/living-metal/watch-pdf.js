#!/usr/bin/env node

/**
 * Watch for file changes and auto-regenerate PDF
 * Usage: node watch-pdf.js
 *
 * Watches guide-warm.html, card-swirl-warm.svg, and other assets
 * Auto-regenerates PDF when any file changes
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const FILES_TO_WATCH = [
  'guide-warm.html',
  'card-swirl-warm.svg',
  'material-contours-warm.svg',
  'biomorphic-hero-redteam-ember.png'
].map(f => path.join(__dirname, f));

console.log('👀 Watching for changes...');
console.log('📁 Files being watched:');
FILES_TO_WATCH.forEach(f => console.log(`   - ${path.basename(f)}`));
console.log('\nPress Ctrl+C to stop\n');

let lastModifications = {};
FILES_TO_WATCH.forEach(file => {
  lastModifications[file] = fs.statSync(file).mtimeMs;
});

function checkForChanges() {
  let changed = false;
  FILES_TO_WATCH.forEach(file => {
    try {
      const currentMtime = fs.statSync(file).mtimeMs;
      if (currentMtime !== lastModifications[file]) {
        console.log(`\n📝 File changed: ${path.basename(file)}`);
        lastModifications[file] = currentMtime;
        changed = true;
      }
    } catch (err) {
      // File might not exist yet, ignore
    }
  });

  if (changed) {
    console.log('🔄 Regenerating PDF...');
    try {
      execSync('node generate-pdf.js', { cwd: __dirname });
      console.log('✅ PDF updated!\n');
    } catch (err) {
      console.error('❌ Error generating PDF:', err.message);
    }
  }
}

// Check every second
setInterval(checkForChanges, 1000);
