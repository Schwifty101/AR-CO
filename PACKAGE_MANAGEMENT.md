# Package Management Guide

## Overview

AR-CO uses **pnpm** as the sole package manager across the entire monorepo. This ensures consistency, faster installs, and better disk space efficiency.

## Why pnpm?

- **Fast**: 3x faster than npm, efficient caching
- **Disk efficient**: Hard links save space across projects
- **Strict**: Better dependency resolution
- **Monorepo native**: Built-in workspace support

## Enforced Usage

The project enforces pnpm through multiple mechanisms:

1. **`package.json`**: Specifies `"packageManager": "pnpm@10.28.1"`
2. **`.npmrc`**: Configures pnpm behavior and enables `engine-strict`
3. **`preinstall` script**: Blocks npm/yarn via `only-allow pnpm`
4. **Vercel config**: Uses `pnpm install --frozen-lockfile`
5. **Railway config**: Uses `pnpm install --frozen-lockfile`

## Installation

### First Time Setup

```bash
# Install pnpm globally (if not already installed)
npm install -g pnpm

# Or use corepack (recommended)
corepack enable
corepack prepare pnpm@10.28.1 --activate

# Install all dependencies
pnpm install
```

### Adding Dependencies

```bash
# Add to root (shared dev dependencies)
pnpm add -D <package> -w

# Add to web app
pnpm add <package> --filter web

# Add to api
pnpm add <package> --filter api

# Add to shared ui package
pnpm add <package> --filter ui
```

### Removing Dependencies

```bash
# Remove from specific workspace
pnpm remove <package> --filter web

# Remove from root
pnpm remove <package> -w
```

## Common Commands

```bash
# Install all dependencies
pnpm install

# Install with frozen lockfile (CI/CD)
pnpm install --frozen-lockfile

# Run dev servers (both web and api)
pnpm dev

# Build all apps
pnpm build

# Lint all apps
pnpm lint

# Update dependencies
pnpm update

# Check outdated packages
pnpm outdated
```

## Workspace Commands

```bash
# Run command in specific workspace
pnpm --filter web dev
pnpm --filter api dev

# Run command in all workspaces
pnpm -r build

# Add dependency to multiple workspaces
pnpm add <package> --filter web --filter api
```

## Troubleshooting

### "ERR_PNPM_NO_MATCHING_VERSION"

```bash
# Clear pnpm cache
pnpm store prune

# Delete node_modules and reinstall
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
```

### "Peer dependency issues"

The `.npmrc` file is configured with `auto-install-peers=true` and `strict-peer-dependencies=false` to handle peer dependencies gracefully.

### "Package not found"

Ensure you're running commands from the monorepo root, not from individual app directories.

## CI/CD Configuration

### Vercel (Web App)

```json
{
  "installCommand": "pnpm install --frozen-lockfile",
  "buildCommand": "pnpm turbo run build --filter=my-v0-project"
}
```

### Railway (API)

```toml
[build]
buildCommand = "pnpm install --frozen-lockfile && pnpm --filter api build"
```

## Migration Notes

This project previously had mixed usage of npm and pnpm. All configurations have been unified to use pnpm exclusively:

- ✅ Root `package.json` uses pnpm
- ✅ All Vercel configs use pnpm
- ✅ Railway config uses pnpm
- ✅ Documentation updated to pnpm
- ✅ `.npmrc` enforces pnpm
- ✅ `preinstall` script blocks npm/yarn

## Best Practices

1. **Always run from root**: `pnpm install` at root level, not in subdirectories
2. **Use filters**: Target specific workspaces with `--filter`
3. **Frozen lockfile in CI**: Always use `--frozen-lockfile` in CI/CD
4. **Update regularly**: Run `pnpm update` periodically
5. **Check compatibility**: Verify `engines.node` matches your Node version

## Support

- [pnpm Documentation](https://pnpm.io)
- [pnpm Workspace Guide](https://pnpm.io/workspaces)
- [Turborepo with pnpm](https://turbo.build/repo/docs/handbook/package-installation#pnpm)
