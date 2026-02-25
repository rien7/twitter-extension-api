# grok-translation

## Purpose
Translate a post text to a target language through Grok translation endpoint.

Typical usage:
- translate a specific post for display in extension UI,
- fetch translation on demand when user clicks a translate action,
- keep raw payload for debugging/parity checks.

## Endpoint
- Method: `POST`
- URL: `https://api.x.com/2/grok/translation.json`
- Body content type: `text/plain;charset=UTF-8` with JSON string body.

## Parameter Strategy

This module follows the `action + required business id` pattern:
- Required business field: `tweetId`.
- Stable defaults are centralized in `default.ts`.
- Callers may override low-level request details via `bodyOverride`, `headers`, and `endpoint`.

## Request Type
Type name: `GrokTranslationRequest`

### Core fields
- `tweetId`: Required target post id.
- `dstLang`: Optional destination language code (default `en`).
- `contentType`: Optional source content type (default `POST`).
- `bodyOverride`: Optional partial override for raw body fields.
- `headers` / `endpoint`: transport-level overrides.

### Default merge behavior
`buildGrokTranslationRequest(input)` merges in this order:
1. defaults from `default.ts`,
2. `bodyOverride`,
3. explicit business fields (`tweetId`, `dstLang`, `contentType`).

So `tweetId` always wins over `bodyOverride.id`.

## Response Type
Type name: `GrokTranslationResponse`

### Normalized top-level fields
- `success`: `true` when translated text exists and no error is reported.
- `targetTweetId`: requested target id.
- `dstLang`: requested destination language.
- `contentType`: translated content type (result fallback to request).
- `translatedText`: translated text content.
- `entities`: entity map returned by backend.
- `errorMessage` / `errors`: server error info when provided.
- `__original`: full server payload.

## Minimal usage example

```ts
import { grokTranslation } from '../api';

const translated = await grokTranslation({
  tweetId: '42'
});
```

## Override usage example

```ts
import { grokTranslation } from '../api';

const translated = await grokTranslation({
  tweetId: '42',
  dstLang: 'ja',
  contentType: 'POST',
  bodyOverride: {
    dst_lang: 'ja'
  }
});
```

## Error model and edge cases
- Empty `tweetId` throws `grok-translation requires a non-empty tweetId`.
- Empty `dstLang` / `contentType` throws validation error.
- Non-JSON response throws `grok-translation returned non-JSON response (...)`.
- Some responses may be wrapped as `data:...;base64,...`; fetch layer decodes and parses this format before failing.
- Stream-like responses with multiple JSON fragments are merged and text chunks are assembled.
- Non-2xx response throws server message from `errors[0].message` or top-level `error` when available.

## Security and stability
- Never persist real auth/cookie/csrf/token values into source files.
- Endpoint behavior may drift with X experiments; refresh defaults from latest capture when needed.
- Prefer normalized fields in business logic and use `__original` for compatibility/debugging.
