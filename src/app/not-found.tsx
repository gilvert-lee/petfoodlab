import Link from "next/link";
import { Container } from "@/components/ui";

export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <div className="text-6xl">🐾</div>
      <h1 className="mt-4 text-3xl font-extrabold">페이지를 찾을 수 없습니다</h1>
      <p className="mt-2 text-muted">주소가 바뀌었거나 삭제된 페이지입니다.</p>
      <div className="mt-6 flex justify-center gap-2">
        <Link href="/" className="btn btn-primary">홈으로</Link>
        <Link href="/products" className="btn btn-ghost">제품 둘러보기</Link>
      </div>
    </Container>
  );
}
