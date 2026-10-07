import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/db";
import { desc, eq } from "drizzle-orm";
import AdminNav from "../AdminNav";
import { MIN_INDEXABLE_CHARS, SPECIES_LABEL, CATEGORY_LABEL } from "@/lib/site";
import { textLength } from "@/lib/utils";

export default async function AdminProducts() {
  await requireAdmin();
  const rows = db.select({ p: schema.products, brand: schema.brands.name }).from(schema.products).leftJoin(schema.brands, eq(schema.brands.id, schema.products.brandId)).orderBy(desc(schema.products.updatedAt)).all();
  return (
    <>
      <AdminNav title={`제품 (${rows.length})`} action={<Link href="/admin/products/new" className="btn btn-primary">제품 추가</Link>} />
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-muted"><th className="p-3">제품</th><th className="p-3">분류</th><th className="p-3">해설</th><th className="p-3">상태</th><th className="p-3"></th></tr></thead>
          <tbody>
            {rows.map(({ p, brand }) => {
              const len = textLength(p.commentary);
              return (
                <tr key={p.id} className="border-t border-line">
                  <td className="p-3"><div className="text-xs text-muted">{brand}</div><Link href={`/admin/products/${p.id}`} className="font-semibold hover:underline">{p.name}</Link></td>
                  <td className="p-3 text-muted">{SPECIES_LABEL[p.species]} · {CATEGORY_LABEL[p.category]}</td>
                  <td className="p-3"><span className={len >= MIN_INDEXABLE_CHARS ? "text-brand font-semibold" : "text-amber-700"}>{len}자</span></td>
                  <td className="p-3">{p.published ? <span className="chip bg-brand-soft text-brand">공개</span> : <span className="chip bg-stone-100 text-stone-600">초안</span>}</td>
                  <td className="p-3 text-right"><Link href={`/products/${p.slug}`} target="_blank" className="text-muted hover:underline">보기 ↗</Link></td>
                </tr>
              );
            })}
            {!rows.length && <tr><td colSpan={5} className="p-8 text-center text-muted">아직 제품이 없습니다.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
