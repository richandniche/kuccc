import { auth } from "@/auth";

// Auth.js v5 returns a function that satisfies the Next.js proxy/middleware
// signature; the `authorized` callback in auth.ts decides who can pass.
export default auth;

export const config = {
  matcher: [
    // Run on everything except static assets, the auth API, and the
    // dev-tools/Next internals.
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
