/**
 * Build absolute internal API URLs for server-side fetches.
 * This keeps server components on the same /api proxy path used by client fetches.
 */
function getAppOrigin(): string {
  const rawOrigin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    'http://localhost:3000';

  const withProtocol = rawOrigin.startsWith('http')
    ? rawOrigin
    : `https://${rawOrigin}`;

  return withProtocol.replace(/\/+$/, '');
}

export function buildInternalApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getAppOrigin()}${normalizedPath}`;
}
