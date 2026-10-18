import sharp from 'sharp';
await sharp('public/social.svg').resize(1200, 630).png().toFile('public/social.png');
await sharp('public/logo-mark.svg')
  .resize(156, 118)
  .extend({ top: 31, bottom: 31, left: 12, right: 12, background: '#fafcfc' })
  .png()
  .toFile('public/apple-touch-icon.png');
console.log('Generated social.png (1200×630) and apple-touch-icon.png (180×180).');
