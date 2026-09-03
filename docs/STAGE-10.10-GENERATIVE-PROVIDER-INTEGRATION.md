# Stage #10.10 — Generative Provider Integration

Stage #10.10 connects the existing MASTER TRANSFORM PROMPT V1 pipeline to a server-side generative image provider without exposing provider credentials in the browser.

## Runtime flow

1. User uploads a source image in Wedding Template Studio.
2. Source Analyzer + Composition Resolver run in the browser.
3. MASTER TRANSFORM PROMPT V1 assembles:
   - base engraving/wedding-stationery prompt
   - automatic theme adapter
   - scene adapter / structure locks
   - negative constraints
4. `src/artwork/providers/http-generative-provider.js` sends the source image and prompt contract to `/api/artwork-transform`.
5. Cloudflare Pages Function `functions/api/artwork-transform.js` calls the server-side image edit provider.
6. The transformed composite returns to the existing decor injection, layer extraction, quality gate, Scene JSON builder, and Pixi/GSAP runtime.

## Default server provider

The included Cloudflare Pages Function uses OpenAI's image edit API. The default model is `gpt-image-2`, with optional environment overrides.

Required Cloudflare Pages environment variable:

- `OPENAI_API_KEY`

Optional variables:

- `OPENAI_IMAGE_MODEL` — default `gpt-image-2`
- `OPENAI_IMAGE_SIZE` — default `1024x1536`
- `OPENAI_IMAGE_QUALITY`
- `OPENAI_IMAGE_INPUT_FIDELITY`

The API key remains server-side and is never returned to the client.

## Health state

`GET /api/artwork-transform` reports whether the endpoint is reachable and whether `OPENAI_API_KEY` is configured. The Studio panel displays:

- provider/model ready
- backend ready but key missing
- provider endpoint offline

## Failure behavior

The transform request never silently pretends that a generative result exists. Provider errors are surfaced in the Studio panel. The pre-existing source-preserving fallback remains available when no provider is installed, but the default #10.10 browser adapter is installed automatically when the Stage 10 Studio boots.

## Security

- no provider API key in client JavaScript
- no key in Scene JSON
- no caching of generated API responses by the Pages Function
- source upload is sent only when the user explicitly presses `AUTO CREATE ARTWORK`

## Checkpoint

Stage #10.10 completes the connection:

`Source → Analyze → MASTER PROMPT V1 → Theme Adapter → Server Provider → Generated Artwork → Decor → Layers → QA → Scene JSON → Pixi`
