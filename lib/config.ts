/**
 * App config from environment variables.
 * Use these instead of hardcoding URLs/keys.
 */
export function getBackendUrl(): string {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!url) {
    throw new Error('NEXT_PUBLIC_BACKEND_URL is not set');
  }
  return url.replace(/\/$/, ''); // trim trailing slash
}
