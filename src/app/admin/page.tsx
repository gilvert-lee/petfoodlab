import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/db";
import { count, eq } from "drizzle-orm";
import AdminNav from "./AdminNav";
import { MIN_INDEXABLE_CHARS } from "@/lib/site";
import { textLength } from "@/lib/utils";

export default async function AdminHome() {
  await requireAdmin();
  const products = db.select().from(schema.products).all();
  const ingredients = db.select().from(schema.ingredients).all();
  const guides = db.select().from(schema.guides).all();
  const pendingReviews = db.select({ c: count() }).from(schema.reviews).where(eq(schema.reviews.status, "pending")).get()?.c ?? 0;

  const pubProducts = products.filter((p) => p.published);
  const indexableProducts = pubProducts.filter((p) => textLength(p.commentary) >= MIN_INDEXABLE_CHARS);
  const pubIngredients = ingredients.filter((i) => i.published);
  const indexableIngredients = pubIngredients.filter((i) => textLength(i.body) >= MIN_INDEXABLE_CHARS);
  const draftIngredients = ingredients.filter((i) => !i.published);
  const pubGuides = guides.filter((g) => g.published);
  const longGuides = pubGuides.filter((g) => textLength(g.body) >= 1000);

  const goals = [
    { label: "가이드 (1,000자 이상)", v: longGuides.length, goal: 25, href: "/admin/guides" },
    { label: "해설 완료 제품 (600자 이상)", v: indexableProducts.length, goal: 50, href: "/admin/products" },
    { label: "성분 사전 (600자 이상)", v: indexableIngredients.length, goal: 60, href: "/admin/ingredients" },
    { label: "색인 가능 페이지 합계", v: longGuides.length + indexableProducts.length + indexableIngredients.length, goal: 100, href: "#" },
  ];

  return (
    <>
      <AdminNav title="대시보드" />
      <section>
        <h2 className="font-bold text-lg mb-3">애드센스 신청 체크리스트</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {goals.map((g) => {
            const pct = Math.min(100, Math.round((g.v / g.goal) * 100));
            return (
              <Link key={g.label} href={g.href} className="card p-4 block">
                <div className="text-sm text-muted">{g.label}</div>
                <div className="text-2xl font-extrabold mt-1">{g.v} <span className="text-base text-muted font-normal">/ {g.goal}</span></div>
                <div className="mt-2 h-2 rounded-full bg-stone-100 overflow-hidden"><div className={`h-full ${pct >= 100 ? "bg-brand" : "bg-accent"}`} style={{ width: `${pct}%` }} /></div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-10 grid md:grid-cols-3 gap-4">
        <div className="card p-5">
          <h3 className="font-bold">제품</h3>
          <p className="text-sm text-muted mt-1">전체 {products.length} · 공개 {pubProducts.length} · 색인 {indexableProducts.length}</p>
          <p className="text-sm text-amber-800 mt-1">해설 부족(noindex): {pubProducts.length - indexableProducts.length}</p>
          <Link href="/admin/products/new" className="btn btn-primary mt-3 !py-1.5 !text-sm">제품 추가</Link>
        </div>
        <div className="card p-5">
          <h3 className="font-bold">성분</h3>
          <p className="text-sm text-muted mt-1">전체 {ingredients.length} · 공개 {pubIngredients.length} · 색인 {indexableIngredients.length}</p>
          <p className="text-sm text-amber-800 mt-1">자동 생성된 미작성 성분: {draftIngredients.length}</p>
          <Link href="/admin/ingredients?draft=1" className="btn btn-ghost mt-3 !py-1.5 !text-sm">미작성 성분 채우기</Link>
        </div>
        <div className="card p-5">
          <h3 className="font-bold">가이드 · 리뷰</h3>
          <p className="text-sm text-muted mt-1">가이드 공개 {pubGuides.length} · 초안 {guides.length - pubGuides.length}</p>
          <p className="text-sm text-amber-800 mt-1">검수 대기 리뷰: {pendingReviews}</p>
          <div className="flex gap-2 mt-3">
            <Link href="/admin/guides/new" className="btn btn-primary !py-1.5 !text-sm">가이드 작성</Link>
            <Link href="/admin/reviews" className="btn btn-ghost !py-1.5 !text-sm">리뷰 검수</Link>
          </div>
        </div>
      </section>

      <section className="mt-10 card p-5 text-sm leading-relaxed">
        <h3 className="font-bold mb-2">운영 메모</h3>
        <ul className="list-disc ml-5 space-y-1 text-muted">
          <li>제품 해설이 {MIN_INDEXABLE_CHARS}자 미만이면 자동으로 <code>noindex</code> 처리되고 sitemap에서 빠집니다. 승인 심사에 얇은 페이지가 노출되지 않게 하기 위한 장치입니다.</li>
          <li>제품의 원료 원문을 저장하면 성분 사전과 자동 매칭됩니다. 사전에 없는 원료는 미공개 성분으로 자동 생성되니 "미작성 성분 채우기"에서 해설을 채운 뒤 공개하세요.</li>
          <li>성분 사전에 동의어(aliases)를 추가한 뒤에는 성분 목록 페이지의 "전체 제품 재매칭"을 한 번 눌러주세요.</li>
          <li>애드센스 승인 후 <code>.env</code>의 <code>NEXT_PUBLIC_ADSENSE_CLIENT</code>와 슬롯 ID를 입력하면 광고가 표시됩니다. 승인 전에는 비워두세요.</li>
        </ul>
      </section>
    </>
  );
}
