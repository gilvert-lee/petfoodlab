import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageTitle, Breadcrumbs, EmptyState } from "@/components/ui";
import { listGuides } from "@/lib/queries";
import { GUIDE_CATEGORY_LABEL } from "@/lib/site";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "가이드",
  description: "사료 라벨 읽는 법부터 연령·품종·상태별 선택 기준까지, 반려동물 식품을 고를 때 알아야 할 것들을 정리한 글 모음입니다.",
};

export default async function GuidesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const guides = listGuides(sp.category);
  return (
    <Container>
      <Breadcrumbs items={[{ label: "가이드" }]} />
      <PageTitle title="가이드" sub="라벨을 읽는 법, 우리 아이에게 맞는 기준을 세우는 법." />
      <div className="flex flex-wrap gap-2 mb-8">
        <Link href="/guides" className={`chip ${!sp.category ? "bg-brand text-white" : "bg-white border border-line"}`}>전체</Link>
        {Object.entries(GUIDE_CATEGORY_LABEL).map(([k, v]) => (
          <Link key={k} href={`/guides?category=${k}`} className={`chip ${sp.category === k ? "bg-brand text-white" : "bg-white border border-line"}`}>{v}</Link>
        ))}
      </div>
      {guides.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {guides.map((g) => (
            <Link key={g.id} href={`/guides/${g.slug}`} className="card overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              {g.coverUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={g.coverUrl} alt="" className="aspect-[2/1] object-cover" loading="lazy" />
              )}
              <div className="p-5">
                <div className="text-xs text-muted">{GUIDE_CATEGORY_LABEL[g.category] ?? g.category} · {formatDate(g.publishedAt)}</div>
                <h2 className="mt-1 text-xl font-extrabold leading-snug">{g.title}</h2>
                {g.excerpt && <p className="mt-2 text-muted text-sm line-clamp-3">{g.excerpt}</p>}
              </div>
            </Link>
          ))}
        </div>
      ) : <EmptyState text="아직 발행된 가이드가 없습니다." />}
    </Container>
  );
}
