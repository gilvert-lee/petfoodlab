import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Breadcrumbs, Markdown, ConcernChip, GroupChip, AdSlot, Disclaimer } from "@/components/ui";
import { getIngredientBySlug, isIngredientIndexable } from "@/lib/queries";
import { SPECIES_LABEL } from "@/lib/site";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const i = getIngredientBySlug(decodeURIComponent(slug));
  if (!i) return {};
  return {
    title: `${i.name} — 사료 성분 해설`,
    description: i.summary ?? `${i.name}이(가) 반려동물 사료에 들어가는 이유와 주의할 점.`,
    alternates: { canonical: `/ingredients/${i.slug}` },
    robots: isIngredientIndexable(i) ? { index: true, follow: true } : { index: false, follow: true },
  };
}

export default async function IngredientPage({ params }: { params: Params }) {
  const { slug } = await params;
  const i = getIngredientBySlug(decodeURIComponent(slug));
  if (!i) notFound();
  const aliases = (i.aliases ?? "").split(",").map((s) => s.trim()).filter(Boolean);

  const ld = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: i.name,
    description: i.summary ?? undefined,
    alternateName: aliases.length ? aliases : undefined,
    inDefinedTermSet: { "@type": "DefinedTermSet", name: "펫푸드랩 성분 사전" },
  };

  return (
    <Container>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Breadcrumbs items={[{ href: "/ingredients", label: "성분 사전" }, { label: i.name }]} />
      <header className="py-8">
        <div className="flex flex-wrap gap-1.5 mb-3"><GroupChip group={i.group} /><ConcernChip concern={i.concern} /></div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{i.name}</h1>
        {aliases.length > 0 && <p className="mt-2 text-sm text-muted">다른 표기: {aliases.join(", ")}</p>}
        {i.summary && <p className="mt-4 text-lg text-muted leading-relaxed max-w-3xl">{i.summary}</p>}
      </header>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {i.body ? <Markdown md={i.body} className="card p-6 sm:p-8" /> : <p className="card p-6 text-muted">해설이 아직 작성되지 않았습니다.</p>}
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE} />
          <Disclaimer />
        </div>
        <aside>
          <div className="card p-5">
            <h2 className="font-bold mb-3">이 성분이 들어간 제품 <span className="text-muted font-normal text-sm">{i.usedIn.length}</span></h2>
            {i.usedIn.length ? (
              <ul className="space-y-1.5">
                {i.usedIn.map((p) => (
                  <li key={p.id}>
                    <Link href={`/products/${p.slug}`} className="block rounded-lg p-2 hover:bg-brand-soft/50">
                      <div className="text-xs text-muted">{p.brandName} · {SPECIES_LABEL[p.species]}</div>
                      <div className="text-sm font-semibold">{p.name}</div>
                      <div className="text-xs text-muted">라벨 {p.position + 1}번째 원료</div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-muted">아직 연결된 제품이 없습니다.</p>}
          </div>
        </aside>
      </div>
    </Container>
  );
}
