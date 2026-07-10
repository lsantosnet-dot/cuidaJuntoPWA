/**
 * App metadata derived at build time.
 *
 * APP_VERSION mirrors the `version` field in package.json (injected by Vite via
 * `define`). Keep package.json as the single source of truth — bump it there and
 * the value shown in the side drawer updates automatically on the next build.
 */
export const APP_VERSION = __APP_VERSION__
