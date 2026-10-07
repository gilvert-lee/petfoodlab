import { db, schema } from "@/db";
import { and, desc, eq, inArray, like, or, sql, count, avg } from "drizzle-orm";
import { MIN_INDEXABLE_CHARS } from "./site";
import { textLength } from "./utils";

const { products, ingredients, guides, brands, productIngredients, reviews } = schema;

// ─── 제품 ─────────────────────────────────────────────────
export type ProductFilter = { species?: string; category?: string; q?: string; brand?: string };

export function listProducts(f: ProductFilter = {}, limit = 60) {
  const conds = [eq(products.published, true)];
  if (f.species === "dog" || f.species === "cat") conds.push(eq(products.species, f.species));
  if (f.category && ["dry", "wet", "treat", "supplement", "raw"].includes(f.category))
    conds.push(eq(products.category, f.category as "dry"));
  if (f.q) conds.push(or(like(products.name, `%${f.q}%`), like(brands.name, `%${f.q}%`))!);
  if (f.brand) conds.push(eq(brands.slug, f.brand));
  return db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      species: products.species,
      category: products.category,
      lifeStage: products.lifeStage,
      imageUrl: products.imageUrl,
      protein: products.protein,
      fat: products.fat,
      kcalPer100g: products.kcalPer100g,
      brandName: brands.name,
      brandSlug: brands.slug,
      commentary: products.commentary,
    })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .where(and(...conds))
    .orderBy(desc(products.updatedAt))
    .limit(limit)
    .all();
}

export function getProductBySlug(slug: string) {
  return db.query.products.findFirst({
    where: and(eq(products.slug, slug), eq(products.published, true)),
    with: {
      brand: true,
      ingredients: { with: { ingredient: true }, orderBy: (pi, { asc }) => [asc(pi.position)] },
      reviews: { where: eq(reviews.status, "approved"), orderBy: (r, { desc }) => [desc(r.createdAt)] },
    },
  }).sync();
}

export function getProductsByIds(ids: number[]) {
  if (!ids.length) return [];
  return db.query.products.findMany({
    where: and(inArray(products.id, ids), eq(products.published, true)),
    with: { brand: true, ingredients: { with: { ingredient: true }, orderBy: (pi, { asc }) => [asc(pi.position)] } },
  }).sync();
}

export function relatedProducts(p: { id: number; species: string; category: string }, limit = 6) {
  return db
    .select({ id: products.id, slug: products.slug, name: products.name, brandName: brands.name, imageUrl: products.imageUrl, protein: products.protein, fat: products.fat })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .where(and(eq(products.published, true), eq(products.species, p.species as "dog"), eq(products.category, p.category as "dry"), sql`${products.id} != ${p.id}`))
    .orderBy(desc(products.updatedAt))
    .limit(limit)
    .all();
}

export function isProductIndexable(p: { commentary: string | null }) {
  return textLength(p.commentary) >= MIN_INDEXABLE_CHARS;
}

// ─── 성분 ─────────────────────────────────────────────────
export function listIngredients(group?: string, q?: string) {
  const conds = [eq(ingredients.published, true)];
  if (group) conds.push(eq(ingredients.group, group as "other"));
  if (q) conds.push(or(like(ingredients.name, `%${q}%`), like(ingredients.aliases, `%${q}%`))!);
  return db
    .select({
      id: ingredients.id,
      slug: ingredients.slug,
      name: ingredients.name,
      group: ingredients.group,
      concern: ingredients.concern,
      summary: ingredients.summary,
      productCount: count(productIngredients.productId),
    })
    .from(ingredients)
    .leftJoin(productIngredients, eq(productIngredients.ingredientId, ingredients.id))
    .where(and(...conds))
    .groupBy(ingredients.id)
    .orderBy(ingredients.name)
    .all();
}

export function getIngredientBySlug(slug: string) {
  const ing = db.query.ingredients.findFirst({ where: and(eq(ingredients.slug, slug), eq(ingredients.published, true)) }).sync();
  if (!ing) return null;
  const used = db
    .select({ id: products.id, slug: products.slug, name: products.name, brandName: brands.name, position: productIngredients.position, species: products.species })
    .from(productIngredients)
    .innerJoin(products, eq(products.id, productIngredients.productId))
    .leftJoin(brands, eq(products.brandId, brands.id))
    .where(and(eq(productIngredients.ingredientId, ing.id), eq(products.published, true)))
    .orderBy(productIngredients.position)
    .limit(50)
    .all();
  return { ...ing, usedIn: used };
}

export function isIngredientIndexable(i: { body: string | null }) {
  return textLength(i.body) >= MIN_INDEXABLE_CHARS;
}

// ─── 가이드 ───────────────────────────────────────────────
export function listGuides(category?: string, limit = 50) {
  const conds = [eq(guides.published, true)];
  if (category) conds.push(eq(guides.category, category));
  return db.select().from(guides).where(and(...conds)).orderBy(desc(guides.publishedAt)).limit(limit).all();
}

export function getGuideBySlug(slug: string) {
  return db.query.guides.findFirst({ where: and(eq(guides.slug, slug), eq(guides.published, true)) }).sync();
}

// ─── 브랜드 ───────────────────────────────────────────────
export function listBrands() {
  return db.select().from(brands).orderBy(brands.name).all();
}

// ─── 홈 통계 ──────────────────────────────────────────────
export function siteStats() {
  const p = db.select({ c: count() }).from(products).where(eq(products.published, true)).get()?.c ?? 0;
  const i = db.select({ c: count() }).from(ingredients).where(eq(ingredients.published, true)).get()?.c ?? 0;
  const g = db.select({ c: count() }).from(guides).where(eq(guides.published, true)).get()?.c ?? 0;
  const r = db.select({ c: count() }).from(reviews).where(eq(reviews.status, "approved")).get()?.c ?? 0;
  return { products: p, ingredients: i, guides: g, reviews: r };
}

export function productRating(productId: number) {
  const row = db
    .select({ avg: avg(reviews.rating), c: count() })
    .from(reviews)
    .where(and(eq(reviews.productId, productId), eq(reviews.status, "approved")))
    .get();
  return { avg: row?.avg ? +Number(row.avg).toFixed(1) : null, count: row?.c ?? 0 };
}
