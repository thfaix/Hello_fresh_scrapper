const NEXT_DATA_PATTERN = /<script[^>]*id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i;
const GATEWAY_ROUTE_PATTERN = /\/gw\/[A-Za-z0-9._\/-]+(?:\/[A-Za-z0-9._\/-]+)*/g;
const NEXT_ASSET_PATTERN = /<script[^>]*src=["']([^"']*\/_next\/static\/[^"']+\.js)["'][^>]*>/gi;

function parseNextData(html) {
  const match = html.match(NEXT_DATA_PATTERN);
  if (!match) {
    throw new Error('__NEXT_DATA__ script not found');
  }

  return JSON.parse(match[1]);
}

function sortObjectEntries(value) {
  return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right)));
}

export function collectGatewayRoutes(source) {
  return [...new Set((source.match(GATEWAY_ROUTE_PATTERN) ?? []).sort())];
}

export function extractAssetScriptUrls(html, baseUrl) {
  const urls = [];
  let match;
  while ((match = NEXT_ASSET_PATTERN.exec(html)) !== null) {
    urls.push(new URL(match[1], baseUrl).toString());
  }

  return [...new Set(urls)];
}

export function extractServerBootstrap(html) {
  const nextData = parseNextData(html);
  const ssrPayload = nextData?.props?.pageProps?.ssrPayload ?? {};
  const serverAuth = ssrPayload.serverAuth ?? {};
  const internalRewrites = ssrPayload.internalRewrites ?? {};
  const gatewayRoutes = collectGatewayRoutes(html);

  return {
    serverAuth: {
      accessToken: serverAuth.access_token ?? null,
      tokenType: serverAuth.token_type ?? null,
      expiresIn: serverAuth.expires_in ?? null,
      issuedAt: serverAuth.issued_at ?? null,
    },
    internalRewrites: sortObjectEntries(internalRewrites),
    gatewayRoutes,
    nextData,
  };
}

function appendParam(url, key, value) {
  if (value === undefined || value === null || value === '') {
    return;
  }

  url.searchParams.set(key, String(value));
}

export function buildWeeksUrl(baseUrl, options = {}) {
  const url = new URL('/gw/menus-service/weeks', baseUrl);
  appendParam(url, 'country', options.country);
  appendParam(url, 'locale', options.locale);
  appendParam(url, 'brand', options.brand);
  return url.toString();
}

export function buildMenusUrl(baseUrl, options = {}) {
  if (!options.country) {
    throw new Error('country is required');
  }

  const url = new URL('/gw/menus-service/menus', baseUrl);
  appendParam(url, 'country', options.country);
  appendParam(url, 'weeks', options.weeks);
  appendParam(url, 'locale', options.locale);
  appendParam(url, 'exclude', options.exclude);
  appendParam(url, 'take', options.take);
  appendParam(url, 'skip', options.skip);
  appendParam(url, 'product', options.product);
  appendParam(url, 'products', options.products);
  appendParam(url, 'productSku', options.productSku);
  appendParam(url, 'brand', options.brand);
  return url.toString();
}

export async function fetchPageHtml(pageUrl, fetchImpl = fetch) {
  const response = await fetchImpl(pageUrl, {
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; HelloFreshScrapper/0.1; +https://github.com/thfaix/Hello_fresh_scrapper)',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch page HTML: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

export async function fetchJson(url, accessToken, fetchImpl = fetch) {
  const response = await fetchImpl(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'user-agent': 'Mozilla/5.0 (compatible; HelloFreshScrapper/0.1; +https://github.com/thfaix/Hello_fresh_scrapper)',
    },
  });

  const body = await response.text();
  let parsedBody;
  try {
    parsedBody = JSON.parse(body);
  } catch {
    parsedBody = body;
  }

  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    body: parsedBody,
  };
}
