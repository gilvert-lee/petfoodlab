import { NextRequest, NextResponse } from "next/server";

export function GET(req: NextRequest) {
  const u = req.nextUrl;
  const ids = ["p0", "p1", "p2"].map((k) => u.searchParams.get(k)).filter(Boolean);
  const dest = new URL("/compare", u.origin);
  if (ids.length) dest.searchParams.set("ids", ids.join(","));
  return NextResponse.redirect(dest);
}
