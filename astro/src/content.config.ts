import { defineCollection, z } from 'astro:content';
import { wpBlogLoader } from './loaders/wordpress';

const ENDPOINT =
  import.meta.env.WP_GRAPHQL_URL ||
  'https://lavenderblush-lapwing-604686.hostingersite.com/graphql';

const blog = defineCollection({
  loader: wpBlogLoader(ENDPOINT),
  schema: z.object({
    databaseId: z.number(),
    slug: z.string(),
    title: z.string(),
    excerptHtml: z.string(),
    contentHtml: z.string(),
    date: z.string(),
    modified: z.string(),
    author: z.string(),
    featuredImage: z
      .object({ url: z.string(), alt: z.string() })
      .nullable(),
    categories: z.array(z.object({ name: z.string(), slug: z.string() })),
    tags: z.array(z.object({ name: z.string(), slug: z.string() })),
    readingTime: z.number(),
    seo: z.object({
      title: z.string().nullable(),
      description: z.string().nullable(),
      canonicalUrl: z.string().nullable(),
      jsonLd: z.string().nullable(),
    }),
  }),
});

export const collections = { blog };
