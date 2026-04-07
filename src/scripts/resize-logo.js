const sharp = require('sharp');
const path = require('path');

const input = path.join(__dirname, '../../public/ProLx_withoutBackground.png');
const output192 = path.join(__dirname, '../../public/icon-192x192.png');
const output512 = path.join(__dirname, '../../public/icon-512x512.png');

async function resize() {
  try {
    await sharp(input)
      .resize(192, 192, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toFile(output192);
    console.log('Generated 192x192 icon');

    await sharp(input)
      .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toFile(output512);
    console.log('Generated 512x512 icon');
  } catch (err) {
    console.error('Error resizing logo:', err);
  }
}

resize();
