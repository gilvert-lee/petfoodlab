import { sqliteTable, text, integer, real, primaryKey, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ─── 브랜드 ───────────────────────────────────────────────
export const brands = sqliteTable("brands", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  country: text("country"), // 원산지/본사 국가
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ─── 제품 ─────────────────────────────────────────────────
export const products = sqliteTable(
  "products",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    brandId: integer("brand_id").references(() => brands.id),
    species: text("species", { enum: ["dog", "cat"] }).notNull(),
    category: text("category", { enum: ["dry", "wet", "treat", "supplement", "raw"] }).notNull(),
    lifeStage: text("life_stage"), // puppy/adult/senior/all 등 자유 텍스트
    imageUrl: text("image_url"),
    // 라벨 원문(쉼표 구분 원료 목록) — 사실 데이터
    ingredientsRaw: text("ingredients_raw"),
    // 보장성분 (%)
    protein: real("protein"),
    fat: real("fat"),
    fiber: real("fiber"),
    moisture: real("moisture"),
    ash: real("ash"),
    calcium: real("calcium"),
    phosphorus: real("phosphorus"),
    kcalPer100g: real("kcal_per_100g"),
    weightOptions: text("weight_options"), // "1kg, 3kg, 7kg"
    priceNote: text("price_note"), // "약 1만원/kg (2026.10 기준)"
    // 운영자 해설 (마크다운). 600자 미만이면 noindex
    commentary: text("commentary"),
    pros: text("pros"), // 줄바꿈 구분
    cons: text("cons"),
    suitableFor: text("suitable_for"), // "활동량 많은 성견, 곡물 알러지 의심"
    affiliateUrl: text("affiliate_url"),
    published: integer("published", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (t) => [index("products_species_cat_idx").on(t.species, t.category), index("products_brand_idx").on(t.brandId)]
);

// ─── 성분 사전 ────────────────────────────────────────────
export const ingredients = sqliteTable("ingredients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(), // 표준명
  aliases: text("aliases"), // 쉼표 구분 동의어 (라벨 매칭용)
  group: text("group", {
    enum: ["protein", "carb", "fat", "fiber", "vitamin", "mineral", "additive", "preservative", "other"],
  }).notNull().default("other"),
  concern: text("concern", { enum: ["none", "caution", "controversial"] }).notNull().default("none"),
  summary: text("summary"), // 한 줄 요약
  body: text("body"), // 마크다운 본문 (800자 이상 목표)
  published: integer("published", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// 제품 ↔ 성분 (라벨 순서 보존)
export const productIngredients = sqliteTable(
  "product_ingredients",
  {
    productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    ingredientId: integer("ingredient_id").notNull().references(() => ingredients.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    rawName: text("raw_name").notNull(), // 라벨에 적힌 원문
  },
  (t) => [primaryKey({ columns: [t.productId, t.position] }), index("pi_ingredient_idx").on(t.ingredientId)]
);

// ─── 가이드(매거진) ───────────────────────────────────────
export const guides = sqliteTable("guides", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt"),
  body: text("body").notNull(), // 마크다운
  category: text("category").notNull().default("basics"), // basics/dog/cat/health/compare
  coverUrl: text("cover_url"),
  published: integer("published", { mode: "boolean" }).notNull().default(false),
  publishedAt: integer("published_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ─── 보호자 리뷰 (승인 후 오픈, 관리자 검수) ─────────────
export const reviews = sqliteTable(
  "reviews",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    nickname: text("nickname").notNull(),
    petName: text("pet_name"),
    petBreed: text("pet_breed"),
    petAgeYears: real("pet_age_years"),
    petWeightKg: real("pet_weight_kg"),
    rating: integer("rating").notNull(), // 1~5
    feedingWeeks: integer("feeding_weeks"),
    body: text("body").notNull(),
    status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (t) => [index("reviews_product_idx").on(t.productId, t.status)]
);

// ─── relations ────────────────────────────────────────────
export const brandsRelations = relations(brands, ({ many }) => ({ products: many(products) }));
export const productsRelations = relations(products, ({ one, many }) => ({
  brand: one(brands, { fields: [products.brandId], references: [brands.id] }),
  ingredients: many(productIngredients),
  reviews: many(reviews),
}));
export const ingredientsRelations = relations(ingredients, ({ many }) => ({ products: many(productIngredients) }));
export const productIngredientsRelations = relations(productIngredients, ({ one }) => ({
  product: one(products, { fields: [productIngredients.productId], references: [products.id] }),
  ingredient: one(ingredients, { fields: [productIngredients.ingredientId], references: [ingredients.id] }),
}));
export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
}));

export type Product = typeof products.$inferSelect;
export type Ingredient = typeof ingredients.$inferSelect;
export type Guide = typeof guides.$inferSelect;
export type Brand = typeof brands.$inferSelect;
export type Review = typeof reviews.$inferSelect;
