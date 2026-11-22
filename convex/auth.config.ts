import type { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      // Set CLERK_FRONTEND_API_URL in the Convex dashboard (Settings > Environment Variables)
      domain: process.env.CLERK_FRONTEND_API_URL!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
