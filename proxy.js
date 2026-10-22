import { NextResponse } from "next/server";

// ==========================================
// Rate Limit (in-memory — dev/small scale only)
// ==========================================
const rateLimitMap = new Map();

function cleanupRateLimit() {
  try {
    const now = Date.now();
    for (const [ip, data] of rateLimitMap.entries()) {
      if (now > data.resetTime) {
        rateLimitMap.delete(ip);
      }
    }
  } catch (e) {}
}

export function proxy(req) {
  try {
    // --- ১. Rate Limit ---
    try {
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        "127.0.0.1";

      const now = Date.now();
      const windowMs = 60 * 1000;
      const maxRequests = 60;

      if (rateLimitMap.size > 500) {
        cleanupRateLimit();
      }

      if (!rateLimitMap.has(ip)) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      } else {
        const userInfo = rateLimitMap.get(ip);
        if (now > userInfo.resetTime) {
          userInfo.count = 1;
          userInfo.resetTime = now + windowMs;
        } else {
          userInfo.count++;
          if (userInfo.count > maxRequests) {
            return new NextResponse(
              JSON.stringify({
                success: false,
                message: "Too many requests, please try again later.",
              }),
              { status: 429, headers: { "Content-Type": "application/json" } },
            );
          }
        }
      }
    } catch (rateLimitErr) {
      // ignore
    }

    const { pathname } = req.nextUrl;

    // ==========================================
    // ২. Public API paths (login ছাড়াই access)
    // ==========================================
    const publicApiPaths = [
      "/api/auth/login",
      "/api/auth/register",
      "/api/auth/reset-password",
      "/api/auth/logout",
      "/api/cron",
      "/api/admin/seed",
    ];
    const isPublicApi = publicApiPaths.some((path) =>
      pathname.startsWith(path),
    );

    // ==========================================
    // ৩. Public Pages (login ছাড়াই access)
    // ==========================================
    const publicPages = ["/login", "/register", "/reset-password"];
    const isPublicPage = publicPages.some(
      (path) => pathname === path || pathname.startsWith(path + "/"),
    );

    // ==========================================
    // ৪. Protected routes
    // ==========================================
    const protectedRoutes = [
      "/profile",
      "/wallet",
      "/game",
      "/gameroom",
      "/referral",
      "/admin",
      "/sub-admin",
      "/agent", // 🆕 এজেন্ট প্যানেল সুরক্ষিত
      "/api",
      "/deposit",
      "/withdraw",
    ];
    const isProtectedRoute = protectedRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/"),
    );

    // ==========================================
    // ৫. Security check (টোকেন আছে কি না)
    // ==========================================
    if (isProtectedRoute && !isPublicApi && !isPublicPage) {
      const token = req.cookies.get("token")?.value;

      if (!token) {
        // API request → JSON
        if (pathname.startsWith("/api")) {
          return NextResponse.json(
            {
              success: false,
              message: "অনুমোদিত নয়! সিকিউর কুকি বা সেশন পাওয়া যায়নি।",
            },
            { status: 401, headers: { "Content-Type": "application/json" } },
          );
        }

        // Page request → login
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // রোল চেক (Role Check) আমরা layout.js ফাইলে করছি।
      // proxy.js-এ শুধু টোকেন ভ্যালিডেশন নিশ্চিত করা হলো।
    }

    // ==========================================
    // ৬. Security headers
    // ==========================================
    const response = NextResponse.next();

    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch (error) {
    console.error("[Proxy Error]:", error);
    return NextResponse.next();
  }
}

// ==========================================
// Config — সম্পূর্ণ matcher
// ==========================================
export const config = {
  matcher: [
    "/profile",
    "/profile/:path*",
    "/wallet",
    "/wallet/:path*",
    "/game",
    "/game/:path*",
    "/gameroom/:path*",
    "/referral",
    "/referral/:path*",
    "/api",
    "/api/:path*",
    "/admin",
    "/admin/:path*",
    "/sub-admin",
    "/sub-admin/:path*",
    "/agent", // 🆕 এজেন্ট প্যানেল matcher
    "/agent/:path*", // 🆕 এজেন্ট প্যানেল sub-routes
    "/deposit",
    "/deposit/:path*",
    "/withdraw",
    "/withdraw/:path*",
  ],
};
