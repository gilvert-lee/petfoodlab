"use server";

import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkPassword, setAdminCookie, clearAdminCookie, requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { syncProductIngredients } from "@/lib/ingredients";

const s = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return v == null ? null : String(v).trim() || null;
};
const n = (fd: FormData, k: string) => {
  const v = s(fd, k);
  if (v == null) return null;
  const x = Number(v);
  return Number.isFinite(x) ? x : null;
};
const b = (fd: FormData, k: string) => fd.get(k) === "on";
const uniqueSlug = (table: "products" | "ingredients" | "guides" | "brands", base: string, excludeId?: number) => {
  let slug = slugify(base) || `${table}-${Date.now()}`;
  const t = schema[table];
  for (let i = 0; i < 50; i++) {
    const row = db.select({ id: t.id }).from(t).where(eq(t.slug, slug)).get();
    if (!row || row.id === excludeId) return slug;
    slug = `${slugify(base)}-${i + 2}`;
  }
  return `${slug}-${Date.now()}`;
};

// ─── 로그인 ───────────────────────────────────────────────
export async function login(fd: FormData) {
  const pw = String(fd.get("password") ?? "");
  if (!checkPassword(pw)) redirect("/admin/login?error=1");
  await setAdminCookie();
  redirect("/admin");
}
export async function logout() {
  await clearAdminCookie();
  redirect("/admin/login");
}

// ─── 브랜드 ───────────────────────────────────────────────
export async function saveBrand(fd: FormData) {
  await requireAdmin();
  const id = n(fd, "id");
  const name = s(fd, "name");
  if (!name) return;
  const data = { name, country: s(fd, "country"), description: s(fd, "description") };
  if (id) db.update(schema.brands).set(data).where(eq(schema.brands.id, id)).run();
  else db.insert(schema.brands).values({ ...data, slug: uniqueSlug("brands", s(fd, "slug") ?? name) }).run();
  revalidatePath("/");
  redirect("/admin/brands");
}
export async function deleteBrand(fd: FormData) {
  await requireAdmin();
  const id = n(fd, "id");
  if (id) db.delete(schema.brands).where(eq(schema.brands.id, id)).run();
  redirect("/admin/brands");
}

// ─── 제품 ─────────────────────────────────────────────────
export async function saveProduct(fd: FormData) {
  await requireAdmin();
  const id = n(fd, "id");
  const name = s(fd, "name");
  if (!name) return;
  const species = s(fd, "species") === "cat" ? "cat" : "dog";
  const category = (["dry", "wet", "treat", "supplement", "raw"].includes(s(fd, "category") ?? "") ? s(fd, "category") : "dry") as "dry";
  const data = {
    name,
    brandId: n(fd, "brandId"),
    species: species as "dog" | "cat",
    category,
    lifeStage: s(fd, "lifeStage"),
    imageUrl: s(fd, "imageUrl"),
    ingredientsRaw: s(fd, "ingredientsRaw"),
    protein: n(fd, "protein"), fat: n(fd, "fat"), fiber: n(fd, "fiber"), moisture: n(fd, "moisture"), ash: n(fd, "ash"),
    calcium: n(fd, "calcium"), phosphorus: n(fd, "phosphorus"), kcalPer100g: n(fd, "kcalPer100g"),
    weightOptions: s(fd, "weightOptions"), priceNote: s(fd, "priceNote"),
    commentary: s(fd, "commentary"), pros: s(fd, "pros"), cons: s(fd, "cons"), suitableFor: s(fd, "suitableFor"),
    affiliateUrl: s(fd, "affiliateUrl"),
    published: b(fd, "published"),
    updatedAt: new Date(),
  };
  let productId = id;
  if (id) {
    const slugInput = s(fd, "slug");
    db.update(schema.products).set({ ...data, ...(slugInput ? { slug: uniqueSlug("products", slugInput, id) } : {}) }).where(eq(schema.products.id, id)).run();
  } else {
    const row = db.insert(schema.products).values({ ...data, slug: uniqueSlug("products", s(fd, "slug") ?? name) }).returning({ id: schema.products.id }).get();
    productId = row.id;
  }
  syncProductIngredients(productId!, data.ingredientsRaw);
  revalidatePath("/");
  redirect(`/admin/products/${productId}?saved=1`);
}
export async function deleteProduct(fd: FormData) {
  await requireAdmin();
  const id = n(fd, "id");
  if (id) db.delete(schema.products).where(eq(schema.products.id, id)).run();
  redirect("/admin/products");
}

