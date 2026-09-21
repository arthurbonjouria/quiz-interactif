import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const path = req.nextUrl.pathname;
  const role = (req.auth?.user as { role?: string } | undefined)?.role;

  if (path.startsWith("/student")) {
    if (role !== "student") {
      return NextResponse.redirect(new URL("/student/login", req.url));
    }
    return;
  }

  if (role !== "admin") {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
});

export const config = {
  matcher: ["/admin", "/admin/((?!login).*)", "/student", "/student/((?!login).*)"],
};
