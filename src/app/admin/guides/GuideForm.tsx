import { saveGuide, deleteGuide } from "../actions";
import type { Guide } from "@/db/schema";
import { GUIDE_CATEGORY_LABEL } from "@/lib/site";
import { textLength } from "@/lib/utils";

export default function GuideForm({ guide: g }: { guide?: Guide }) {
  const len = textLength(g?.body);
  return (
    <form action={saveGuide} className="grid gap-6 lg:grid-cols-3">
      {g && <input type="hidden" name="id" value={g.id} />}
      <div className="lg:col-span-2 space-y-6">
        <section className="card p-5 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2"><span className="text-muted">제목 *</span><input name="title" required defaultValue={g?.title} className="input mt-1" /></label>
          <label className="block text-sm"><span className="text-muted">slug (비우면 자동)</span><input name="slug" defaultValue={g?.slug} className="input mt-1" /></label>
          <label className="block text-sm"><span className="text-muted">분류</span>
            <select name="category" defaultValue={g?.category ?? "basics"} className="input mt-1">{Object.entries(GUIDE_CATEGORY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
          <label className="block text-sm sm:col-span-2"><span className="text-muted">요약 (메타 설명·목록 노출, 80~150자)</span><textarea name="excerpt" rows={2} defaultValue={g?.excerpt ?? ""} className="input mt-1" /></label>
          <label className="block text-sm sm:col-span-2"><span className="text-muted">커버 이미지 URL</span><input name="coverUrl" defaultValue={g?.coverUrl ?? ""} className="input mt-1" placeholder="https://..." /></label>
        </section>
        <section className="card p-5">
          <div className="flex items-center justify-between"><h2 className="font-bold">본문 (마크다운) *</h2><span className={`text-sm ${len >= 1000 ? "text-brand" : "text-amber-700"}`}>{len}자 / 목표 1,500자</span></div>
          <textarea name="body" required rows={28} defaultValue={g?.body ?? ""} className="input mt-2 font-mono text-sm" placeholder={"## 소제목\n\n본문...\n\n제품이나 성분을 언급할 때는 링크를 거세요: [닭고기분](/ingredients/닭고기분)"} />
        </section>
      </div>
      <aside>
        <div className="card p-5 space-y-3 sticky top-20">
          <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="published" defaultChecked={g?.published ?? false} /> 공개</label>
          <p className="text-xs text-muted">처음 공개하는 시점이 발행일로 기록됩니다.</p>
          <button className="btn btn-primary w-full justify-center">저장</button>
          {g && <a href={`/guides/${g.slug}`} target="_blank" className="btn btn-ghost w-full justify-center">공개 페이지 보기 ↗</a>}
          {g && <button formAction={deleteGuide} formNoValidate className="w-full text-sm text-rose-700 hover:underline">삭제</button>}
        </div>
      </aside>
    </form>
  );
}
