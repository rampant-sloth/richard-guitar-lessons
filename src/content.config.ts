import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    youtubeId: z.string().optional(),
  }),
});

const lessons = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/lessons' }),
  schema: z.object({
    title: z.string(),
    instrument: z.enum(['Guitar', 'Bass', 'Ukulele']),
    audience: z.enum(['Kids', 'Adults', 'Everyone']),
    durationMinutes: z.number(),
    price: z.number(),
    summary: z.string(),
    calLink: z.string().optional(),
    order: z.number().default(0),
  }),
});

const site = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/site' }),
  schema: z.object({
    siteTitle: z.string(),
    tagline: z.string(),
    contactEmail: z.string(),
    platforms: z.string(),
    heroTitle: z.string(),
    heroIntro: z.string(),
    heroImage: z.string().optional(),
    aboutImage: z.string().optional(),
  }),
});

export const collections = { news, lessons, site };

