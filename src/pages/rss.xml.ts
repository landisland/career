import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE, WRITING } from "@consts";

type Context = {
  site: string
}

export async function GET(context: Context) {
  const posts = (await getCollection("blog"))
    .filter(post => !post.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: `${SITE.NAME} · ${WRITING.TITLE}`,
    description: WRITING.DESCRIPTION,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/writing/${post.slug}/`,
    })),
  });
}
