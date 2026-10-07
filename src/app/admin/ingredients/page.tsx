import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/db";
import { count, eq } from "drizzle-orm";
import AdminNav from "../AdminNav";
import { resyncAllProducts } from "../actions";
import { GROUP_LABEL, CONCERN_LABEL, MIN_INDEXABLE_CHARS } from "@/lib/site";
import { textLength } from "@/lib/utils";

export default async function AdminIngredients({ searchParams }: { searchParams: Promise<{ draft?: string; resynced?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  let rows = db
    .select({ i: schema.ingredients, used: count(schema.productIngredients.productId) })
    .from(schema.ingredients)
    .leftJoin(schema.productIngredients, eq(schema.productIngredients.ingredientId, schema.ingredients.id))
    .groupBy(schema.ingredients.id)
    .orderBy(schema.ingredients.published, schema.ingredients.name)
    .all();
  if (sp.draft) rows = rows.filter((r) => !r.i.published);
  return (
    <>
      <AdminNav title={`성분 사전 (${rows.length})`} action={
        <div className="flex gap-2">
          <form action={resyncAllProducts}><button className="btn btn-ghost">전체 제품 재매칭</button></form>
          <Link href="/admin/ingredients/new" className="btn btn-primary">성분 추가</Link>
        </div>
      } />
      {sp.resynced && <p className="mb-4 rounded-xl bg-brand-soft p-3 text-sm text-brand font-semibold">모든 제품의 원료를 다시 매칭했습니다.</p>}
      <div className="mb-4 flex gap-2 text-sm">
        <Link href="/admin/ingredients" className={`chip ${!sp.draft ? "bg-brand text-white" : "bg-white border border-line"}`}>전체</Link>
        <Link href="/admin/ingredients?draft=1" className={`chip ${sp.draft ? "bg-brand text-white" : "bg-white border border-line"}`}>미작성(자동 생성)만</Link>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-muted"><th className="p-3">성분</th><th className="p-3">분류</th><th className="p-3">표시</th><th className="p-3">본문</th><th className="p-3">사용 제품</th><th className="p-3">상태</th></tr></thead>
          <tbody>
            {rows.map(({ i, used }) => {
              const len = textLength(i.body);
              return (
                <tr key={i.id} className="border-t border-line">
                  <td className="p-3"><Link href={`/admin/ingredients/${i.id}`} className="font-semibold hover:underline">{i.name}</Link>{i.aliases && <div className="text-xs text-muted">{i.aliases}</div>}</td>
                  <td className="p-3 text-muted">{GROUP_LABEL[i.group]}</td>
                  <td className="p-3"><span className={`chip ${CONCERN_LABEL[i.concern].className}`}>{CONCERN_LABEL[i.concern].label}</span></td>
                  <td className="p-3"><span className={len >= MIN_INDEXABLE_CHARS ? "text-brand font-semibold" : "text-amber-700"}>{len}자</span></td>
                  <td className="p-3 text-muted">{used}</td>
                  <td className="p-3">{i.published ? <span className="chip bg-brand-soft text-brand">공개</span> : <span className="chip bg-stone-100 text-stone-600">초안</span>}</td>
                </tr>
              );
            })}
            {!rows.length && <tr><td colSpan={6} className="p-8 text-center text-muted">성분이 없습니다.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
