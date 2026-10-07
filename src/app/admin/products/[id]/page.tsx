import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { listBrands } from "@/lib/queries";
import AdminNav from "../../AdminNav";
import ProductForm from "../ProductForm";

export default async function EditProduct({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { saved } = await searchParams;
  const product = db.query.products.findFirst({ where: eq(schema.products.id, Number(id)), with: { ingredients: { with: { ingredient: true }, orderBy: (pi, { asc }) => [asc(pi.position)] } } }).sync();
  if (!product) notFound();
  const matched = product.ingredients.map((i) => ({ rawName: i.rawName, name: i.ingredient.name, published: i.ingredient.published }));
  return (
    <>
      <AdminNav title={`제품 수정: ${product.name}`} />
      {saved && <p className="mb-4 rounded-xl bg-brand-soft p-3 text-sm text-brand font-semibold">저장되었습니다. 원료 {matched.length}개가 매칭되었습니다.</p>}
      <ProductForm product={product} brands={listBrands()} matched={matched} />
    </>
  );
}
