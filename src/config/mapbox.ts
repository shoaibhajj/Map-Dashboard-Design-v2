/**
 * Mapbox GL JS Access Token
 *
 * Sign up / log in at https://account.mapbox.com, go to Access Tokens,
 * and paste your public default token below — OR set VITE_MAPBOX_TOKEN in .env.
 *
 * The free tier covers 50,000 map loads/month, more than enough for dev.
 */
export const MAPBOX_TOKEN: string =
  (import.meta.env.VITE_MAPBOX_TOKEN as string) ||
  ' '
