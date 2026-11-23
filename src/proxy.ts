import { clerkMiddleware } from "@clerk/nextjs/server";

// Clerk keeps the session fresh here. Access control is resource-based:
// AuthGate sends signed-out visitors to /sign-in, and every Convex function
// checks the caller's identity before reading or writing game data.
export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals, the PWA files and all static files, unless found in search params
    "/((?!_next|sw\\.js|manifest\\.webmanifest|offline\\.html|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Always run for Clerk-specific frontend API routes
    "/__clerk/(.*)",
  ],
};
