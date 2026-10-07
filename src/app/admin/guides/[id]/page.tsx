import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import AdminNav from "../../AdminNav";
import GuideForm from "../GuideForm";

export default async function EditGuide({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { saved } = await searchParams;
  const g = db.select().from(schema.guides).where(eq(schema.guides.id, Number(id))).get();
  if (!g) notFound();
  return (<><AdminNav title={`가이드 수정`} />{saved && <p className="mb-4 rounded-xl bg-brand-soft p-3 text-sm text-brand font-semibold">저장되었습니다.</p>}<GuideForm guide={g} /></>);
}
