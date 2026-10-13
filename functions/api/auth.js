// Cloudflare Pages Function — starts the GitHub OAuth flow for Decap CMS.
// Route: /api/auth
export async function onRequest(context) {
  // The client ID is public, so it's safe to ship as a fallback.
  const clientId = context.env.GITHUB_OAUTH_CLIENT_ID || 'Ov23li6duCdaQWAPpend';

  const scope = 'repo,user';
  const url = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&scope=${scope}`;

  return Response.redirect(url, 302);
}
