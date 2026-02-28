# upload-image

## Purpose
Upload image binary data to Twitter/X media endpoint and return a reusable `mediaId` for `create-tweet`.

Typical usage:
- upload image selected from file input,
- pass uploaded `mediaId` into `create-tweet`,
- keep upload and tweet as two explicit steps for clear retry/error handling.

## Endpoint
- Method: `POST`
- Path: `https://upload.x.com/i/media/upload.json`
- Commands:
  - `INIT`
  - `APPEND`
  - `FINALIZE`

## Parameter Strategy

This module uses `action-minimal-input` with staged upload:
1. `INIT`: create media session (`total_bytes`, `media_type`, `media_category`),
2. `APPEND`: upload one or more binary chunks,
3. `FINALIZE`: complete upload and get canonical media metadata.

Defaults are centralized in `default.ts`.

## Request Type
Type name: `UploadImageRequest`

### Core fields
- `file`: required image `Blob`/`File`.
- `fileName`: optional multipart filename (defaults to `File.name` or `blob`).
- `mediaType`: optional MIME type (defaults to `file.type` or `image/jpeg`).
- `mediaCategory`: optional media category (defaults to `tweet_image`).
- `chunkSize`: optional APPEND chunk bytes (defaults to `5 * 1024 * 1024`).
- `originalMd5`: optional `FINALIZE` query field `original_md5`.
- `headers`, `endpoint`: optional protocol overrides.

### Validation
- throws when `file` is missing,
- throws when `file.size <= 0`,
- throws when `chunkSize` is not a positive integer.

## Response Type
Type name: `UploadImageResponse`

### Normalized top-level fields
- `success`: true when upload reaches FINALIZE with valid media id and no API errors.
- `mediaId`: canonical media id string for tweet media entities.
- `mediaKey`: canonical media key.
- `size`: uploaded media size (bytes).
- `expiresAfterSecs`: upload expiry window.
- `image`: normalized image metadata (`imageType`, `width`, `height`).
- `segmentCount`: uploaded APPEND segment count.
- `processingState`, `checkAfterSecs`: FINALIZE processing info when returned.
- `errors`: merged API errors from INIT/FINALIZE/processing branch.
- `__original`: full staged payload (`init`, `append[]`, `finalize`).

## Error model and failure cases
- INIT/FINALIZE non-2xx throws with status and server error message (if present).
- APPEND non-2xx throws with segment index and response text snippet.
- INIT/FINALIZE non-JSON response throws parse error.
- INIT missing media id throws contract error.

## Minimal usage example

```ts
import { uploadImage } from '../api';

const uploaded = await uploadImage({
  file
});

console.log(uploaded.mediaId, uploaded.image?.width, uploaded.image?.height);
```

## Override/default-params example

```ts
import { uploadImage } from '../api';

const uploaded = await uploadImage({
  file,
  mediaType: 'image/png',
  mediaCategory: 'tweet_image',
  chunkSize: 2 * 1024 * 1024,
  originalMd5: '00000000000000000000000000000000'
});
```

## Integration with create-tweet

```ts
import { createTweet, uploadImage } from '../api';

const uploaded = await uploadImage({ file });

const tweet = await createTweet({
  tweetText: 'image tweet',
  mediaIds: uploaded.mediaId ? [uploaded.mediaId] : []
});
```

## Pagination
Not applicable. This is a one-shot action API.

## Security and stability notes
- Never persist real auth/cookie/csrf values into source files.
- Upload contract fields can change; refresh defaults from fresh captures when upload fails.
- `upload-image` currently targets image upload path (`tweet_image`) and does not implement video/gif processing polling workflow.
