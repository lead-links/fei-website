import type { Loader } from 'astro/loaders';

/**
 * Astro Content Layer loader for the FEI headless-WordPress blog.
 * Fetches all published posts at BUILD time via WPGraphQL, including the
 * Rank Math `seo` field (wp-graphql-rank-math). Cursor-paginated.
 *
 * IMPORTANT: no `status` filter in the query — WPGraphQL treats a status
 * arg as a permission-gated field and returns EMPTY for unauthenticated
 * (build-time) requests. Without it, only published posts are returned.
 */
const QUERY = `query FeiPosts($after: String) {
  posts(first: 20, after: $after) {
    pageInfo { hasNextPage endCursor }
    nodes {
      databaseId
      slug
      title
      excerpt
      content
      date
      modified
      author { node { name } }
      featuredImage { node { sourceUrl altText } }
      categories { nodes { name slug } }
      tags { nodes { name slug } }
      seo {
        title
        description
        canonicalUrl
        jsonLd { raw }
      }
    }
  }
}`;

export function wpBlogLoader(endpoint: string): Loader {
  return {
    name: 'wp-blog',
    async load({ store, logger, parseData }) {
      logger.info(`WP blog: fetching posts from ${endpoint}`);

      const nodes: any[] = [];
      let after: string | null = null;
      let hasNext = true;

      while (hasNext) {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ query: QUERY, variables: { after } }),
        });
        if (!res.ok) throw new Error(`WP GraphQL HTTP ${res.status}`);
        const json: any = await res.json();
        if (json.errors) throw new Error('WP GraphQL errors: ' + JSON.stringify(json.errors));

        const conn = json.data.posts;
        nodes.push(...conn.nodes);
        hasNext = conn.pageInfo.hasNextPage;
        after = conn.pageInfo.endCursor;
      }

      // Never publish an empty blog (a flaky WP response should fail loudly,
      // not silently wipe the collection).
      if (nodes.length === 0) {
        throw new Error('WP blog: 0 posts returned — refusing to build an empty blog.');
      }

      store.clear();
      for (const p of nodes) {
        const mapped = {
          databaseId: p.databaseId,
          slug: p.slug,
          title: p.title,
          excerptHtml: p.excerpt ?? '',
          contentHtml: p.content ?? '',
          date: p.date,
          modified: p.modified,
          author: p.author?.node?.name ?? 'FEI',
          featuredImage: p.featuredImage?.node
            ? { url: p.featuredImage.node.sourceUrl, alt: p.featuredImage.node.altText ?? '' }
            : null,
          categories: (p.categories?.nodes ?? []).map((c: any) => ({ name: c.name, slug: c.slug })),
          tags: (p.tags?.nodes ?? []).map((t: any) => ({ name: t.name, slug: t.slug })),
          readingTime: Math.max(1, Math.round((p.content ?? '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length / 200)),
          seo: {
            title: p.seo?.title ?? null,
            description: p.seo?.description ?? null,
            canonicalUrl: p.seo?.canonicalUrl ?? null,
            jsonLd: p.seo?.jsonLd?.raw ?? null,
          },
        };
        const data = await parseData({ id: p.slug, data: mapped });
        store.set({ id: p.slug, data });
      }

      logger.info(`WP blog: loaded ${nodes.length} posts`);
    },
  };
}
