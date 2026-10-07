import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageTitle, Breadcrumbs, SpeciesChip, CategoryChip, ConcernChip } from "@/components/ui";
import { getProductsByIds, listProducts } from "@/lib/queries";
import { deriveNutrition } from "@/lib/utils";

export const metadata: Metadata = {
  title: "제품 비교",
  description: "두세 개 제품의 원료와 보장성분을 나란히 놓고 비교합니다.",
  robots: { index: false, follow: true },
};

export default async function ComparePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const ids = (sp.ids ?? "").split(",").map(Number).filter((n) => Number.isInteger(n) && n > 0).slice(0, 3);
  const selected = getProductsByIds(ids);
  const all = listProducts({}, 200);

  const rows: { label: string; get: (p: (typeof selected)[number]) => string }[] = [
    { label: "브랜드", get: (p) => p.brand?.name ?? "-" },
    { label: "조단백", get: (p) => (p.protein != null ? `${p.protein}%` : "-") },
    { label: "조지방", get: (p) => (p.fat != null ? `${p.fat}%` : "-") },
    { label: "조섬유", get: (p) => (p.fiber != null ? `${p.fiber}%` : "-") },
    { label: "수분", get: (p) => (p.moisture != null ? `${p.moisture}%` : "-") },
    { label: "탄수화물(추정)", get: (p) => { const n = deriveNutrition(p); return n.carbsEstimate != null ? `${n.carbsEstimate}%` : "-"; } },
    { label: "단백질 DMB", get: (p) => { const n = deriveNutrition(p); return n.proteinDmb != null ? `${n.proteinDmb}%` : "-"; } },
    { label: "지방 DMB", get: (p) => { const n = deriveNutrition(p); return n.fatDmb != null ? `${n.fatDmb}%` : "-"; } },
    { label: "kcal/100g", get: (p) => (p.kcalPer100g != null ? `${p.kcalPer100g}` : "-") },
    { label: "원료 수", get: (p) => `${p.ingredients.length}종` },
    { label: "주의·논란 원료", get: (p) => `${p.ingredients.filter((i) => i.ingredient.concern !== "none").length}개` },
  ];

  return (
    <Container>
      <Breadcrumbs items={[{ label: "비교" }]} />
      <PageTitle title="제품 비교" sub="최대 3개까지 나란히 비교할 수 있습니다." />

      <form className="card p-5 mb-8 grid gap-3 sm:grid-cols-4">
        {[0, 1, 2].map((i) => (
          <select key={i} name={`p${i}`} defaultValue={ids[i] ?? ""} className="input">
            <option value="">제품 {i + 1} 선택</option>
            {all.map((p) => <option key={p.id} value={p.id}>{p.brandName ? `[${p.brandName}] ` : ""}{p.name}</option>)}
          </select>
        ))}
        <button className="btn btn-primary" formAction="/compare/go">비교하기</button>
      </form>

      {selected.length ? (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="p-3 text-left text-muted w-36">항목</th>
                {selected.map((p) => (
                  <th key={p.id} className="p-3 text-left align-top">
                    <Link href={`/products/${p.slug}`} className="font-extrabold text-base hover:underline">{p.name}</Link>
                    <div className="mt-1 flex gap-1 flex-wrap"><SpeciesChip species={p.species} /><CategoryChip category={p.category} /></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-t border-line">
                  <td className="p-3 text-muted">{r.label}</td>
                  {selected.map((p) => <td key={p.id} className="p-3 font-semibold">{r.get(p)}</td>)}
                </tr>
              ))}
              <tr className="border-t border-line align-top">
                <td className="p-3 text-muted">주요 원료 (앞 5개)</td>
                {selected.map((p) => (
                  <td key={p.id} className="p-3">
                    <ol className="list-decimal ml-4 space-y-0.5">
                      {p.ingredients.slice(0, 5).map((i) => (
                        <li key={i.position} className="flex items-center gap-1.5">
                          {i.ingredient.published ? <Link href={`/ingredients/${i.ingredient.slug}`} className="hover:underline">{i.rawName}</Link> : i.rawName}
                          {i.ingredient.concern !== "none" && <ConcernChip concern={i.ingredient.concern} />}
                        </li>
                      ))}
                    </ol>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p className="card p-8 text-center text-muted">위에서 비교할 제품을 선택하세요.</p>
      )}

      <section className="mt-12 card p-6 prose-pfl">
        <h2 className="!mt-0">비교할 때 주의할 점</h2>
        <p>습식과 건식을 비교할 때는 라벨 수치가 아니라 <strong>DMB(건물 기준)</strong> 행을 보세요. 수분 78%인 습식의 조단백 10%는 건물 기준으로 약 45%로, 건식 사료 대부분보다 높습니다.</p>
        <p>원료 수가 많다고 좋은 것도, 적다고 좋은 것도 아닙니다. 앞 5개 원료의 성격과 주의·논란 원료의 유무를 함께 보세요.</p>
      </section>
    </Container>
  );
}
