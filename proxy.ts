import { NextResponse } from "next/server";
import { auth } from "./app/api/auth/[...nextauth]/auth";
import { routes } from "./config/routes";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const token = req.auth?.token;
  const isAdminRoute =
    pathname.startsWith("/admin") && pathname !== "/admin/login";

  // if (pathname === "/") {
  //   if (!token) {
  //     return NextResponse.redirect(new URL("/admin/login", req.url));
  //   } else {
  //     return NextResponse.redirect(
  //       new URL(routes.privateRoutes.admin.dashboard, req.url),
  //     );
  //   }
  // }

  if (isAdminRoute && !token) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  if (token && pathname === routes.publicRoutes.adminLogin) {
    return NextResponse.redirect(
      new URL(routes.privateRoutes.admin.dashboard, req.url),
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/", "/admin/:path*"],
};
