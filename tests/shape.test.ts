import { describe, expect, it } from 'vitest';

import { inferShape, redactSensitiveData, sanitizeHeaders } from '../src/shared/shape';

describe('shape inference', () => {
  it('infers nested object and array structures', () => {
    const shape = inferShape({
      id: '1',
      count: 2,
      data: [{ ok: true }, { ok: false, reason: 'x' }]
    });

    expect(shape.kind).toBe('object');
    expect(shape.properties?.id?.kind).toBe('string');
    expect(shape.properties?.count?.kind).toBe('number');
    expect(shape.properties?.data?.kind).toBe('array');
    expect(shape.properties?.data?.element?.kind).toBe('object');
    expect(shape.properties?.data?.element?.properties?.ok?.kind).toBe('boolean');
  });
});

describe('redaction', () => {
  it('redacts sensitive fields in payloads and headers', () => {
    const payload = redactSensitiveData({
      token: 'abc',
      nested: {
        authorization: 'Bearer x',
        normal: 'hello'
      }
    }) as Record<string, unknown>;

    expect(payload.token).toBe('[REDACTED]');
    expect((payload.nested as Record<string, unknown>).authorization).toBe('[REDACTED]');
    expect((payload.nested as Record<string, unknown>).normal).toBe('hello');

    const headers = sanitizeHeaders({
      authorization: 'Bearer test',
      'x-csrf-token': 'csrf',
      accept: 'application/json'
    });

    expect(headers.authorization).toBe('[REDACTED]');
    expect(headers['x-csrf-token']).toBe('[REDACTED]');
    expect(headers.accept).toBe('application/json');
  });
});
