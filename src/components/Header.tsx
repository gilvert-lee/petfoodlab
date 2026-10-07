import Link from "next/link";
import { SITE } from "@/lib/site";

const NAV = [
  { href: "/products", label: "제품" },
  { href: "/ingredients", label: "성분 사전" },
  { href: "/guides", label: "가이드" },
  { href: "/compare", label: "비교" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight text-xl">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white text-sm">랩</span>
          {SITE.name}
        </Link>
        <nav className="hidden sm:flex items-center gap-1 text-sm font-semibold">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-lg px-3 py-2 hover:bg-brand-soft">
              {n.label}
            </Link>
          ))}
        </nav>
        <form action="/products" className="hidden md:block">
          <input name="q" placeholder="제품·브랜드 검색" className="input !w-56 !py-1.5 !text-sm" />
        </form>
      </div>
      <nav className="sm:hidden flex gap-1 overflow-x-auto px-4 pb-2 text-sm font-semibold">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className="whitespace-nowrap rounded-lg px-3 py-1.5 bg-white border border-line">
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
