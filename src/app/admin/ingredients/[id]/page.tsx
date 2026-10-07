import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import AdminNav from "../../AdminNav";
import IngredientForm from "../IngredientForm";

export default async function EditIngredient({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { saved } = await searchParams;
  const ing = db.select().from(schema.ingredients).where(eq(schema.ingredients.id, Number(id))).get();
  if (!ing) notFound();
  return (<><AdminNav title={`성분 수정: ${ing.name}`} />{saved && <p className="mb-4 rounded-xl bg-brand-soft p-3 text-sm text-brand font-semibold">저장되었습니다.</p>}<IngredientForm ingredient={ing} /></>);
}
