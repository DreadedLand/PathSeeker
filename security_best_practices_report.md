# Security Best Practices Report

## Executive Summary
Scope covered backend/API and DB-facing code in Next.js route handlers and Convex functions/schema.

All previously tracked findings (SBP-001, SBP-002, SBP-003) are now implemented in code and marked **Closed**.
The current codebase is in a stronger secure-by-default state for production. One operational caveat remains: app-level rate limiting is in-memory and should be paired with edge/provider rate limiting for multi-instance deployments.

## Critical Findings
None.

## High Findings
None.

## Medium Findings
None open.

## Low Findings
None open.

## Closed Findings

### SBP-001: Tasks data was not tenant-scoped in DB model/query
- Severity: Medium
- Status: Closed
- Location:
  - `/Users/egeuysal/Developer/finder/convex/schema.ts:18`
  - `/Users/egeuysal/Developer/finder/convex/tasks.ts:11`
- Remediation:
  - Added `userToken` to `tasks` schema and indexed with `by_user`.
  - Updated tasks query to scope results by authenticated `tokenIdentifier`.
- Security impact:
  - Prevents cross-user task data exposure in multi-tenant scenarios.

### SBP-002: No server-side rate limiting on expensive AI/maps endpoints
- Severity: Medium
- Status: Closed
- Location:
  - `/Users/egeuysal/Developer/finder/lib/rate-limit.ts:1`
  - `/Users/egeuysal/Developer/finder/app/api/plan-route/route.ts:82`
  - `/Users/egeuysal/Developer/finder/app/api/transcribe/route.ts:48`
  - `/Users/egeuysal/Developer/finder/app/api/reverse-geocode/route.ts:28`
- Remediation:
  - Added shared app-level rate limiter with endpoint-specific budgets.
  - Enforced per-user limits on plan-route, transcribe, and reverse-geocode endpoints.
- Security impact:
  - Reduces abuse and cost-amplification risk from authenticated endpoint misuse.

### SBP-003: CSRF defense relied only on Origin header presence
- Severity: Low
- Status: Closed
- Location:
  - `/Users/egeuysal/Developer/finder/lib/request-security.ts:13`
- Remediation:
  - `enforceSameOrigin` now checks `Sec-Fetch-Site` when `Origin` is absent.
  - Production requests without explicit same-origin intent are rejected.
- Security impact:
  - Hardens state-changing routes against non-standard cross-site request patterns.

## Additional Remediations Already in Place

### Closed-4: Middleware and route-level auth/origin/body controls
- Location:
  - `/Users/egeuysal/Developer/finder/proxy.ts:4`
  - `/Users/egeuysal/Developer/finder/lib/request-security.ts:5`
- Notes:
  - Protected `/workspace(.*)` and `/api(.*)` via Clerk middleware.
  - Added centralized `requireAuthenticatedRequest`, `enforceSameOrigin`, and request-size limits.

### Closed-5: Input validation hardening and error sanitization
- Location:
  - `/Users/egeuysal/Developer/finder/lib/schemas/trip.ts:1`
  - `/Users/egeuysal/Developer/finder/lib/api-response.ts:1`
- Notes:
  - Strengthened runtime validation bounds for route planning inputs.
  - Kept client-facing errors generic for internal/unexpected failures.

## Production Notes

1. App-level limiter in `lib/rate-limit.ts` uses in-memory storage per process.
2. For horizontally scaled production deployments, enforce rate limits again at edge/WAF/provider layer.
3. Convex generated client files under `convex/_generated` should remain committed to git (per Convex best-practice guidance), not gitignored.
