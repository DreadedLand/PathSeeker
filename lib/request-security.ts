import { auth } from "@clerk/nextjs/server";

import { ApiRouteError } from "@/lib/api-response";

export async function requireAuthenticatedRequest() {
  const { userId } = await auth();
  if (!userId) {
    throw new ApiRouteError(401, "UNAUTHORIZED", "Authentication required.");
  }
  return userId;
}

export function enforceSameOrigin(request: Request) {
  const originHeader = request.headers.get("origin");
  const secFetchSite = request.headers.get("sec-fetch-site");

  if (!originHeader) {
    // In production, require explicit browser same-origin intent.
    if (process.env.NODE_ENV === "production") {
      if (!secFetchSite || (secFetchSite !== "same-origin" && secFetchSite !== "none")) {
        throw new ApiRouteError(403, "UNAUTHORIZED", "Invalid request origin.");
      }
    }
    return;
  }

  const requestOrigin = new URL(request.url).origin;
  if (originHeader !== requestOrigin) {
    throw new ApiRouteError(403, "UNAUTHORIZED", "Invalid request origin.");
  }
}

export function enforceMaxContentLength(request: Request, maxBytes: number) {
  const contentLength = request.headers.get("content-length");
  if (!contentLength) {
    return;
  }

  const bytes = Number(contentLength);
  if (Number.isFinite(bytes) && bytes > maxBytes) {
    throw new ApiRouteError(413, "BAD_REQUEST", "Request body is too large.");
  }
}
