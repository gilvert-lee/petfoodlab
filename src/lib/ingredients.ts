import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { slugify } from "./utils";

/**
 * 라벨 원문("닭고기 25%, 현미, 닭지방(혼합 토코페롤로 보존), ...")을
 * 원료 토큰으로 분리. 괄호 안 쉼표는 보존.
 */
export function tokenizeLabel(raw: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of raw) {
    if (ch === "(" || ch === "[") depth++;
    if (ch === ")" || ch === "]") depth = Math.max(0, depth - 1);
    if ((ch === "," || ch === "、" || ch === "，") && depth === 0) {
      if (cur.trim()) out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out.map((t) => t.replace(/\s+/g, " ").replace(/\.$/, ""));
}

/** 매칭용 정규화: 괄호·퍼센트·공백 제거, 소문자 */
export function normalizeName(s: string): string {
  return s
    .replace(/\([^)]*\)|\[[^\]]*\]/g, "")
    .replace(/\d+(\.\d+)?\s*%/g, "")
    .replace(/\s+/g, "")
    .toLowerCase()
    .trim();
}

/**
 * 토큰 목록을 성분 사전과 매칭하고 product_ingredients 를 재작성.
 * 사전에 없는 원료는 draft(미공개) 성분으로 자동 생성해 관리자가 나중에 채우게 한다.
 */
export function syncProductIngredients(productId: number, raw: string | null) {
  db.delete(schema.productIngredients).where(eq(schema.productIngredients.productId, productId)).run();
  if (!raw?.trim()) return { matched: 0, created: 0 };

  const all = db.select().from(schema.ingredients).all();
  const index = new Map<string, number>();
  for (const ing of all) {
    index.set(normalizeName(ing.name), ing.id);
    for (const a of (ing.aliases ?? "").split(",")) {
      const k = normalizeName(a);
      if (k) index.set(k, ing.id);
    }
  }

  let matched = 0;
  let created = 0;
  const tokens = tokenizeLabel(raw);
  const rows: (typeof schema.productIngredients.$inferInsert)[] = [];
  tokens.forEach((token, i) => {
    const key = normalizeName(token);
    if (!key) return;
    let id = index.get(key);
    if (id) matched++;
    else {
      const baseName = token.replace(/\([^)]*\)/g, "").replace(/\d+(\.\d+)?\s*%/g, "").trim() || token;
      let slug = slugify(baseName) || `ingredient-${Date.now()}-${i}`;
      const exists = db.select({ id: schema.ingredients.id }).from(schema.ingredients).where(eq(schema.ingredients.slug, slug)).get();
      if (exists) slug = `${slug}-${i}`;
      const inserted = db
        .insert(schema.ingredients)
        .values({ slug, name: baseName, published: false, group: "other", concern: "none" })
        .returning({ id: schema.ingredients.id })
        .get();
      id = inserted.id;
      index.set(key, id);
      created++;
    }
    rows.push({ productId, ingredientId: id, position: i, rawName: token });
  });
  if (rows.length) db.insert(schema.productIngredients).values(rows).run();
  return { matched, created };
}
