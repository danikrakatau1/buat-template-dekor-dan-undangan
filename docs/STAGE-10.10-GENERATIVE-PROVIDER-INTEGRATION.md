# Stage #10.10 — Cloudflare Workers AI Generative Provider

Stage #10.10 connects MASTER TRANSFORM PROMPT V1 to Cloudflare Workers AI image-to-image generation through a Pages Function. OpenAI credentials are no longer required.

## Runtime flow

1. User uploads a source image in Wedding Template Studio.
2. Source Analyzer + Composition Resolver run in the browser.
3. MASTER TRANSFORM PROMPT V1 assembles the base style prompt, automatic theme adapter, scene adapter/structure locks, and negative constraints.
4. `src/artwork/providers/http-generative-provider.js` sends the source image and prompt contract to `/api/artwork-transform`.
5. `functions/api/artwork-transform.js` calls `env.AI.run()` using the Cloudflare Workers AI binding.
6. The transformed composite returns to decor injection, layer extraction, quality gate, Scene JSON builder, and Pixi/GSAP runtime.

## Models

Primary model:

- `@cf/stabilityai/stable-diffusion-xl-base-1.0`

Automatic fallback:

- `@cf/runwayml/stable-diffusion-v1-5-img2img`

Both accept img2img source data, positive prompt, negative prompt, generation dimensions, steps, strength, and guidance.

Default generation tuning:

- width: `1024`
- height: `1792`
- steps: `20`
- strength: `0.58`
- guidance: `7.5`

Optional environment overrides:

- `WORKERS_AI_IMAGE_MODEL`
- `WORKERS_AI_FALLBACK_MODEL`
- `WORKERS_AI_IMAGE_WIDTH`
- `WORKERS_AI_IMAGE_HEIGHT`
- `WORKERS_AI_IMAGE_STEPS`
- `WORKERS_AI_IMAGE_STRENGTH`
- `WORKERS_AI_IMAGE_GUIDANCE`

## Required Cloudflare setup

Pages Functions require a Workers AI binding. In the Cloudflare dashboard, add a Workers AI binding to this Pages project with the binding name exactly:

`AI`

The Pages Function accesses it as `env.AI`.

No OpenAI API key is required for this provider path.

## Health state

`GET /api/artwork-transform` reports whether `env.AI` is available and exposes the active primary/fallback model IDs. Studio shows:

- `Cloudflare Workers AI` when the binding is active
- `AI binding missing` when the endpoint exists but the binding has not been attached
- `Provider endpoint offline` when the Pages Function cannot be reached

## Failure behavior

The primary SDXL request is attempted first. If it fails, the function automatically retries with Stable Diffusion 1.5 img2img. If both fail, the error is surfaced to Studio rather than pretending a generated artwork exists.

The image source is limited to 10 MB in this integration. MASTER TRANSFORM PROMPT V1 and its automatic theme adapter remain the source of transformation instructions.

## Checkpoint

`Source → Analyze → MASTER PROMPT V1 → Theme Adapter → Workers AI SDXL → SD1.5 fallback → Generated Artwork → Decor → Layers → QA → Scene JSON → Pixi`
