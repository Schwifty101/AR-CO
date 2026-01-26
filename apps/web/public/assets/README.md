# AR&CO Assets Directory

This directory contains all organized assets for the AR&CO Law Firm website.

## Quick Reference

### Using Logos in Code

```tsx
import Image from 'next/image'

// Primary logo (SVG - recommended)
<Image
  src="/assets/logos/main-logo.svg"
  alt="AR&CO Law Associates"
  width={200}
  height={80}
/>

// Raster fallback
<Image
  src="/assets/logos/main-logo.webp"
  alt="AR&CO Law Associates"
  width={200}
  height={80}
/>
```

### Using Business Cards

```tsx
// Front card
<Image
  src="/assets/business-cards/card-front.webp"
  alt="AR&CO Business Card Front"
  width={600}
  height={400}
/>

// Back card
<Image
  src="/assets/business-cards/card-back.webp"
  alt="AR&CO Business Card Back"
  width={600}
  height={400}
/>
```

## Directory Structure

- **`business-cards/`** - Web-ready business card images (PNG, WebP)
- **`logos/`** - AR&CO logo variants (SVG, WebP)
- **`design-files/`** - Source design files (AI, EPS) - Not deployed to production
- **`favicon.png`** - Browser favicon (32x32)

## Important Notes

1. **Always use Next.js `<Image>` component** for automatic optimization
2. **Prefer SVG for logos** - they scale perfectly at any size
3. **Use WebP for photos** - better compression than PNG/JPG
4. **Design files are not deployed** - They're excluded in `.gitignore`

## File Sizes

- Total assets directory: ~1.2GB (mostly design source files)
- Web-ready assets: ~50MB
- Design source files: ~1.15GB (not deployed)

For complete documentation, see `/public/ASSETS.md`.
