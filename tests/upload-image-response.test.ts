import { afterEach, describe, expect, it, vi } from 'vitest';

import { uploadImage } from '../api/action/upload-image';
import { setLatestGraphqlHeaders } from '../src/sdk/request-headers';

describe('uploadImage response normalization', () => {
  afterEach(() => {
    setLatestGraphqlHeaders(null);
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('uploads INIT -> APPEND -> FINALIZE and normalizes response', async () => {
    const initPayload = {
      media_id: 1900000000000000000,
      media_id_string: '1900000000000000001',
      media_key: '3_1900000000000000001',
      expires_after_secs: 86400
    };
    const finalizePayload = {
      media_id: 1900000000000000000,
      media_id_string: '1900000000000000001',
      media_key: '3_1900000000000000001',
      size: 9,
      expires_after_secs: 86400,
      image: {
        image_type: 'image/jpeg',
        w: 640,
        h: 360
      }
    };

    const mockFetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.includes('command=INIT')) {
        return new Response(JSON.stringify(initPayload), {
          status: 202,
          headers: { 'content-type': 'application/json' }
        });
      }

      if (url.includes('command=APPEND')) {
        const headers = (init?.headers ?? {}) as Record<string, string>;
        expect(headers['content-type']).toBeUndefined();
        expect(init?.body).toBeInstanceOf(FormData);

        return new Response(null, {
          status: 204
        });
      }

      if (url.includes('command=FINALIZE')) {
        expect(url).toContain('original_md5=00000000000000000000000000000000');

        return new Response(JSON.stringify(finalizePayload), {
          status: 201,
          headers: { 'content-type': 'application/json' }
        });
      }

      throw new Error(`unexpected upload url: ${url}`);
    });

    vi.stubGlobal('fetch', mockFetch);

    const file = new Blob(['123456789'], { type: 'image/jpeg' });
    const response = await uploadImage({
      file,
      originalMd5: '00000000000000000000000000000000'
    });

    expect(response.success).toBe(true);
    expect(response.mediaId).toBe('1900000000000000001');
    expect(response.mediaKey).toBe('3_1900000000000000001');
    expect(response.segmentCount).toBe(1);
    expect(response.image).toEqual({
      imageType: 'image/jpeg',
      width: 640,
      height: 360
    });
    expect(response.errors).toBeUndefined();
    expect(response.__original.finalize).toEqual(finalizePayload);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('splits APPEND uploads by chunkSize', async () => {
    const mockFetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes('command=INIT')) {
        return new Response(
          JSON.stringify({
            media_id_string: '1900000000000000001'
          }),
          {
            status: 202,
            headers: { 'content-type': 'application/json' }
          }
        );
      }

      if (url.includes('command=APPEND')) {
        return new Response(null, {
          status: 204
        });
      }

      if (url.includes('command=FINALIZE')) {
        return new Response(
          JSON.stringify({
            media_id_string: '1900000000000000001'
          }),
          {
            status: 201,
            headers: { 'content-type': 'application/json' }
          }
        );
      }

      throw new Error(`unexpected upload url: ${url}`);
    });

    vi.stubGlobal('fetch', mockFetch);

    await uploadImage({
      file: new Blob(['abcdefghij'], { type: 'image/jpeg' }),
      chunkSize: 4
    });

    const appendUrls = mockFetch.mock.calls
      .map((call) => String(call[0]))
      .filter((url) => url.includes('command=APPEND'));

    expect(appendUrls).toHaveLength(3);
    expect(appendUrls[0]).toContain('segment_index=0');
    expect(appendUrls[1]).toContain('segment_index=1');
    expect(appendUrls[2]).toContain('segment_index=2');
    expect(mockFetch).toHaveBeenCalledTimes(5);
  });
});
