// Vercel bundles the Express API as one serverless function. The React build is
// emitted to /public and served directly by Vercel's CDN.
export { default } from './server/src/index.js';
