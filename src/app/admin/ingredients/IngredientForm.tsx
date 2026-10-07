import { saveIngredient, deleteIngredient } from "../actions";
import type { Ingredient } from "@/db/schema";
import { GROUP_LABEL, CONCERN_LABEL, MIN_INDEXABLE_CHARS } from "@/lib/site";
import { textLength } from "@/lib/utils";

export default function IngredientForm({ ingredient: i }: { ingredient?: Ingredient }) {
  const len = textLength(i?.body);
  return (
    <form action={saveIngredient} className="grid gap-6 lg:grid-cols-3">
      {i && <input type="hidden" name="id" value={i.id} />}
      <div className="lg:col-span-2 space-y-6">
        <section className="card p-5 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm"><span className="text-muted">표준명 *</span><input name="name" required defaultValue={i?.name} className="input mt-1" placeholder="닭고기분" /></label>
          <label className="block text-sm"><span className="text-muted">slug (비우면 자동)</span><input name="slug" defaultValue={i?.slug} className="input mt-1" /></label>
          <label className="block text-sm sm:col-span-2"><span className="text-muted">동의어·영문명 (쉼표 구분, 라벨 매칭용)</span><input name="aliases" defaultValue={i?.aliases ?? ""} className="input mt-1" placeholder="닭고기 분말, 치킨밀, chicken meal, 건조 닭고기" /></label>
          <label className="block text-sm"><span className="text-muted">분류</span>
            <select name="group" defaultValue={i?.group ?? "other"} className="input mt-1">{Object.entries(GROUP_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
          <label className="block text-sm"><span className="text-muted">표시</span>
            <select name="concern" defaultValue={i?.concern ?? "none"} className="input mt-1">{Object.entries(CONCERN_LABEL).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></label>
          <label className="block text-sm sm:col-span-2"><span className="text-muted">한 줄 요약</span><input name="summary" defaultValue={i?.summary ?? ""} className="input mt-1" placeholder="닭고기에서 수분과 지방을 제거해 농축한 단백질원. 생닭고기보다 단백질 함량이 높다." /></label>
        </section>
        <section className="card p-5">
          <div className="flex items-center justify-between"><h2 className="font-bold">본문 (마크다운)</h2><span className={`text-sm ${len >= MIN_INDEXABLE_CHARS ? "text-brand" : "text-amber-700"}`}>{len}자 / 최소 {MIN_INDEXABLE_CHARS}자 (목표 800자)</span></div>
          <textarea name="body" rows={18} defaultValue={i?.body ?? ""} className="input mt-2 font-mono text-sm" placeholder={"## 무엇인가\n\n## 왜 사료에 넣는가\n\n## 주의할 점\n\n## 라벨에서 이렇게 표기된다"} />
        </section>
      </div>
      <aside>
        <div className="card p-5 space-y-3 sticky top-20">
          <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="published" defaultChecked={i?.published ?? false} /> 공개</label>
          <button className="btn btn-primary w-full justify-center">저장</button>
          {i && <a href={`/ingredients/${i.slug}`} target="_blank" className="btn btn-ghost w-full justify-center">공개 페이지 보기 ↗</a>}
          {i && <button formAction={deleteIngredient} formNoValidate className="w-full text-sm text-rose-700 hover:underline">삭제</button>}
        </div>
      </aside>
    </form>
  );
}
