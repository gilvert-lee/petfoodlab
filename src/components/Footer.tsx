import Link from "next/link";
import { SITE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 sm:grid-cols-3 text-sm">
        <div>
          <div className="font-extrabold text-lg">{SITE.name}</div>
          <p className="mt-2 text-muted leading-relaxed">{SITE.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Link href="/products" className="hover:underline">제품</Link>
          <Link href="/ingredients" className="hover:underline">성분 사전</Link>
          <Link href="/guides" className="hover:underline">가이드</Link>
          <Link href="/compare" className="hover:underline">비교</Link>
          <Link href="/about" className="hover:underline">소개</Link>
          <Link href="/contact" className="hover:underline">문의</Link>
          <Link href="/privacy" className="hover:underline">개인정보처리방침</Link>
          <Link href="/terms" className="hover:underline">이용약관</Link>
          <Link href="/disclaimer" className="hover:underline">면책 고지</Link>
        </div>
        <div className="text-muted leading-relaxed">
          <p>
            이 사이트의 정보는 제품 라벨과 공개 자료를 정리한 참고 자료이며, 수의학적 진단이나 처방을 대신하지 않습니다.
            반려동물의 건강 상태에 따른 식이 결정은 반드시 수의사와 상담하세요.
          </p>
          <p className="mt-3">© {new Date().getFullYear()} {SITE.name}. {SITE.url.replace(/^https?:\/\//, "")}</p>
        </div>
      </div>
    </footer>
  );
}
