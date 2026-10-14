// Generates public/admin/config.yml from cms/config.template.yml.
// The `branch` follows the Cloudflare Pages branch so the CMS always commits to the
// right place: `main` -> production, any other branch -> that branch's preview deploy.
//
// Env vars (set in Cloudflare Pages):
//   CF_PAGES_BRANCH        - set automatically by Cloudflare Pages
//   DECAP_OAUTH_BASE_URL   - your deployed Worker URL, e.g. https://decap-oauth.abc.workers.dev
//   DECAP_BRANCH           - manual override for local dev (optional)

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const branch = process.env.DECAP_BRANCH || process.env.CF_PAGES_BRANCH || 'main';
const oauthBase = process.env.DECAP_OAUTH_BASE_URL || 'https://decap-oauth.<your-account>.workers.dev';

const out = readFileSync('cms/config.template.yml', 'utf8')
  .replaceAll('__BRANCH__', branch)
  .replaceAll('__OAUTH_BASE_URL__', oauthBase);

mkdirSync('public/admin', { recursive: true });
writeFileSync('public/admin/config.yml', out);

console.log(`[cms] public/admin/config.yml → branch=${branch}, oauth=${oauthBase}`);
if (oauthBase.includes('<your-account>')) {
  console.warn('[cms] ⚠ Set DECAP_OAUTH_BASE_URL to your real Worker URL before deploying.');
}
