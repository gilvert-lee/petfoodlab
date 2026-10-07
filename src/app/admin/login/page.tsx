import { login } from "../actions";
import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await isAdmin()) redirect("/admin");
  const { error } = await searchParams;
  return (
    <div className="mx-auto max-w-sm py-20">
      <h1 className="text-2xl font-extrabold">관리자 로그인</h1>
      <form action={login} className="mt-6 space-y-3">
        <input name="password" type="password" required autoFocus placeholder="비밀번호" className="input" />
        {error && <p className="text-sm text-rose-700">비밀번호가 올바르지 않습니다.</p>}
        <button className="btn btn-primary w-full justify-center">로그인</button>
      </form>
    </div>
  );
}
