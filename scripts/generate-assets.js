// This script generates placeholder images for Expo
// Run: node scripts/generate-assets.js

const fs = require('fs');
const path = require('path');

// Simple 1x1 pixel PNG (transparent)
const transparentPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

// Simple 32x32 purple square PNG for icon placeholder
const iconPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAOklEQVR42mNgGAWjYBSMglEwCkbBKBgFo2AUjIJRMApGwSgYBaNgFIyCUTAKRsEoGAWjYBSMAgIAAP//DwAB/wGUcwAAAABJRU5ErkJggg==',
  'base64'
);

const assetsDir = path.join(__dirname, '..', 'assets');

// Ensure assets directory exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Create placeholder files
const files = {
  'icon.png': iconPng,
  'splash.png': iconPng,
  'adaptive-icon.png': iconPng,
  'favicon.png': iconPng,
};

Object.entries(files).forEach(([filename, content]) => {
  const filepath = path.join(assetsDir, filename);
  fs.writeFileSync(filepath, content);
  console.log(`Created: ${filename}`);
});

console.log('\\nPlaceholder assets created successfully!');
console.log('Replace these with your actual app icons and splash screen.');
