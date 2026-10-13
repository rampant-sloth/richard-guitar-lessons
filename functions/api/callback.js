// Cloudflare Pages Function — completes the GitHub OAuth flow for Decap CMS.
// Route: /api/callback
// GitHub redirects here with ?code=... after the user authorizes the app.

function renderBody(status, content) {
  return `<script>
    const receiveMessage = (message) => {
      window.opener.postMessage(
        'authorization:github:${status}:${JSON.stringify(content)}',
        message.origin
      );
      window.removeEventListener('message', receiveMessage, false);
    };
    window.addEventListener('message', receiveMessage, false);
    window.opener.postMessage('authorizing:github', '*');
  </script>`;
}

export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return new Response(renderBody('error', { error: error || 'missing_code' }), {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  const clientId = context.env.GITHUB_OAUTH_CLIENT_ID || 'Ov23li6duCdaQWAPpend';
  const clientSecret = context.env.GITHUB_OAUTH_CLIENT_SECRET;

  if (!clientSecret) {
    return new Response(renderBody('error', { error: 'GITHUB_OAUTH_CLIENT_SECRET is not configured' }), {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const data = await tokenResponse.json();

    if (data.error) {
      return new Response(renderBody('error', { error: data.error }), {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    return new Response(renderBody('success', { token: data.access_token, provider: 'github' }), {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (err) {
    return new Response(renderBody('error', { error: String((err && err.message) || err) }), {
      headers: { 'Content-Type': 'text/html' },
    });
  }
}
