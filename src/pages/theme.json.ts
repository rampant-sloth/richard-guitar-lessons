import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// Emitted at build time so the Decap CMS preview panes can render pages using the
// deployed theme colours. Contains the theme settings only — no secrets.
export const GET: APIRoute = async () => {
  const [entry] = await getCollection('theme');
  return new Response(JSON.stringify(entry?.data ?? {}), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
