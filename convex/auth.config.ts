import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      domain: "https://clean-gibbon-56.clerk.accounts.dev",
      applicationID: "convex",
    },
    {
      // Keep old issuer temporarily to avoid breaking older sessions/environments.
      domain: "https://absolute-possum-33.clerk.accounts.dev",
      applicationID: "convex",
    },
  ]
} satisfies AuthConfig;
