import fs from 'fs';
import path from 'path';

async function generate() {
  try {
    const sharp = (await import('sharp')).default;
    const publicDir = process.cwd() + '/public';
    // Use the main logo to prevent distortion
    const iconSource = publicDir + '/assets/logos/main-logo.png';
    const socialSource = publicDir + '/our_team/Group_photo.webp';

    const transparent = { r: 255, g: 255, b: 255, alpha: 0 };
    const white = { r: 255, g: 255, b: 255, alpha: 1 };

    console.log('Generating Favicons...');
    await sharp(iconSource).resize(16, 16, { fit: 'contain', background: transparent }).toFile(publicDir + '/favicon-16x16.png');
    await sharp(iconSource).resize(32, 32, { fit: 'contain', background: transparent }).toFile(publicDir + '/favicon-32x32.png');
    await sharp(iconSource).resize(48, 48, { fit: 'contain', background: transparent }).toFile(publicDir + '/favicon-48x48.png');

    console.log('Generating Apple Touch Icon...');
    await sharp(iconSource).resize(180, 180, { fit: 'contain', background: white }).flatten({ background: '#ffffff' }).toFile(publicDir + '/apple-touch-icon.png');

    console.log('Generating Android Icons...');
    await sharp(iconSource).resize(192, 192, { fit: 'contain', background: transparent }).toFile(publicDir + '/android-chrome-192x192.png');
    await sharp(iconSource).resize(512, 512, { fit: 'contain', background: transparent }).toFile(publicDir + '/android-chrome-512x512.png');

    console.log('Generating Social Sharing Images...');
    await sharp(socialSource).resize(1200, 630, { fit: 'cover', position: 'center' }).toFormat('jpeg').jpeg({ quality: 85 }).toFile(publicDir + '/og-image.jpg');
    await sharp(socialSource).resize(1200, 628, { fit: 'cover', position: 'center' }).toFormat('jpeg').jpeg({ quality: 85 }).toFile(publicDir + '/twitter-image.jpg');

    console.log('SUCCESS');
  } catch (err) {
    if (err.code === 'ERR_MODULE_NOT_FOUND' || err.message.includes('sharp')) {
       console.error('SHARP_MISSING');
       process.exit(2);
    }
    console.error('FAILED:', err);
    process.exit(1);
  }
}

generate();
