import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Breadcrumbs, Markdown, SpeciesChip, CategoryChip, ConcernChip, ProductCard, AdSlot, Disclaimer } from "@/components/ui";
import { getProductBySlug, isProductIndexable, relatedProducts, productRating } from "@/lib/queries";
import { CATEGORY_LABEL, SPECIES_LABEL, SITE } from "@/lib/site";
import { deriveNutrition, splitLines, stars, formatDate } from "@/lib/utils";
import ReviewForm from "@/components/ReviewForm";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProductBySlug(decodeURIComponent(slug));
  if (!p) return {};
  const title = `${p.brand?.name ? p.brand.name + " " : ""}${p.name} 성분 분석`;
  const first3 = p.ingredients.slice(0, 3).map((i) => i.ingredient.name).join(", ");
  return {
    title,
    description: `${SPECIES_LABEL[p.species]} ${CATEGORY_LABEL[p.category]} ${p.name}의 원료(${first3} 등 ${p.ingredients.length}종)와 보장성분, 장단점 해설.`,
    alternates: { canonical: `/products/${p.slug}` },
    robots: isProductIndexable(p) ? { index: true, follow: true } : { index: false, follow: true },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const p = getProductBySlug(decodeURIComponent(slug));
  if (!p) notFound();
  const n = deriveNutrition(p);
  const related = relatedProducts(p);
  const rating = productRating(p.id);
  const pros = splitLines(p.pros);
  const cons = splitLines(p.cons);
  const cautions = p.ingredients.filter((i) => i.ingredient.concern !== "none");

  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    brand: p.brand ? { "@type": "Brand", name: p.brand.name } : undefined,
    image: p.imageUrl ?? undefined,
    description: p.commentary?.slice(0, 200),
    category: `${SPECIES_LABEL[p.species]} ${CATEGORY_LABEL[p.category]}`,
    url: `${SITE.url}/products/${p.slug}`,
    ...(rating.count > 0 ? { aggregateRating: { "@type": "AggregateRating", ratingValue: rating.avg, reviewCount: rating.count } } : {}),
  };

  const Nut = ({ label, v, dmb, note }: { label: string; v: number | null | undefined; dmb?: number | null; note?: string }) => (
    <tr className="border-t border-line">
      <td className="py-2 pr-3 text-muted">{label}</td>
      <td className="py-2 pr-3 font-bold">{v != null ? `${v}%` : "-"}</td>
      <td className="py-2 text-muted">{dmb != null ? `${dmb}%` : "-"}{note && <span className="ml-1 text-xs">({note})</span>}</td>
    </tr>
  );

  return (
    <Container>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Breadcrumbs items={[{ href: "/products", label: "제품" }, { href: `/products?species=${p.species}`, label: SPECIES_LABEL[p.species] }, { label: p.name }]} />

      <header className="py-8 grid gap-8 md:grid-cols-5">
        <div className="md:col-span-2 card aspect-square flex items-center justify-center overflow-hidden bg-stone-100">
          {p.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
          ) : <span className="text-7xl">{p.species === "dog" ? "🐶" : "🐱"}</span>}
        </div>
        <div className="md:col-span-3">
          {p.brand && <Link href={`/products?brand=${p.brand.slug}`} className="text-brand font-semibold hover:underline">{p.brand.name}</Link>}
          <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">{p.name}</h1>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <SpeciesChip species={p.species} /><CategoryChip category={p.category} />
            {p.lifeStage && <span className="chip bg-stone-100 text-stone-700">{p.lifeStage}</span>}
          </div>
          {rating.count > 0 && <div className="mt-3 text-amber-500 font-bold">{stars(rating.avg!)} <span className="text-fg">{rating.avg}</span> <span className="text-muted font-normal text-sm">({rating.count}개 리뷰)</span></div>}

          <dl className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[["조단백", p.protein], ["조지방", p.fat], ["탄수화물(추정)", n.carbsEstimate], ["kcal/100g", p.kcalPer100g]].map(([l, v]) => (
              <div key={l as string} className="card p-3">
                <dt className="text-xs text-muted">{l as string}</dt>
                <dd className="text-xl font-extrabold">{v != null ? `${v}${l === "kcal/100g" ? "" : "%"}` : "-"}</dd>
              </div>
            ))}
          </dl>
          {p.ingredients.length > 0 && (
            <div className="mt-5">
              <div className="text-xs text-muted mb-1">주요 원료 (라벨 앞 5개)</div>
              <div className="flex flex-wrap gap-1.5">
                {p.ingredients.slice(0, 5).map((i) => (
                  <Link key={i.position} href={i.ingredient.published ? `/ingredients/${i.ingredient.slug}` : "#ingredients"} className="chip bg-white border border-line hover:border-brand">{i.rawName}</Link>
                ))}
              </div>
            </div>
          )}
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href={`/compare?ids=${p.id}`} className="btn btn-ghost">다른 제품과 비교</Link>
            {p.affiliateUrl && <a href={p.affiliateUrl} target="_blank" rel="nofollow sponsored noopener" className="btn btn-primary">판매처 보기</a>}
          </div>
          {p.weightOptions && <p className="mt-3 text-sm text-muted">용량: {p.weightOptions}{p.priceNote && ` · ${p.priceNote}`}</p>}
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-12">
          {cautions.length > 0 && (
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h2 className="font-extrabold text-amber-900">확인이 필요한 원료 {cautions.length}개</h2>
              <ul className="mt-2 space-y-1 text-sm">
                {cautions.map((i) => (
                  <li key={i.position} className="flex items-center gap-2">
                    <ConcernChip concern={i.ingredient.concern} />
                    <Link href={`/ingredients/${i.ingredient.slug}`} className="font-semibold hover:underline">{i.ingredient.name}</Link>
                    <span className="text-muted">— {i.ingredient.summary ?? "성분 사전에서 자세히 보기"}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section id="ingredients">
            <h2 className="text-2xl font-extrabold mb-3">전체 원료 ({p.ingredients.length}종)</h2>
            <p className="text-sm text-muted mb-4">라벨 표기 순서(함량 순) 그대로입니다. 성분명을 누르면 성분 사전으로 이동합니다.</p>
            {p.ingredients.length ? (
              <ol className="card divide-y divide-line">
                {p.ingredients.map((i) => (
                  <li key={i.position} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                    <span className="w-6 text-muted tabular-nums">{i.position + 1}</span>
                    <span className="flex-1">
                      {i.ingredient.published ? <Link href={`/ingredients/${i.ingredient.slug}`} className="font-semibold text-brand hover:underline">{i.rawName}</Link> : <span className="font-semibold">{i.rawName}</span>}
                    </span>
                    {i.ingredient.concern !== "none" && <ConcernChip concern={i.ingredient.concern} />}
                  </li>
                ))}
              </ol>
            ) : <p className="card p-6 text-muted">원료 정보가 아직 입력되지 않았습니다.</p>}
            {p.ingredientsRaw && <details className="mt-3 text-sm text-muted"><summary className="cursor-pointer">라벨 원문 보기</summary><p className="mt-2 leading-relaxed">{p.ingredientsRaw}</p></details>}
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-3">보장성분</h2>
            <div className="card p-5 overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-muted"><th className="pb-2">항목</th><th className="pb-2">라벨 표기</th><th className="pb-2">건물 기준(DMB)</th></tr></thead>
                <tbody>
                  <Nut label="조단백 (이상)" v={p.protein} dmb={n.proteinDmb} />
                  <Nut label="조지방 (이상)" v={p.fat} dmb={n.fatDmb} />
                  <Nut label="조섬유 (이하)" v={p.fiber} />
                  <Nut label="수분 (이하)" v={p.moisture} note={n.assumedMoisture ? "미표기 → 10% 가정" : undefined} />
                  <Nut label="조회분 (이하)" v={p.ash} note={n.assumedAsh ? "미표기 → 7% 가정" : undefined} />
                  <Nut label="칼슘" v={p.calcium} />
                  <Nut label="인" v={p.phosphorus} />
                  <Nut label="탄수화물 (추정)" v={n.carbsEstimate} dmb={n.carbsDmb} />
                </tbody>
              </table>
              <p className="mt-3 text-xs text-muted leading-relaxed">탄수화물은 라벨에 표기되지 않으므로 100 − (수분+조단백+조지방+조섬유+조회분)으로 추정한 값입니다. 건물 기준은 수분을 제외한 비율로, 습식과 건식을 비교할 때 사용합니다.</p>
            </div>
          </section>

          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE} />

          <section>
            <h2 className="text-2xl font-extrabold mb-3">펫푸드랩 해설</h2>
            {p.commentary ? <Markdown md={p.commentary} className="card p-6" /> : <p className="card p-6 text-muted">해설이 아직 작성되지 않았습니다.</p>}
            {(pros.length > 0 || cons.length > 0) && (
              <div className="mt-4 grid sm:grid-cols-2 gap-4">
                <div className="card p-5"><h3 className="font-bold text-brand mb-2">장점</h3><ul className="space-y-1.5 text-sm">{pros.map((x, i) => <li key={i}>✔ {x}</li>)}</ul></div>
                <div className="card p-5"><h3 className="font-bold text-rose-700 mb-2">아쉬운 점</h3><ul className="space-y-1.5 text-sm">{cons.map((x, i) => <li key={i}>✘ {x}</li>)}</ul></div>
              </div>
            )}
            {p.suitableFor && <p className="mt-4 rounded-xl bg-brand-soft p-4 text-sm"><b>이런 아이에게:</b> {p.suitableFor}</p>}
          </section>

          <section id="reviews">
            <h2 className="text-2xl font-extrabold mb-3">보호자 리뷰 ({p.reviews.length})</h2>
            {p.reviews.length ? (
              <div className="space-y-3">
                {p.reviews.map((r) => (
                  <article key={r.id} className="card p-5">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="text-amber-500 font-bold">{stars(r.rating)}</span>
                      <span className="font-semibold">{r.nickname}</span>
                      <span className="text-muted">{[r.petBreed, r.petAgeYears && `${r.petAgeYears}살`, r.petWeightKg && `${r.petWeightKg}kg`, r.feedingWeeks && `${r.feedingWeeks}주 급여`].filter(Boolean).join(" · ")}</span>
                      <span className="ml-auto text-muted text-xs">{formatDate(r.createdAt)}</span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed whitespace-pre-line">{r.body}</p>
                  </article>
                ))}
              </div>
            ) : <p className="card p-6 text-muted text-sm">아직 리뷰가 없습니다. 첫 번째 급여 후기를 남겨주세요.</p>}
            <ReviewForm productId={p.id} />
          </section>

          <Disclaimer />
        </div>

        <aside className="space-y-6">
          <div className="card p-5">
            <h3 className="font-bold mb-3">같은 카테고리 제품</h3>
            <div className="space-y-2">
              {related.map((r) => (
                <Link key={r.id} href={`/products/${r.slug}`} className="block rounded-lg p-2 hover:bg-brand-soft/50">
                  <div className="text-xs text-muted">{r.brandName}</div>
                  <div className="font-semibold text-sm">{r.name}</div>
                  <div className="text-xs text-muted">단백 {r.protein ?? "-"}% · 지방 {r.fat ?? "-"}%</div>
                </Link>
              ))}
              {!related.length && <p className="text-sm text-muted">비교할 제품이 아직 없습니다.</p>}
            </div>
          </div>
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR} />
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-extrabold mb-4">함께 보면 좋은 제품</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {related.map((r) => <ProductCard key={r.id} {...r} species={p.species} category={p.category} />)}
          </div>
        </section>
      )}
    </Container>
  );
}
