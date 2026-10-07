import { submitReview } from "@/app/actions";

export default function ReviewForm({ productId }: { productId: number }) {
  return (
    <details className="mt-6 card p-5">
      <summary className="cursor-pointer font-bold">급여 후기 남기기</summary>
      <form action={submitReview} className="mt-4 grid gap-3 sm:grid-cols-2">
        <input type="hidden" name="productId" value={productId} />
        <input name="nickname" required maxLength={20} placeholder="닉네임 *" className="input" />
        <select name="rating" required className="input" defaultValue="5">
          {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)} {n}점</option>)}
        </select>
        <input name="petBreed" maxLength={30} placeholder="품종 (예: 말티즈)" className="input" />
        <input name="petAgeYears" type="number" step="0.5" min="0" max="30" placeholder="나이 (살)" className="input" />
        <input name="petWeightKg" type="number" step="0.1" min="0" max="100" placeholder="체중 (kg)" className="input" />
        <input name="feedingWeeks" type="number" min="1" max="520" placeholder="급여 기간 (주)" className="input" />
        <textarea name="body" required minLength={100} maxLength={3000} rows={6} placeholder="기호성, 변 상태, 털·피부 변화, 알러지 반응 등 실제 급여하며 느낀 점을 100자 이상 적어주세요. (검수 후 게시됩니다)" className="input sm:col-span-2" />
        {/* honeypot */}
        <input name="website" tabIndex={-1} autoComplete="off" className="hidden" />
        <div className="sm:col-span-2 flex items-center justify-between gap-3">
          <p className="text-xs text-muted">리뷰는 운영자 검수 후 게시되며, 광고성·복사 글은 게시되지 않습니다.</p>
          <button className="btn btn-primary">제출</button>
        </div>
      </form>
    </details>
  );
}
