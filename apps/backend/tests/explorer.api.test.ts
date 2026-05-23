import { describe, it, expect } from 'vitest';
import { Elysia } from 'elysia';
import { explorerRoutes } from '../src/modules/explorer/interfaces/explorer.routes';

describe('Explorer API Integration', () => {
  const app = new Elysia()
    .onError(({ code, error, set }) => {
      if (code === 'VALIDATION') {
        set.status = 400;
        return {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: error.message
          }
        };
      }
    })
    .use(explorerRoutes);

  it('GET /api/v1/folders/root should return success response', async () => {
    const response = await app
      .handle(new Request('http://localhost/api/v1/folders/root'))
      .then((res) => res.json());

    expect(response).toBeDefined();
    expect(response.success).toBe(true);
    expect(Array.isArray(response.data)).toBe(true);
  });

  it('GET /api/v1/folders/:id/children with invalid UUID format should return 400 validation error', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/v1/folders/invalid-uuid-format/children')
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_FAILED');
  });

  it('GET /api/v1/folders/search with q query param should return success', async () => {
    const response = await app
      .handle(new Request('http://localhost/api/v1/folders/search?q=Documents'))
      .then((res) => res.json());

    expect(response.success).toBe(true);
    expect(response.data.folders).toBeDefined();
    expect(response.data.files).toBeDefined();
  });
});
