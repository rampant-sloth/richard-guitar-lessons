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
    aboutImage: z.string().optional(),
  }),
});

const theme = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/theme' }),
  schema: z.object({
    colourScheme: z.enum(['emerald', 'teal', 'blue', 'indigo', 'violet', 'rose', 'amber', 'slate']),
    fontHeading: z.enum(['system', 'inter', 'poppins', 'nunito', 'lora', 'merriweather']),
    fontBody: z.enum(['system', 'inter', 'poppins', 'nunito', 'lora', 'merriweather']),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/pages' }),
  schema: z.object({
    seo: z.object({
      title: z.string(),
      description: z.string(),
      ogTitle: z.string().optional(),
      ogDescription: z.string().optional(),
    }),
    hero: z.object({
      eyebrow: z.string().optional(),
      title: z.string(),
      intro: z.string().optional(),
      image: z.string().optional(),
      imageAlt: z.string().optional(),
      backgroundImage: z.string().optional(),
      buttons: z
        .array(
          z.object({
            label: z.string(),
            href: z.string(),
            variant: z.enum(['primary', 'secondary']).default('primary'),
          })
        )
        .default([]),
    }),
    sections: z
      .array(
        z.object({
          layout: z.enum(['cards', 'list', 'articles', 'videos', 'lessons', 'markdown']),
          key: z.string().optional(),
          heading: z.string().optional(),
          intro: z.string().optional(),
          body: z.string().optional(),
          background: z.enum(['white', 'gray', 'emerald', 'dark']).default('white'),
          backgroundImage: z.string().optional(),
          image: z.string().optional(),
          imageAlt: z.string().optional(),
          items: z
            .array(
              z.object({
                icon: z.string().optional(),
                title: z.string().optional(),
                text: z.string().optional(),
                href: z.string().optional(),
                linkLabel: z.string().optional(),
                youtubeId: z.string().optional(),
                caption: z.string().optional(),
              })
            )
            .default([]),
        })
      )
      .default([]),
    cta: z
      .object({
        heading: z.string(),
        body: z.string().optional(),
        buttonLabel: z.string().optional(),
        buttonHref: z.string().default('/book-trial-lesson'),
        backgroundImage: z.string().optional(),
      })
      .optional(),
  }),
});

export const collections = { news, lessons, site, theme, pages };

