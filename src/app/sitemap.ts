export const dynamic = "force-dynamic";

import type { MetadataRoute } from "next";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { SITE } from "@/lib/site";
import { isProductIndexable, isIngredientIndexable } from "@/lib/queries";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;
  const products = db.select().from(schema.products).where(eq(schema.products.published, true)).all();
  const ingredients = db.select().from(schema.ingredients).where(eq(schema.ingredients.published, true)).all();
  const guides = db.select().from(schema.guides).where(eq(schema.guides.published, true)).all();

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/ingredients`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/guides`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/about`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.3 },
    ...products.filter(isProductIndexable).map((p) => ({ url: `${base}/products/${encodeURIComponent(p.slug)}`, lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...ingredients.filter(isIngredientIndexable).map((i) => ({ url: `${base}/ingredients/${encodeURIComponent(i.slug)}`, lastModified: i.updatedAt, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...guides.map((g) => ({ url: `${base}/guides/${encodeURIComponent(g.slug)}`, lastModified: g.updatedAt, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
