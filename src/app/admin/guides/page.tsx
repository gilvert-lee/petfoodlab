import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/db";
import { desc } from "drizzle-orm";
import AdminNav from "../AdminNav";
import { GUIDE_CATEGORY_LABEL } from "@/lib/site";
import { textLength, formatDate } from "@/lib/utils";

export default async function AdminGuides() {
  await requireAdmin();
  const rows = db.select().from(schema.guides).orderBy(desc(schema.guides.updatedAt)).all();
  return (
    <>
      <AdminNav title={`가이드 (${rows.length})`} action={<Link href="/admin/guides/new" className="btn btn-primary">가이드 작성</Link>} />
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-muted"><th className="p-3">제목</th><th className="p-3">분류</th><th className="p-3">글자 수</th><th className="p-3">발행일</th><th className="p-3">상태</th></tr></thead>
          <tbody>
            {rows.map((g) => { const len = textLength(g.body); return (
              <tr key={g.id} className="border-t border-line">
                <td className="p-3"><Link href={`/admin/guides/${g.id}`} className="font-semibold hover:underline">{g.title}</Link></td>
                <td className="p-3 text-muted">{GUIDE_CATEGORY_LABEL[g.category] ?? g.category}</td>
                <td className="p-3"><span className={len >= 1000 ? "text-brand font-semibold" : "text-amber-700"}>{len}자</span></td>
                <td className="p-3 text-muted">{formatDate(g.publishedAt)}</td>
                <td className="p-3">{g.published ? <span className="chip bg-brand-soft text-brand">공개</span> : <span className="chip bg-stone-100 text-stone-600">초안</span>}</td>
              </tr>); })}
            {!rows.length && <tr><td colSpan={5} className="p-8 text-center text-muted">가이드가 없습니다.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