// ─── 성분 ─────────────────────────────────────────────────
export async function saveIngredient(fd: FormData) {
  await requireAdmin();
  const id = n(fd, "id");
  const name = s(fd, "name");
  if (!name) return;
  const groups = ["protein", "carb", "fat", "fiber", "vitamin", "mineral", "additive", "preservative", "other"];
  const concerns = ["none", "caution", "controversial"];
  const data = {
    name,
    aliases: s(fd, "aliases"),
    group: (groups.includes(s(fd, "group") ?? "") ? s(fd, "group") : "other") as "other",
    concern: (concerns.includes(s(fd, "concern") ?? "") ? s(fd, "concern") : "none") as "none",
    summary: s(fd, "summary"),
    body: s(fd, "body"),
    published: b(fd, "published"),
    updatedAt: new Date(),
  };
  let ingId = id;
  if (id) {
    const slugInput = s(fd, "slug");
    db.update(schema.ingredients).set({ ...data, ...(slugInput ? { slug: uniqueSlug("ingredients", slugInput, id) } : {}) }).where(eq(schema.ingredients.id, id)).run();
  } else {
    ingId = db.insert(schema.ingredients).values({ ...data, slug: uniqueSlug("ingredients", s(fd, "slug") ?? name) }).returning({ id: schema.ingredients.id }).get().id;
  }
  revalidatePath("/");
  redirect(`/admin/ingredients/${ingId}?saved=1`);
}
export async function deleteIngredient(fd: FormData) {
  await requireAdmin();
  const id = n(fd, "id");
  if (id) db.delete(schema.ingredients).where(eq(schema.ingredients.id, id)).run();
  redirect("/admin/ingredients");
}
/** 성분 사전이 갱신된 뒤 모든 제품의 원료 매칭을 다시 수행 */
export async function resyncAllProducts() {
  await requireAdmin();
  const all = db.select({ id: schema.products.id, raw: schema.products.ingredientsRaw }).from(schema.products).all();
  for (const p of all) syncProductIngredients(p.id, p.raw);
  revalidatePath("/");
  redirect("/admin/ingredients?resynced=1");
}

// ─── 가이드 ───────────────────────────────────────────────
export async function saveGuide(fd: FormData) {
  await requireAdmin();
  const id = n(fd, "id");
  const title = s(fd, "title");
  const body = s(fd, "body");
  if (!title || !body) return;
  const published = b(fd, "published");
  const data = {
    title,
    excerpt: s(fd, "excerpt"),
    body,
    category: s(fd, "category") ?? "basics",
    coverUrl: s(fd, "coverUrl"),
    published,
    updatedAt: new Date(),
  };
  let gid = id;
  if (id) {
    const existing = db.select({ publishedAt: schema.guides.publishedAt }).from(schema.guides).where(eq(schema.guides.id, id)).get();
    const slugInput = s(fd, "slug");
    db.update(schema.guides)
      .set({ ...data, publishedAt: existing?.publishedAt ?? (published ? new Date() : null), ...(slugInput ? { slug: uniqueSlug("guides", slugInput, id) } : {}) })
      .where(eq(schema.guides.id, id))
      .run();
  } else {
    gid = db.insert(schema.guides).values({ ...data, slug: uniqueSlug("guides", s(fd, "slug") ?? title), publishedAt: published ? new Date() : null }).returning({ id: schema.guides.id }).get().id;
  }
  revalidatePath("/");
  redirect(`/admin/guides/${gid}?saved=1`);
}
export async function deleteGuide(fd: FormData) {
  await requireAdmin();
  const id = n(fd, "id");
  if (id) db.delete(schema.guides).where(eq(schema.guides.id, id)).run();
  redirect("/admin/guides");
}

// ─── 리뷰 ─────────────────────────────────────────────────
export async function setReviewStatus(fd: FormData) {
  await requireAdmin();
  const id = n(fd, "id");
  const status = s(fd, "status");
  if (id && (status === "approved" || status === "rejected" || status === "pending"))
    db.update(schema.reviews).set({ status }).where(eq(schema.reviews.id, id)).run();
  revalidatePath("/");
  redirect("/admin/reviews");
}
export async function deleteReview(fd: FormData) {
  await requireAdmin();
  const id = n(fd, "id");
  if (id) db.delete(schema.reviews).where(eq(schema.reviews.id, id)).run();
  redirect("/admin/reviews");
}
