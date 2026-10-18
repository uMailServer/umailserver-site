import sharp from 'sharp';
import { copyFile } from 'node:fs/promises';
await sharp('public/social.svg').resize(1200, 630).png().toFile('public/social.png');
await copyFile('public/social.png', 'public/og.png');
await sharp('public/logo-mark.svg')
  .resize(156, 118)
  .extend({ top: 31, bottom: 31, left: 12, right: 12, background: '#fafcfc' })
  .png()
  .toFile('public/apple-touch-icon.png');
console.log('Generated og.png / social.png (1200×630) and apple-touch-icon.png (180×180).');
