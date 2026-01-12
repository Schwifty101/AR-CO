# AR-CO

Turborepo SaaS Monorepo with Next.js and NestJS

## What's inside?

This Turborepo includes the following packages/apps:

### Apps

- `apps/web`: Next.js 14+ app with TypeScript and Tailwind CSS (runs on port 3000)
- `apps/api`: NestJS API with TypeScript (runs on port 4000)

### Packages

- `packages/ui`: Shared React UI components

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm (installed automatically via `packageManager` field)

### Installation

```bash
pnpm install
```

### Development

Run all apps in development mode:

```bash
pnpm dev
```

This will start:
- Next.js web app on http://localhost:3000
- NestJS API on http://localhost:4000

The Next.js app is configured to proxy API requests from `/api/*` to the NestJS backend.

### Build

Build all apps:

```bash
pnpm build
```

### Testing the Setup

1. Visit http://localhost:3000 to see the Next.js app
2. The app fetches data from `/api/hello` which is proxied to http://localhost:4000/api/hello
3. You should see "Hello from NestJS API on port 4000!" displayed on the page

## Project Structure

```
├── apps
│   ├── api/          # NestJS API
│   └── web/          # Next.js App
├── packages
│   └── ui/           # Shared UI components
├── turbo.json        # Turborepo configuration
├── pnpm-workspace.yaml
└── package.json
```
