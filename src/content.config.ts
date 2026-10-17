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
    ebayUrl: z.string().optional(),
    social: z
      .object({
        facebook: z.string().optional(),
        instagram: z.string().optional(),
        tiktok: z.string().optional(),
        twitch: z.string().optional(),
        whatsapp: z.string().optional(),
        youtube: z.string().optional(),
      })
      .optional(),
  }),
});

const optionalColour = z.string().optional();

// Image position is only meaningful when an image is set, so it is never required in the
// CMS. An untouched field arrives as '' — anything unexpected falls back to 'right'.
const imagePosition = z.preprocess(
  (value) => (value === 'left' || value === 'centre' || value === 'right' ? value : 'right'),
  z.enum(['right', 'left', 'centre'])
);

const theme = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/theme' }),
  schema: z.object({
    colourScheme: z.enum(['emerald', 'teal', 'blue', 'indigo', 'violet', 'rose', 'amber', 'slate']),
    accent: z
      .object({ main: optionalColour, hover: optionalColour, light: optionalColour, pale: optionalColour })
      .default({}),
    light: z
      .object({
        background: optionalColour,
        surface: optionalColour,
        band: optionalColour,
        text: optionalColour,
        muted: optionalColour,
        border: optionalColour,
      })
      .default({}),
    dark: z
      .object({
        background: optionalColour,
        surface: optionalColour,
        band: optionalColour,
        text: optionalColour,
        muted: optionalColour,
        border: optionalColour,
      })
      .default({}),
    appearance: z
      .object({
        showToggle: z.boolean().default(true),
        defaultMode: z.enum(['auto', 'light', 'dark']).default('auto'),
        toggleLightLabel: optionalColour,
        toggleDarkLabel: optionalColour,
      })
      .default({}),
    cornerRadius: z.enum(['sharp', 'subtle', 'rounded', 'pill']).default('rounded'),
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
      imagePosition,
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
          layout: z.enum(['cards', 'list', 'articles', 'alternate', 'gallery', 'videos', 'lessons', 'markdown']),
          key: z.string().optional(),
          heading: z.string().optional(),
          intro: z.string().optional(),
          body: z.string().optional(),
          background: z.enum(['white', 'gray', 'emerald', 'dark']).default('white'),
          backgroundImage: z.string().optional(),
          image: z.string().optional(),
          imageAlt: z.string().optional(),
          imagePosition,
          items: z
            .array(
              z.object({
                icon: z.string().optional(),
                image: z.string().optional(),
                imageAlt: z.string().optional(),
                title: z.string().optional(),
                text: z.string().optional(),
                href: z.string().optional(),
                linkLabel: z.string().optional(),
                youtubeId: z.string().optional(),
                format: z.enum(['standard', 'short']).default('standard').optional(),
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
    labels: z
      .object({
        readMore: z.string().optional(),
        backToHome: z.string().optional(),
        empty: z.string().optional(),
      })
      .optional(),
    form: z
      .object({
        action: z.string().default('https://formspree.io/f/xnpjgokn'),
        subject: z.string().default('New website enquiry'),
        heading: z.string(),
        intro: z.string().optional(),
        submitLabel: z.string().default('Send'),
        fields: z
          .array(
            z.object({
              label: z.string(),
              name: z.string(),
              type: z.enum(['text', 'email', 'tel', 'textarea']).default('text'),
              placeholder: z.string().optional(),
              required: z.boolean().default(false),
              width: z.enum(['half', 'full']).default('half'),
              options: z.array(z.string()).default([]),
            })
          )
          .default([]),
      })
      .optional(),
  }),
});

const tabs = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/tabs' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    instrument: z.enum(['Guitar', 'Bass', 'Ukulele']),
    difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
    image: z.string().optional(),
    file: z.string().optional(),
    youtubeId: z.string().optional(),
    date: z.coerce.date(),
    order: z.number().default(0),
  }),
});

export const collections = { news, lessons, site, theme, pages, tabs };

