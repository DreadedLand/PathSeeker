# PathSeeker

PathSeeker is an AI-assisted route planner built for hackathon speed and real-world usefulness. Instead of manually entering stops one by one, users describe errands in plain language or record a voice note, and PathSeeker turns that into an ordered, traffic-aware route.

The goal is simple: reduce planning friction for everyday multi-stop trips like "Target, UPS, pharmacy, then home before 6."

## Why it matters

Most mapping apps are good at navigation after you know exactly where you want to go. They are much worse at the planning step:

- People think in intent, not structured stop lists.
- Daily errands often include vague references like `home`, `the gym`, or `the usual coffee place`.
- Multi-stop routes get annoying fast when time constraints and traffic are involved.

PathSeeker closes that gap by combining AI extraction, saved-place context, and route optimization into one workflow.

## What it does

- Accepts route requests in natural language.
- Supports voice-to-text transcription for spoken trip requests.
- Extracts stops and optional timing constraints from the request.
- Resolves places using saved locations and geocoding context.
- Optimizes stop order with Google routing data.
- Shows estimated total duration and arrival timing.
- Saves route history for quick reference.
- Lets users store saved places and reusable presets.

PathSeeker helps people plan errands the way they actually think: in plain language. Instead of forcing users to manually structure a route, it understands intent, resolves destinations, and returns an optimized plan with realistic timing.
