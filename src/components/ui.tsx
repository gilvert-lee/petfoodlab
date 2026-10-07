import Link from "next/link";
import { CATEGORY_LABEL, SPECIES_LABEL, CONCERN_LABEL, GROUP_LABEL, SITE } from "@/lib/site";
import { renderMarkdown } from "@/lib/utils";

export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-6xl px-4 ${className}`}>{children}</div>;
}

export function PageTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="py-8">
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{title}</h1>
      {sub && <p className="mt-2 text-muted text-lg">{sub}</p>}
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ href: "/", label: "홈" }, ...items].map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.label,
      ...(it.href ? { item: `${SITE.url}${it.href}` } : {}),
    })),
  };
  return (
    <nav className="pt-6 text-sm text-muted flex flex-wrap gap-1.5" aria-label="breadcrumb">
      <Link href="/" className="hover:underline">홈</Link>
      {items.map((it, i) => (
        <span key={i} className="flex gap-1.5">
          <span>/</span>
          {it.href ? <Link href={it.href} className="hover:underline">{it.label}</Link> : <span className="text-fg">{it.label}</span>}
        </span>
      ))}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </nav>
  );
}

export function Markdown({ md, className = "" }: { md: string | null | undefined; className?: string }) {
  return <div className={`prose-pfl ${className}`} dangerouslySetInnerHTML={{ __html: renderMarkdown(md) }} />;
}

export function SpeciesChip({ species }: { species: string }) {
  return <span className={`chip ${species === "dog" ? "bg-sky-100 text-sky-800" : "bg-violet-100 text-violet-800"}`}>{SPECIES_LABEL[species] ?? species}</span>;
}
export function CategoryChip({ category }: { category: string }) {
  return <span className="chip bg-stone-100 text-stone-700">{CATEGORY_LABEL[category] ?? category}</span>;
}
export function ConcernChip({ concern }: { concern: string }) {
  const c = CONCERN_LABEL[concern] ?? CONCERN_LABEL.none;
  return <span className={`chip ${c.className}`}>{c.label}</span>;
}
export function GroupChip({ group }: { group: string }) {
  return <span className="chip bg-brand-soft text-brand">{GROUP_LABEL[group] ?? group}</span>;
}

type ProductCardProps = {
  slug: string; name: string; brandName?: string | null; species: string; category: string;
  imageUrl?: string | null; protein?: number | null; fat?: number | null; lifeStage?: string | null;
};
export function ProductCard(p: ProductCardProps) {
  return (
    <Link href={`/products/${p.slug}`} className="card overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className="aspect-[4/3] bg-stone-100 flex items-center justify-center overflow-hidden">
        {p.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <span className="text-4xl">{p.species === "dog" ? "🐶" : "🐱"}</span>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="text-xs text-muted">{p.brandName}</div>
        <div className="font-bold leading-snug">{p.name}</div>
        <div className="flex gap-1.5 flex-wrap">
          <SpeciesChip species={p.species} /><CategoryChip category={p.category} />
          {p.lifeStage && <span className="chip bg-stone-100 text-stone-700">{p.lifeStage}</span>}
        </div>
        {(p.protein != null || p.fat != null) && (
          <div className="mt-auto pt-1 text-sm text-muted">
            조단백 <b className="text-fg">{p.protein ?? "-"}%</b> · 조지방 <b className="text-fg">{p.fat ?? "-"}%</b>
          </div>
        )}
      </div>
    </Link>
  );
}

/** 애드센스 광고 슬롯. 승인 후 NEXT_PUBLIC_ADSENSE_CLIENT 와 slot 지정. 미설정 시 아무것도 렌더하지 않음 */
export function AdSlot({ slot, className = "" }: { slot?: string; className?: string }) {
  if (!SITE.adsenseClient || !slot) return null;
  return (
    <div className={`my-8 ${className}`}>
      <ins className="adsbygoogle" style={{ display: "block" }} data-ad-client={SITE.adsenseClient} data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true" />
      <script dangerouslySetInnerHTML={{ __html: "(adsbygoogle = window.adsbygoogle || []).push({});" }} />
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <div className="card p-10 text-center text-muted">{text}</div>;
}

export function Disclaimer() {
  return (
    <p className="mt-10 rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900 leading-relaxed">
      이 페이지의 성분·영양 정보는 제품 라벨과 제조사 공개 자료를 기준으로 정리한 것이며, 제조사 사정에 따라 변경될 수 있습니다.
      건강·질환과 관련된 내용은 일반 참고용이며 수의학적 진단·처방을 대신하지 않습니다. 반려동물의 상태에 맞는 식이 선택은 수의사와 상담하세요.
    </p>
  );
}
