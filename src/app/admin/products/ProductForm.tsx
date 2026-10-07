import { saveProduct, deleteProduct } from "../actions";
import type { Product, Brand } from "@/db/schema";
import { CATEGORY_LABEL, MIN_INDEXABLE_CHARS } from "@/lib/site";
import { textLength } from "@/lib/utils";

export default function ProductForm({ product, brands, matched }: { product?: Product; brands: Brand[]; matched?: { rawName: string; name: string; published: boolean }[] }) {
  const p = product;
  const F = ({ name, label, type = "text", step, placeholder }: { name: keyof Product; label: string; type?: string; step?: string; placeholder?: string }) => (
    <label className="block text-sm">
      <span className="text-muted">{label}</span>
      <input name={name} type={type} step={step} defaultValue={(p?.[name] as string | number | null) ?? ""} placeholder={placeholder} className="input mt-1" />
    </label>
  );
  const len = textLength(p?.commentary);
  return (
    <form action={saveProduct} className="grid gap-6 lg:grid-cols-3">
      {p && <input type="hidden" name="id" value={p.id} />}
      <div className="lg:col-span-2 space-y-6">
        <section className="card p-5 grid gap-3 sm:grid-cols-2">
          <h2 className="sm:col-span-2 font-bold">기본 정보</h2>
          <label className="block text-sm sm:col-span-2"><span className="text-muted">제품명 *</span><input name="name" required defaultValue={p?.name} className="input mt-1" /></label>
          <label className="block text-sm"><span className="text-muted">브랜드</span>
            <select name="brandId" defaultValue={p?.brandId ?? ""} className="input mt-1"><option value="">선택</option>{brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
          <label className="block text-sm"><span className="text-muted">slug (비우면 자동)</span><input name="slug" defaultValue={p?.slug} className="input mt-1" /></label>
          <label className="block text-sm"><span className="text-muted">동물</span>
            <select name="species" defaultValue={p?.species ?? "dog"} className="input mt-1"><option value="dog">강아지</option><option value="cat">고양이</option></select></label>
          <label className="block text-sm"><span className="text-muted">종류</span>
            <select name="category" defaultValue={p?.category ?? "dry"} className="input mt-1">{Object.entries(CATEGORY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
          <F name="lifeStage" label="급여 단계" placeholder="전연령 / 퍼피 / 어덜트 / 시니어" />
          <F name="imageUrl" label="이미지 URL" placeholder="https://..." />
          <F name="weightOptions" label="용량" placeholder="1.8kg, 5.4kg, 11.3kg" />
          <F name="priceNote" label="가격 메모" placeholder="약 1.2만원/kg (2026.10 기준)" />
          <F name="affiliateUrl" label="판매처/제휴 링크" placeholder="https://..." />
        </section>

        <section className="card p-5">
          <h2 className="font-bold">원료 (라벨 원문)</h2>
          <p className="text-xs text-muted mt-1">라벨에 적힌 순서 그대로 쉼표로 구분해 붙여넣으세요. 저장하면 성분 사전과 자동 매칭됩니다.</p>
          <textarea name="ingredientsRaw" rows={6} defaultValue={p?.ingredientsRaw ?? ""} className="input mt-2" placeholder="닭고기 20%, 닭고기분, 현미, 귀리, 닭지방(혼합 토코페롤로 보존), 건조 비트펄프, ..." />
          {matched && matched.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {matched.map((m, i) => <span key={i} className={`chip ${m.published ? "bg-brand-soft text-brand" : "bg-amber-100 text-amber-800"}`} title={m.name}>{m.rawName}</span>)}
            </div>
          )}
          {matched && matched.some((m) => !m.published) && <p className="mt-2 text-xs text-amber-800">주황색은 성분 사전에 해설이 없는(미공개) 원료입니다. 성분 메뉴에서 채워주세요.</p>}
        </section>

        <section className="card p-5 grid gap-3 grid-cols-2 sm:grid-cols-4">
          <h2 className="col-span-2 sm:col-span-4 font-bold">보장성분 (%)</h2>
          <F name="protein" label="조단백" type="number" step="0.1" />
          <F name="fat" label="조지방" type="number" step="0.1" />
          <F name="fiber" label="조섬유" type="number" step="0.1" />
          <F name="moisture" label="수분" type="number" step="0.1" />
          <F name="ash" label="조회분" type="number" step="0.1" />
          <F name="calcium" label="칼슘" type="number" step="0.01" />
          <F name="phosphorus" label="인" type="number" step="0.01" />
          <F name="kcalPer100g" label="kcal/100g" type="number" step="1" />
        </section>

        <section className="card p-5 space-y-3">
          <div className="flex items-center justify-between"><h2 className="font-bold">펫푸드랩 해설 (마크다운)</h2><span className={`text-sm ${len >= MIN_INDEXABLE_CHARS ? "text-brand" : "text-amber-700"}`}>{len}자 / 최소 {MIN_INDEXABLE_CHARS}자</span></div>
          <textarea name="commentary" rows={16} defaultValue={p?.commentary ?? ""} className="input font-mono text-sm" placeholder={"## 한눈에 보기\n\n이 사료는 ...\n\n## 원료 구성\n\n앞 5개 원료가 ...\n\n## 영양 수치 읽기\n\n조단백 32%는 ...\n\n## 이런 아이에게"} />
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block text-sm"><span className="text-muted">장점 (줄바꿈 구분)</span><textarea name="pros" rows={4} defaultValue={p?.pros ?? ""} className="input mt-1" /></label>
            <label className="block text-sm"><span className="text-muted">아쉬운 점 (줄바꿈 구분)</span><textarea name="cons" rows={4} defaultValue={p?.cons ?? ""} className="input mt-1" /></label>
          </div>
          <F name="suitableFor" label="이런 아이에게" placeholder="활동량 많은 성견, 곡물 알러지 의심 시 선택지" />
        </section>
      </div>

      <aside className="space-y-4">
        <div className="card p-5 space-y-3 sticky top-20">
          <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="published" defaultChecked={p?.published ?? false} /> 공개</label>
          <p className="text-xs text-muted">공개해도 해설이 {MIN_INDEXABLE_CHARS}자 미만이면 검색엔진에는 noindex로 전달됩니다.</p>
          <button className="btn btn-primary w-full justify-center">저장</button>
          {p && <a href={`/products/${p.slug}`} target="_blank" className="btn btn-ghost w-full justify-center">공개 페이지 보기 ↗</a>}
        </div>
      </aside>
      {p && (
        <div className="lg:col-span-3">
          <button formAction={deleteProduct} className="text-sm text-rose-700 hover:underline" formNoValidate>이 제품 삭제</button>
        </div>
      )}
    </form>
  );
}
