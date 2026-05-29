// import { getUser } from "@/data/user";
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// // Route definitions
// const publicRoutes = [
//   "/",
//   "/login",
//   "/signup",
//   "/forgot-password",
//   "/reset-password",
//   "/verify-email",
//   "/cart",
//   "/faq",
//   "/chat",
//   "/login",
// ];

// // User accessible routes (authenticated users)
// const userRoutes = [
//   "/checkout",
//   "/profile",
//   "/orders",
//   "/user/addresses",
//   "/user/reservations",
//   "/loyalty",
//   "/notifications",
//   "/chat",
// ];

// // Staff accessible routes
// const staffRoutes = [
//   "/staff",
//   "/staff/dashboard",
//   "/staff/orders",
//   "/staff/tables",
//   "/staff/kitchen",
//   "/staff/bar",
// ];

// // Admin only routes
// const adminRoutes = [
//   "/admin",
//   "/admin/dashboard",
//   "/admin/users",
//   "/admin/orders",
//   "/admin/menu",
//   "/admin/tables",
//   "/admin/inventory",
//   "/admin/staff",
//   "/admin/reports",
//   "/admin/settings",
// ];

// function matchesAnyRoute(pathname: string, routes: string[]): boolean {
//   return routes.some((route) => {
//     if (route === pathname) return true;
//     if (route !== "/" && pathname.startsWith(route + "/")) return true;
//     return false;
//   });
// }

// // Create a session verification API endpoint (add this to app/api/auth/verify-session/route.ts)
// // Then call it from here

// // ⭐ This is the key change - function must be named 'proxy' (not 'middleware')
// export async function proxy(request: NextRequest) {
//   const token = request.cookies.get("auth_token")?.value;
//   const { pathname } = request.nextUrl;

//   // Skip static files
//   if (
//     pathname.startsWith("/_next") ||
//     pathname.startsWith("/favicon.ico") ||
//     pathname.includes(".")
//   ) {
//     return NextResponse.next();
//   }

//   // Allow public routes
//   if (matchesAnyRoute(pathname, publicRoutes)) {
//     return NextResponse.next();
//   }

//   // Redirect to login if not authenticated
//   if (!token) {
//     const loginUrl = new URL("/login", request.url);
//     loginUrl.searchParams.set("redirect", pathname);
//     return NextResponse.redirect(loginUrl);
//   }

//   const userRole = token
//     ? await getUser()
//         .then((user) => user?.role)
//         .catch(() => null)
//     : null;

//   // Check admin routes
//   if (matchesAnyRoute(pathname, adminRoutes) && userRole !== "ADMIN") {
//     return NextResponse.redirect(new URL("/unauthorized", request.url));
//   }

//   // Check staff routes
//   if (matchesAnyRoute(pathname, staffRoutes)) {
//     const allowedRoles = ["ADMIN", "MANAGER", "CHEF", "BARTENDER", "WAITER"];
//     if (!allowedRoles.includes(userRole as string)) {
//       return NextResponse.redirect(new URL("/unauthorized", request.url));
//     }
//   }

//   // Check user routes
//   if (matchesAnyRoute(pathname, userRoutes)) {
//     const allowedRoles = [
//       "ADMIN",
//       "MANAGER",
//       "CHEF",
//       "BARTENDER",
//       "WAITER",
//       "USER",
//     ];
//     if (!allowedRoles.includes(userRole as string)) {
//       return NextResponse.redirect(new URL("/login", request.url));
//     }
//   }

//   return NextResponse.next();
// }

// // Optional: Configure matcher (same as before)
// export const config = {
//   matcher: [
//     "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:ico|png|jpg|jpeg|gif|svg|css|js)$).*)",
//   ],
// };
