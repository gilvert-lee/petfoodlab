import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageTitle, ProductCard, EmptyState, Breadcrumbs } from "@/components/ui";
import { listProducts, listBrands } from "@/lib/queries";
import { CATEGORY_LABEL, SPECIES_LABEL } from "@/lib/site";

export const metadata: Metadata = {
  title: "제품 성분 데이터베이스",
  description: "강아지·고양이 사료, 간식, 영양제의 원료와 보장성분을 한 포맷으로 비교할 수 있는 제품 목록입니다.",
};

type SP = Promise<Record<string, string | undefined>>;

export default async function ProductsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const products = listProducts({ species: sp.species, category: sp.category, q: sp.q, brand: sp.brand });
  const brands = listBrands();

  const link = (patch: Record<string, string | undefined>) => {
    const u = new URLSearchParams();
    const merged = { ...sp, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) u.set(k, v);
    const s = u.toString();
    return `/products${s ? `?${s}` : ""}`;
  };

  // 필터가 걸린 목록은 중복 색인을 피하기 위해 noindex (robots meta는 generateMetadata 로 처리 가능하지만 간단히 canonical 사용)
  return (
    <Container>
      <Breadcrumbs items={[{ label: "제품" }]} />
      <PageTitle title="제품 성분 데이터베이스" sub="라벨에 적힌 원료와 보장성분을 같은 기준으로 정리했습니다." />

      <div className="flex flex-wrap gap-2 mb-3">
        <Link href={link({ species: undefined })} className={`chip ${!sp.species ? "bg-brand text-white" : "bg-white border border-line"}`}>전체</Link>
        {Object.entries(SPECIES_LABEL).map(([k, v]) => (
          <Link key={k} href={link({ species: k })} className={`chip ${sp.species === k ? "bg-brand text-white" : "bg-white border border-line"}`}>{v}</Link>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        <Link href={link({ category: undefined })} className={`chip ${!sp.category ? "bg-brand text-white" : "bg-white border border-line"}`}>모든 종류</Link>
        {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
          <Link key={k} href={link({ category: k })} className={`chip ${sp.category === k ? "bg-brand text-white" : "bg-white border border-line"}`}>{v}</Link>
        ))}
      </div>
      <form className="flex flex-wrap gap-2 mb-8">
        {sp.species && <input type="hidden" name="species" value={sp.species} />}
        {sp.category && <input type="hidden" name="category" value={sp.category} />}
        <input name="q" defaultValue={sp.q} placeholder="제품명·브랜드 검색" className="input !w-64" />
        <select name="brand" defaultValue={sp.brand ?? ""} className="input !w-44">
          <option value="">모든 브랜드</option>
          {brands.map((b) => <option key={b.id} value={b.slug}>{b.name}</option>)}
        </select>
        <button className="btn btn-ghost">적용</button>
      </form>

      {products.length ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => <ProductCard key={p.id} {...p} />)}
        </div>
      ) : <EmptyState text="조건에 맞는 제품이 없습니다." />}

      <section className="mt-14 card p-6 prose-pfl">
        <h2 className="!mt-0">이 목록은 어떻게 읽나요</h2>
        <p>카드에 표시된 조단백·조지방은 라벨의 보장성분(최소치)입니다. 습식 사료는 수분이 70% 이상이라 건식과 수치를 그대로 비교하면 안 되고, 제품 상세 페이지의 <strong>건물 기준(DMB) 환산값</strong>으로 비교해야 합니다.</p>
        <p>원료 목록은 라벨 표기 순서(함량 순)를 그대로 보존합니다. 보통 앞의 5개 원료가 사료의 성격을 결정하며, 각 원료를 클릭하면 성분 사전에서 자세한 설명을 볼 수 있습니다.</p>
      </section>
    </Container>
  );
}
