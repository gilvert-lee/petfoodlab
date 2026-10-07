import Link from "next/link";
import { Container, ProductCard, EmptyState, ConcernChip } from "@/components/ui";
import { listProducts, listGuides, listIngredients, siteStats } from "@/lib/queries";
import { SITE } from "@/lib/site";
import { formatDate } from "@/lib/utils";

export default function Home() {
  const products = listProducts({}, 8);
  const guides = listGuides(undefined, 6);
  const ingredients = listIngredients().filter((i) => i.concern !== "none").slice(0, 8);
  const stats = siteStats();

  const ld = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    potentialAction: { "@type": "SearchAction", target: `${SITE.url}/products?q={search_term_string}`, "query-input": "required name=search_term_string" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <section className="bg-white border-b border-line">
        <Container className="py-14 sm:py-20">
          <p className="text-brand font-bold">반려동물 식품 성분 정보</p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            사료 뒷면 성분표,<br className="sm:hidden" /> 이제 읽을 수 있게.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted leading-relaxed">
            국내에서 판매되는 강아지·고양이 사료와 간식의 원료·보장성분을 같은 포맷으로 정리하고, 성분 하나하나가 무엇인지, 왜 들어가는지, 어떤 아이에게 맞는지 직접 써서 설명합니다.
          </p>
          <form action="/products" className="mt-8 flex gap-2 max-w-xl">
            <input name="q" placeholder="제품명 또는 브랜드로 검색 (예: 오리젠, 로얄캐닌)" className="input" />
            <button className="btn btn-primary shrink-0">검색</button>
          </form>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {[
              ["제품", stats.products], ["성분 사전", stats.ingredients], ["가이드", stats.guides], ["보호자 리뷰", stats.reviews],
            ].map(([l, v]) => (
              <div key={l as string} className="card p-4">
                <div className="text-2xl font-extrabold">{v as number}</div>
                <div className="text-sm text-muted">{l as string}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <Container className="py-12 space-y-14">
        <section>
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-2xl font-extrabold">최근 등록된 제품</h2>
            <Link href="/products" className="text-sm font-semibold text-brand hover:underline">전체 보기 →</Link>
          </div>
          {products.length ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{products.map((p) => <ProductCard key={p.id} {...p} />)}</div>
          ) : <EmptyState text="아직 등록된 제품이 없습니다." />}
        </section>

        <section className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="flex items-end justify-between mb-4">
              <h2 className="text-2xl font-extrabold">가이드</h2>
              <Link href="/guides" className="text-sm font-semibold text-brand hover:underline">전체 보기 →</Link>
            </div>
            <div className="space-y-3">
              {guides.length ? guides.map((g) => (
                <Link key={g.id} href={`/guides/${g.slug}`} className="card p-5 block hover:shadow-md transition-shadow">
                  <div className="text-xs text-muted">{formatDate(g.publishedAt)}</div>
                  <div className="font-bold text-lg mt-1">{g.title}</div>
                  {g.excerpt && <p className="text-muted text-sm mt-1 line-clamp-2">{g.excerpt}</p>}
                </Link>
              )) : <EmptyState text="아직 발행된 가이드가 없습니다." />}
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="flex items-end justify-between mb-4">
              <h2 className="text-2xl font-extrabold">주의해서 볼 성분</h2>
              <Link href="/ingredients" className="text-sm font-semibold text-brand hover:underline">성분 사전 →</Link>
            </div>
            <div className="card divide-y divide-line">
              {ingredients.length ? ingredients.map((i) => (
                <Link key={i.id} href={`/ingredients/${i.slug}`} className="flex items-center justify-between gap-3 p-4 hover:bg-brand-soft/40">
                  <div>
                    <div className="font-bold">{i.name}</div>
                    {i.summary && <div className="text-sm text-muted line-clamp-1">{i.summary}</div>}
                  </div>
                  <ConcernChip concern={i.concern} />
                </Link>
              )) : <div className="p-6 text-muted text-sm">등록된 성분이 없습니다.</div>}
            </div>
          </div>
        </section>

        <section className="card p-8 bg-brand-soft/60 border-brand/20">
          <h2 className="text-xl font-extrabold">이 사이트는 어떻게 만들어지나요</h2>
          <p className="mt-2 text-muted leading-relaxed max-w-3xl">
            제품의 원료 목록과 보장성분은 실제 포장 라벨을 기준으로 입력하며, 각 원료는 성분 사전과 자동으로 연결됩니다. 제품 해설과 가이드는 제조사 홍보 문구를 옮기지 않고 운영자가 직접 작성합니다.
            건물 기준(DMB) 환산과 탄수화물 추정치는 라벨 수치로 계산한 참고값입니다. <Link href="/about" className="text-brand font-semibold underline">자세히 보기</Link>
          </p>
        </section>
      </Container>
    </>
  );
}
