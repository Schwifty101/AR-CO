# AR&CO Assets Documentation

This document describes the organization and usage of assets in the AR&CO project.

## Directory Structure

```
public/
├── assets/
│   ├── business-cards/       # Web-ready business card images
│   │   ├── card-front.webp
│   │   ├── card-back.webp
│   │   ├── card-front.png
│   │   ├── card-back.png
│   │   └── mockup.jpeg
│   ├── logos/                # AR&CO logo variants
│   │   ├── main-logo.svg     # Primary logo (vector)
│   │   ├── main-logo.webp    # Primary logo (raster)
│   │   ├── logo-variant-2.webp
│   │   ├── logo-variant-3.webp
│   │   └── logo-variant-4.webp
│   ├── design-files/         # Source design files (not deployed)
│   │   ├── Business Card/    # Adobe Illustrator, EPS files
│   │   ├── Favicon/          # Favicon source files
│   │   ├── logo/             # Logo source files
│   │   └── Letter Head/      # Letterhead templates
│   └── favicon.png           # Favicon (32x32)
├── client-logos/             # Client company logos
├── banner/                   # Hero banner frames
├── practic-areas/            # Practice area images
├── fonts/                    # Custom web fonts
├── favicon.ico               # Browser favicon
├── apple-icon.png            # iOS home screen icon
└── manifest.json             # PWA manifest
```

## Asset Usage Guidelines

### Logos

**Primary Logo:** Use `assets/logos/main-logo.svg` for most applications

- Vector format scales perfectly at any size
- Use in headers, footers, and promotional materials

**Raster Logos:** Use webp variants when SVG is not supported

- `main-logo.webp` - Standard raster version
- Other variants available for specific use cases

**Import in React components:**

```tsx
import Image from "next/image";

<Image
  src="/assets/logos/main-logo.svg"
  alt="AR&CO Law Associates"
  width={200}
  height={80}
/>;
```

### Business Cards

Located in `assets/business-cards/`:

- `card-front.webp` - Front design (optimized)
- `card-back.webp` - Back design (optimized)
- PNG versions available for compatibility
- `mockup.jpeg` - Visual mockup for presentation

### Favicons

**Browser Favicon:** `/favicon.ico` (placed in app directory for Next.js)

- Automatically detected by browsers
- 32x32 ICO format

**Apple Touch Icon:** `/apple-icon.png`

- 180x180 PNG format
- Used when users add site to iOS home screen

**PNG Favicon:** `/assets/favicon.png`

- 32x32 PNG format
- Modern browsers

All favicon metadata is configured in `app/layout.tsx`.

### Client Logos

Located in `/client-logos/`:

- Grayscale filter applied in Hero component
- Format: PNG with transparent backgrounds
- Usage: Trusted client showcase carousel

### Banner Frames

Located in `/banner/frames/`:

- 772 frames for scroll-based video animation
- Format: JPG (Web%20image%20XXXXX.jpg)
- Used in Hero component with canvas rendering

## Design Files

The `assets/design-files/` directory contains source files:

- Adobe Illustrator (.ai)
- Encapsulated PostScript (.eps)
- Adobe PDF (.pdf)
- Microsoft Word (.docx)

**Important:** These files are excluded from git via `.gitignore` due to their large size.

- Design team should maintain these files in a separate design repository or cloud storage
- Only web-ready formats (.svg, .png, .webp, .ico) are committed to git

## Performance Optimization

### Recommended Image Formats

1. **SVG** - For logos, icons, simple graphics (scalable, small file size)
2. **WebP** - For photos and complex images (better compression than PNG/JPG)
3. **PNG** - For images requiring transparency (fallback when WebP not supported)
4. **JPG** - For photos without transparency (smaller than PNG)
5. **ICO** - For favicons only

### Next.js Image Optimization

All images should use Next.js `<Image>` component for:

- Automatic lazy loading
- Responsive images
- Format conversion (WebP)
- Size optimization

```tsx
import Image from "next/image";

<Image
  src="/assets/logos/main-logo.svg"
  alt="AR&CO"
  width={200}
  height={80}
  priority // Use for above-the-fold images
/>;
```

## Adding New Assets

### 1. Business Assets (Logos, Cards, Letterheads)

- Add web-ready formats to appropriate `assets/` subdirectory
- Keep source files in `assets/design-files/` (not committed to git)
- Update this documentation

### 2. Content Images (Practice Areas, Team Photos)

- Place in relevant subdirectory (`practic-areas/`, `team/`, etc.)
- Optimize before adding (use WebP format)
- Use descriptive filenames (lowercase-with-hyphens.webp)

### 3. Icon Sets

- Use Lucide React icon library (already installed)
- Only add custom icons if not available in Lucide
- Place custom icons in `assets/icons/`

## Metadata & SEO

Favicon and Open Graph images are configured in `app/layout.tsx`:

- Site metadata (title, description, keywords)
- Open Graph tags (social media sharing)
- Twitter card configuration
- Favicon links
- PWA manifest

Update `app/layout.tsx` and `manifest.json` when changing branding assets.

## Maintenance

**Monthly:**

- Review asset usage with analytics
- Remove unused images
- Re-optimize large images

**Before Deployment:**

- Run `pnpm build` to test asset loading
- Check favicon display in multiple browsers
- Verify Open Graph images display correctly when sharing

## Questions?

Contact the development team for asset-related questions or to add new design files.
