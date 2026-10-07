import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/db";
import { desc, eq } from "drizzle-orm";
import AdminNav from "../AdminNav";
import { setReviewStatus, deleteReview } from "../actions";
import { stars, formatDate } from "@/lib/utils";

export default async function AdminReviews() {
  await requireAdmin();
  const rows = db.select({ r: schema.reviews, product: schema.products.name, slug: schema.products.slug }).from(schema.reviews).innerJoin(schema.products, eq(schema.products.id, schema.reviews.productId)).orderBy(desc(schema.reviews.createdAt)).all();
  const order = { pending: 0, approved: 1, rejected: 2 };
  rows.sort((a, b) => order[a.r.status] - order[b.r.status]);
  return (
    <>
      <AdminNav title={`리뷰 검수 (대기 ${rows.filter((x) => x.r.status === "pending").length})`} />
      <div className="space-y-3">
        {rows.map(({ r, product, slug }) => (
          <article key={r.id} className={`card p-5 ${r.status === "pending" ? "border-amber-300" : ""}`}>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className={`chip ${r.status === "approved" ? "bg-brand-soft text-brand" : r.status === "rejected" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"}`}>{r.status}</span>
              <Link href={`/products/${slug}`} target="_blank" className="font-semibold hover:underline">{product}</Link>
              <span className="text-amber-500">{stars(r.rating)}</span>
              <span>{r.nickname}</span>
              <span className="text-muted">{[r.petBreed, r.petAgeYears && `${r.petAgeYears}살`, r.petWeightKg && `${r.petWeightKg}kg`, r.feedingWeeks && `${r.feedingWeeks}주`].filter(Boolean).join(" · ")}</span>
              <span className="ml-auto text-muted text-xs">{formatDate(r.createdAt)}</span>
            </div>
            <p className="mt-2 text-sm whitespace-pre-line">{r.body}</p>
            <div className="mt-3 flex gap-2">
              {(["approved", "rejected", "pending"] as const).filter((s) => s !== r.status).map((s) => (
                <form key={s} action={setReviewStatus}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value={s} /><button className="btn btn-ghost !py-1 !text-xs">{s === "approved" ? "승인" : s === "rejected" ? "거부" : "대기로"}</button></form>
              ))}
              <form action={deleteReview}><input type="hidden" name="id" value={r.id} /><button className="text-xs text-rose-700 hover:underline px-2">삭제</button></form>
            </div>
          </article>
        ))}
        {!rows.length && <p className="card p-8 text-center text-muted">리뷰가 없습니다.</p>}
      </div>
    </>
  );
}
