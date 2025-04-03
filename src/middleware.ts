import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Define public routes that don't require authentication
  const publicRoutes = [
    "/", // Landing page
    "/auth/signin",
    "/auth/signup",
    "/auth/forgot-password",
  ];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Define static file patterns
  const isStaticFile =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/car-brands") ||
    pathname.endsWith(".js") ||
    pathname.endsWith(".css") ||
    pathname.endsWith(".map") ||
    pathname.endsWith(".svg");

  // Check for auth token using a simple cookie name
  const authToken = request.cookies.get("motocare-auth-token")?.value;
  const isAuthenticated = !!authToken;

  // Allow access to public routes and static files
  if (isPublicRoute || isStaticFile) {
    return response;
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && pathname.startsWith("/auth/")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users from protected pages
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api|public|.*\\.js|.*\\.css|.*\\.map|.*\\.svg).*)",
  ],
};
