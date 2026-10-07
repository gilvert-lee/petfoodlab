import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageTitle, Breadcrumbs, ConcernChip, GroupChip, EmptyState } from "@/components/ui";
import { listIngredients } from "@/lib/queries";
import { GROUP_LABEL } from "@/lib/site";

export const metadata: Metadata = {
  title: "성분 사전",
  description: "사료 라벨에 등장하는 원료와 첨가물이 무엇인지, 왜 들어가는지, 주의할 점은 없는지 성분별로 정리한 사전입니다.",
};

export default async function IngredientsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const items = listIngredients(sp.group, sp.q);
  const grouped = new Map<string, typeof items>();
  for (const i of items) grouped.set(i.group, [...(grouped.get(i.group) ?? []), i]);

  return (
    <Container>
      <Breadcrumbs items={[{ label: "성분 사전" }]} />
      <PageTitle title="성분 사전" sub="라벨에 적힌 이름 그대로 찾아보세요. 동의어·영문명으로도 검색됩니다." />
      <form className="flex flex-wrap gap-2 mb-4">
        <input name="q" defaultValue={sp.q} placeholder="성분명 검색 (예: 닭고기분, 비트펄프, BHA)" className="input !w-80" />
        <button className="btn btn-ghost">검색</button>
      </form>
      <div className="flex flex-wrap gap-2 mb-8">
        <Link href="/ingredients" className={`chip ${!sp.group ? "bg-brand text-white" : "bg-white border border-line"}`}>전체</Link>
        {Object.entries(GROUP_LABEL).map(([k, v]) => (
          <Link key={k} href={`/ingredients?group=${k}`} className={`chip ${sp.group === k ? "bg-brand text-white" : "bg-white border border-line"}`}>{v}</Link>
        ))}
      </div>

      {items.length ? (
        <div className="space-y-10">
          {[...grouped.entries()].map(([g, list]) => (
            <section key={g}>
              <h2 className="text-xl font-extrabold mb-3 flex items-center gap-2">{GROUP_LABEL[g] ?? g} <span className="text-sm text-muted font-normal">{list.length}개</span></h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {list.map((i) => (
                  <Link key={i.id} href={`/ingredients/${i.slug}`} className="card p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold">{i.name}</span>
                      <ConcernChip concern={i.concern} />
                    </div>
                    {i.summary && <p className="mt-1 text-sm text-muted line-clamp-2">{i.summary}</p>}
                    <p className="mt-2 text-xs text-muted">{i.productCount}개 제품에 포함</p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : <EmptyState text="조건에 맞는 성분이 없습니다." />}

      <section className="mt-14 card p-6 prose-pfl">
        <h2 className="!mt-0">표시 기준</h2>
        <p><strong>일반</strong>은 통상적으로 문제가 제기되지 않는 원료, <strong>주의</strong>는 특정 상태(알러지·질환·연령)의 반려동물에게는 확인이 필요한 원료, <strong>논란</strong>은 안전성이나 필요성에 대해 전문가 사이에서도 의견이 갈리는 원료입니다. 어느 쪽이든 "나쁜 성분"이라는 뜻이 아니라 <em>알고 선택하자</em>는 표시입니다.</p>
      </section>
    </Container>
  );
}
