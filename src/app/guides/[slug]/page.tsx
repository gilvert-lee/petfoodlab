import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Breadcrumbs, Markdown, AdSlot, Disclaimer } from "@/components/ui";
import { getGuideBySlug, listGuides } from "@/lib/queries";
import { GUIDE_CATEGORY_LABEL, SITE } from "@/lib/site";
import { formatDate } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const g = getGuideBySlug(decodeURIComponent(slug));
  if (!g) return {};
  return {
    title: g.title,
    description: g.excerpt ?? undefined,
    alternates: { canonical: `/guides/${g.slug}` },
    openGraph: { type: "article", title: g.title, description: g.excerpt ?? undefined, images: g.coverUrl ? [g.coverUrl] : undefined, publishedTime: g.publishedAt?.toISOString(), modifiedTime: g.updatedAt.toISOString() },
  };
}

export default async function GuidePage({ params }: { params: Params }) {
  const { slug } = await params;
  const g = getGuideBySlug(decodeURIComponent(slug));
  if (!g) notFound();
  const more = listGuides(g.category, 5).filter((x) => x.id !== g.id).slice(0, 4);

  const ld = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: g.title,
    description: g.excerpt ?? undefined,
    image: g.coverUrl ?? undefined,
    datePublished: g.publishedAt?.toISOString(),
    dateModified: g.updatedAt.toISOString(),
    author: { "@type": "Organization", name: SITE.name, url: SITE.url },
    publisher: { "@type": "Organization", name: SITE.name },
    mainEntityOfPage: `${SITE.url}/guides/${g.slug}`,
  };

  return (
    <Container>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Breadcrumbs items={[{ href: "/guides", label: "가이드" }, { href: `/guides?category=${g.category}`, label: GUIDE_CATEGORY_LABEL[g.category] ?? g.category }, { label: g.title }]} />
      <article className="mx-auto max-w-3xl py-8">
        <header>
          <div className="text-sm text-muted">{GUIDE_CATEGORY_LABEL[g.category] ?? g.category} · {formatDate(g.publishedAt)}{g.updatedAt && g.publishedAt && g.updatedAt.getTime() - g.publishedAt.getTime() > 86400000 ? ` (수정 ${formatDate(g.updatedAt)})` : ""}</div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">{g.title}</h1>
          {g.excerpt && <p className="mt-4 text-lg text-muted leading-relaxed">{g.excerpt}</p>}
        </header>
        {g.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={g.coverUrl} alt="" className="mt-8 rounded-2xl w-full aspect-[2/1] object-cover" />
        )}
        <Markdown md={g.body} className="mt-8" />
        <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE} />
        <Disclaimer />
      </article>
      {more.length > 0 && (
        <section className="mx-auto max-w-3xl mt-6">
          <h2 className="text-xl font-extrabold mb-3">같은 주제의 다른 글</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {more.map((m) => (
              <Link key={m.id} href={`/guides/${m.slug}`} className="card p-4 hover:shadow-md transition-shadow">
                <div className="font-bold">{m.title}</div>
                {m.excerpt && <p className="text-sm text-muted mt-1 line-clamp-2">{m.excerpt}</p>}
              </Link>
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
