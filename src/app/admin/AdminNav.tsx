import Link from "next/link";
import { logout } from "./actions";

export default function AdminNav({ title, action }: { title: string; action?: React.ReactNode }) {
  const items = [
    ["/admin", "대시보드"], ["/admin/products", "제품"], ["/admin/ingredients", "성분"], ["/admin/guides", "가이드"], ["/admin/brands", "브랜드"], ["/admin/reviews", "리뷰"],
  ];
  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {items.map(([h, l]) => <Link key={h} href={h} className="rounded-lg px-3 py-1.5 bg-white border border-line hover:bg-brand-soft font-semibold">{l}</Link>)}
        <form action={logout} className="ml-auto"><button className="text-muted hover:underline">로그아웃</button></form>
      </div>
      <div className="mt-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold">{title}</h1>
        {action}
      </div>
    </div>
  );
}
