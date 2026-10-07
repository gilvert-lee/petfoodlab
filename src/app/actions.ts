"use server";

import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function submitReview(formData: FormData) {
  if (formData.get("website")) return; // honeypot
  const productId = Number(formData.get("productId"));
  const product = db.select({ slug: schema.products.slug }).from(schema.products).where(eq(schema.products.id, productId)).get();
  if (!product) return;

  const body = String(formData.get("body") ?? "").trim();
  const nickname = String(formData.get("nickname") ?? "").trim().slice(0, 20);
  const rating = Math.min(5, Math.max(1, Number(formData.get("rating")) || 5));
  if (body.length < 100 || !nickname) return;

  const num = (k: string) => {
    const v = formData.get(k);
    if (v == null || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  db.insert(schema.reviews)
    .values({
      productId,
      nickname,
      rating,
      body: body.slice(0, 3000),
      petBreed: String(formData.get("petBreed") ?? "").slice(0, 30) || null,
      petAgeYears: num("petAgeYears"),
      petWeightKg: num("petWeightKg"),
      feedingWeeks: num("feedingWeeks") ? Math.round(num("feedingWeeks")!) : null,
      status: "pending",
    })
    .run();

  redirect(`/products/${product.slug}?reviewed=1#reviews`);
}
