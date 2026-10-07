import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/db";
import AdminNav from "../AdminNav";
import { saveBrand, deleteBrand } from "../actions";

export default async function AdminBrands() {
  await requireAdmin();
  const rows = db.select().from(schema.brands).orderBy(schema.brands.name).all();
  return (
    <>
      <AdminNav title={`브랜드 (${rows.length})`} />
      <div className="grid gap-6 lg:grid-cols-3">
        <form action={saveBrand} className="card p-5 space-y-3 h-fit">
          <h2 className="font-bold">브랜드 추가</h2>
          <input name="name" required placeholder="브랜드명 *" className="input" />
          <input name="country" placeholder="국가 (캐나다, 미국, 한국...)" className="input" />
          <textarea name="description" rows={3} placeholder="한 줄 소개" className="input" />
          <button className="btn btn-primary w-full justify-center">추가</button>
        </form>
        <div className="lg:col-span-2 space-y-3">
          {rows.map((b) => (
            <form key={b.id} action={saveBrand} className="card p-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto_auto] items-center">
              <input type="hidden" name="id" value={b.id} />
              <input name="name" defaultValue={b.name} className="input" />
              <input name="country" defaultValue={b.country ?? ""} placeholder="국가" className="input" />
              <button className="btn btn-ghost">저장</button>
              <button formAction={deleteBrand} formNoValidate className="text-sm text-rose-700 hover:underline px-2">삭제</button>
              <textarea name="description" defaultValue={b.description ?? ""} rows={2} placeholder="소개" className="input sm:col-span-4" />
            </form>
          ))}
          {!rows.length && <p className="card p-8 text-center text-muted">브랜드가 없습니다.</p>}
        </div>
      </div>
    </>
  );
}
