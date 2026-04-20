import test from 'node:test';
import assert from 'node:assert/strict';

import { extractBearerToken, formatBearerOutput } from '../src/bearer.js';

test('extractBearerToken returns the SSR bearer token payload from page HTML', () => {
  const html = `<!doctype html>
    <script id="__NEXT_DATA__" type="application/json">{"props":{"pageProps":{"ssrPayload":{"serverAuth":{"access_token":"abc123","token_type":"Bearer","expires_in":3600,"issued_at":1710000000}}}}}</script>`;

  const result = extractBearerToken(html, 'https://www.hellofresh.com/plans');

  assert.deepEqual(result, {
    page: 'https://www.hellofresh.com/plans',
    accessToken: 'abc123',
    tokenType: 'Bearer',
    expiresIn: 3600,
    issuedAt: 1710000000,
    authorizationHeader: 'Bearer abc123',
  });
});

test('extractBearerToken fails when no SSR token exists', () => {
  const html = '<html><body>No token here</body></html>';
  assert.throws(() => extractBearerToken(html, 'https://www.hellofresh.com/plans'), /__NEXT_DATA__ script not found|No SSR access token found/);
});

test('formatBearerOutput supports raw token mode for shell-friendly usage', () => {
  const payload = {
    page: 'https://www.hellofresh.com/plans',
    accessToken: 'abc123',
    tokenType: 'Bearer',
    expiresIn: 3600,
    issuedAt: 1710000000,
    authorizationHeader: 'Bearer abc123',
  };

  assert.equal(formatBearerOutput(payload, { raw: true }), 'abc123');
  assert.match(formatBearerOutput(payload, { raw: false }), /"authorizationHeader": "Bearer abc123"/);
});
