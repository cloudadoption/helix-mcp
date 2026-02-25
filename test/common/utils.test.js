import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveHelixToken } from '../../src/common/utils.js';

describe('resolveHelixToken', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('passthrough cases', () => {
    it('should return falsy token unchanged', async () => {
      expect(await resolveHelixToken(null, 'org', 'site')).toBe(null);
      expect(await resolveHelixToken(undefined, 'org', 'site')).toBe(undefined);
      expect(await resolveHelixToken('', 'org', 'site')).toBe('');
    });

    it('should pass through admin API keys unchanged', async () => {
      const adminKey = 'some-admin-api-key-no-dots';
      const result = await resolveHelixToken(adminKey, 'myorg', 'mysite');
      expect(result).toBe(adminKey);
    });

    it('should pass through site tokens unchanged', async () => {
      const siteToken = 'hlxtst_abc123def456';
      const result = await resolveHelixToken(siteToken, 'myorg', 'mysite');
      expect(result).toBe(siteToken);
    });

    it('should pass through tokens with one dot as admin keys', async () => {
      const token = 'part1.part2';
      const result = await resolveHelixToken(token, 'myorg', 'mysite');
      expect(result).toBe(token);
    });

    it('should pass through tokens with three dots as admin keys', async () => {
      const token = 'a.b.c.d';
      const result = await resolveHelixToken(token, 'myorg', 'mysite');
      expect(result).toBe(token);
    });
  });

  describe('IMS token exchange', () => {
    it('should exchange JWT-shaped token and return site token', async () => {
      const imsToken = 'header.payload.signature';
      const siteToken = 'hlxtst_exchanged123';

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ siteToken, siteTokenExpiry: 1677123456789 }),
      }));

      const result = await resolveHelixToken(imsToken, 'myorg', 'mysite', 'main');

      expect(result).toBe(siteToken);
      expect(fetch).toHaveBeenCalledOnce();
      expect(fetch).toHaveBeenCalledWith(
        'https://admin.hlx.page/auth/adobe/exchange',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accessToken: imsToken,
            org: 'myorg',
            site: 'mysite',
            ref: 'main',
          }),
        },
      );
    });

    it('should return null for public sites (empty exchange response)', async () => {
      const imsToken = 'header.payload.signature';

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      }));

      const result = await resolveHelixToken(imsToken, 'myorg', 'public-site', 'main');

      expect(result).toBeNull();
    });

    it('should default ref to main when not provided', async () => {
      const imsToken = 'header.payload.signature';

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ siteToken: 'hlxtst_abc' }),
      }));

      await resolveHelixToken(imsToken, 'myorg', 'mysite');

      const body = JSON.parse(fetch.mock.calls[0][1].body);
      expect(body.ref).toBe('main');
    });

    it('should pass custom ref to exchange endpoint', async () => {
      const imsToken = 'header.payload.signature';

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ siteToken: 'hlxtst_abc' }),
      }));

      await resolveHelixToken(imsToken, 'myorg', 'mysite', 'develop');

      const body = JSON.parse(fetch.mock.calls[0][1].body);
      expect(body.ref).toBe('develop');
    });

    it('should throw on exchange failure', async () => {
      const imsToken = 'header.payload.signature';

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
      }));

      await expect(resolveHelixToken(imsToken, 'myorg', 'mysite'))
        .rejects.toThrow('IMS token exchange failed: 403');
    });
  });
});
