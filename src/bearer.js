import { extractServerBootstrap } from './extractor.js';

export function extractBearerToken(html, page) {
  const bootstrap = extractServerBootstrap(html);

  if (!bootstrap.serverAuth.accessToken) {
    throw new Error('No SSR access token found in __NEXT_DATA__');
  }

  return {
    page,
    accessToken: bootstrap.serverAuth.accessToken,
    tokenType: bootstrap.serverAuth.tokenType,
    expiresIn: bootstrap.serverAuth.expiresIn,
    issuedAt: bootstrap.serverAuth.issuedAt,
    authorizationHeader: `${bootstrap.serverAuth.tokenType} ${bootstrap.serverAuth.accessToken}`,
  };
}

export function formatBearerOutput(payload, options = {}) {
  if (options.raw) {
    return payload.accessToken;
  }

  return JSON.stringify(payload, null, 2);
}
