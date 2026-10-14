// Cloudflare Worker — GitHub OAuth gateway for Decap CMS.
// Routes:  GET /auth   -> start the OAuth flow
//          GET /callback -> exchange the code for a token and hand it back to the admin UI
//
// One Worker serves every environment (production, develop, local preview) because the
// callback does the two-stage postMessage handshake against the admin window's origin.

const AUTHORIZE = 'https://github.com/login/oauth/authorize';
const ACCESS_TOKEN = 'https://github.com/login/oauth/access_token';

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === '/auth') return auth(request, env);
    if (pathname === '/callback') return callback(request, env);
    if (pathname === '/') return new Response('Decap CMS OAuth gateway. Use /auth and /callback.', { status: 200 });
    return new Response('Not found', { status: 404 });
  },
};

function auth(request, env) {
  const u = new URL(request.url);
  const params = new URLSearchParams({
    client_id: env.GITHUB_OAUTH_CLIENT_ID,
    scope: env.GITHUB_OAUTH_SCOPE || 'repo,user',
    redirect_uri: `${u.origin}/callback`,
  });
  return Response.redirect(`${AUTHORIZE}?${params.toString()}`, 302);
}

async function callback(request, env) {
  const u = new URL(request.url);
  const code = u.searchParams.get('code');
  const error = u.searchParams.get('error');

  if (error || !code) {
    return page(render('error', { error: error || 'missing_code' }));
  }
  if (!env.GITHUB_OAUTH_CLIENT_SECRET) {
    return page(render('error', { error: 'GITHUB_OAUTH_CLIENT_SECRET is not configured' }));
  }

  try {
    const res = await fetch(ACCESS_TOKEN, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        client_id: env.GITHUB_OAUTH_CLIENT_ID,
        client_secret: env.GITHUB_OAUTH_CLIENT_SECRET,
        code,
        redirect_uri: `${u.origin}/callback`,
      }),
    });

    const data = await res.json();
    if (data.error) return page(render('error', { error: data.error }));

    return page(render('success', { token: data.access_token, provider: 'github' }));
  } catch (err) {
    return page(render('error', { error: String((err && err.message) || err) }));
  }
}

const page = (body) =>
  new Response(`<!doctype html><html><body>${body}</body></html>`, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });

// The two-stage postMessage handshake Decap CMS expects from an OAuth gateway.
function render(status, content) {
  return `<script>
    (function () {
      var receiveMessage = function (message) {
        window.opener.postMessage(
          'authorization:github:${status}:${JSON.stringify(content)}',
          message.origin
        );
        window.removeEventListener('message', receiveMessage, false);
      };
      window.addEventListener('message', receiveMessage, false);
      window.opener.postMessage('authorizing:github', '*');
    })();
  </script>`;
}
