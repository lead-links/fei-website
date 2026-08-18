import type { Loader } from 'astro/loaders';

/**
 * Astro Content Layer loader for the FEI headless-WordPress blog.
 * Fetches all published posts at BUILD time via WPGraphQL, including the
 * Rank Math `seo` field (wp-graphql-rank-math). Cursor-paginated.
 *
 * IMPORTANT: no `status` ARGUMENT in the query — WPGraphQL treats it as a
 * permission-gated arg and returns EMPTY for unauthenticated (build-time)
 * requests. Unauthenticated reads already return published posts only; we
 * additionally SELECT `status` and filter on it below, so a WP-side auth or
 * plugin change can never silently start publishing drafts to the live site.
 *
 * Posts deleted or unpublished in WP disappear from the site on the next
 * deploy: `store.clear()` below drops the whole collection before repopulating,
 * and the Docker build produces a fresh `dist` (Dockerfile copies only
 * /app/dist), so their pages, sitemap entries and category counts all go with
 * them. Their URLs then 404 — add nginx redirects for any that had traffic.
 */
const QUERY = `query FeiPosts($after: String) {
  posts(first: 20, after: $after) {
    pageInfo { hasNextPage endCursor }
    nodes {
      databaseId
      status
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

// Production origin the blog is actually served from. Rank Math returns SEO
// URLs (canonical, JSON-LD @id/url, in-body links) pointing at the headless WP
// origin — if we ship those verbatim they tell Google/AI crawlers the
// authoritative copy lives on the staging domain, de-indexing fei.edu. Rewrite
// the WP origin to this, and collapse WP's /blog/<category>/<slug>/ permalink
// to our flat /blog/<slug>.
const PROD_ORIGIN = 'https://fei.edu';

export function wpBlogLoader(endpoint: string): Loader {
  const wpOrigin = new URL(endpoint).origin;
  const deWp = (s: string | null): string | null => {
    if (!s) return s;
    return s
      .split(wpOrigin).join(PROD_ORIGIN)
      .split('/blog/uncategorized/').join('/blog/');
  };

  // Rank Math's `jsonLd.raw` returns the FULL <script type="application/ld+json">
  // wrapper, not bare JSON. The page wraps it again → nested, invalid schema.
  // Unwrap to the inner JSON, host-rewrite it, and drop it entirely if it won't
  // parse (never ship broken structured data).
  const cleanJsonLd = (raw: string | null): string | null => {
    if (!raw) return null;
    let s = deWp(raw)!;
    const m = s.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    if (m) s = m[1];
    s = s.trim();
    try { JSON.parse(s); } catch { return null; }
    return s;
  };

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

      // Belt-and-braces status filter. Unauthenticated WPGraphQL already returns
      // published posts only, so this normally drops nothing — it exists so that
      // if WP ever starts returning drafts/pending/private (auth change, plugin
      // change, a future authenticated build), they still never reach the site.
      const published = nodes.filter((p: any) => !p.status || p.status === 'publish');
      const skipped = nodes.length - published.length;
      if (skipped > 0) {
        const bad = nodes.filter((p: any) => p.status && p.status !== 'publish');
        logger.warn(
          `WP blog: skipping ${skipped} non-published post(s): ` +
          bad.map((p: any) => `${p.slug} (${p.status})`).join(', ')
        );
      }

      // Never publish an empty blog (a flaky WP response should fail loudly,
      // not silently wipe the collection).
      if (published.length === 0) {
        throw new Error('WP blog: 0 published posts returned — refusing to build an empty blog.');
      }

      // Guard against a PARTIAL WP failure silently deleting live posts. The
      // 0-post check above can't catch "returned 1 of 4 because a plugin broke",
      // which is indistinguishable from a legitimate deletion. Set WP_MIN_POSTS
      // in the deploy environment to the count you expect to never fall below;
      // when posts are deliberately removed, lower it in the same commit.
      const floor = Number(import.meta.env.WP_MIN_POSTS ?? process.env.WP_MIN_POSTS ?? 0);
      if (floor > 0 && published.length < floor) {
        throw new Error(
          `WP blog: only ${published.length} published post(s), expected at least ${floor} ` +
          `(WP_MIN_POSTS). Refusing to build — this would delete live posts. ` +
          `If the removal is intentional, lower WP_MIN_POSTS.`
        );
      }

      store.clear();
      for (const p of published) {
        const mapped = {
          databaseId: p.databaseId,
          slug: p.slug,
          title: p.title,
          excerptHtml: deWp(p.excerpt ?? '') ?? '',
          contentHtml: deWp(p.content ?? '') ?? '',
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
            canonicalUrl: deWp(p.seo?.canonicalUrl ?? null),
            jsonLd: cleanJsonLd(p.seo?.jsonLd?.raw ?? null),
          },
        };
        const data = await parseData({ id: p.slug, data: mapped });
        store.set({ id: p.slug, data });
      }

      // Log the slug list, not just a count: this is the only record in the
      // deploy output of exactly which posts the site shipped with, so a
      // disappearance is diagnosable after the fact.
      logger.info(
        `WP blog: loaded ${published.length} published post(s): ` +
        published.map((p: any) => p.slug).join(', ')
      );
    },
  };
}
