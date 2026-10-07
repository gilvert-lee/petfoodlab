import { marked } from "marked";

/** 한글 포함 slug 생성 (URL-safe, 한글 유지) */
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function renderMarkdown(md: string | null | undefined): string {
  if (!md) return "";
  return marked.parse(md, { async: false, gfm: true, breaks: true }) as string;
}

export function textLength(md: string | null | undefined): number {
  if (!md) return 0;
  return md.replace(/[#*_>`\-\[\]()!\n\r]/g, "").replace(/\s+/g, "").length;
}

export function splitLines(s: string | null | undefined): string[] {
  return (s ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

export function formatDate(d: Date | number | null | undefined): string {
  if (!d) return "";
  const date = typeof d === "number" ? new Date(d) : d;
  return date.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

/** 보장성분 → 건물 기준(dry matter basis) 및 탄수화물 추정치 */
export function deriveNutrition(p: {
  protein: number | null;
  fat: number | null;
  fiber: number | null;
  moisture: number | null;
  ash: number | null;
}) {
  const moisture = p.moisture ?? 10;
  const dm = 100 - moisture;
  const ash = p.ash ?? 7;
  const carbs =
    p.protein != null && p.fat != null
      ? Math.max(0, 100 - moisture - p.protein - p.fat - (p.fiber ?? 0) - ash)
      : null;
  const dmb = (v: number | null) => (v == null || dm <= 0 ? null : +((v / dm) * 100).toFixed(1));
  return {
    carbsEstimate: carbs == null ? null : +carbs.toFixed(1),
    proteinDmb: dmb(p.protein),
    fatDmb: dmb(p.fat),
    carbsDmb: dmb(carbs),
    assumedMoisture: p.moisture == null,
    assumedAsh: p.ash == null,
  };
}

export function stars(rating: number) {
  return "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));
}
