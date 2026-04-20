import test from 'node:test';
import assert from 'node:assert/strict';

import {
  extractServerBootstrap,
  extractAssetScriptUrls,
  collectGatewayRoutes,
  buildWeeksUrl,
  buildMenusUrl,
} from '../src/extractor.js';

const sampleHtmlPath = new URL('./fixtures/sample-hellofresh-page.html', import.meta.url);
const sampleHtml = await import('node:fs/promises').then(({ readFile }) => readFile(sampleHtmlPath, 'utf8'));

test('extractAssetScriptUrls resolves Next.js assets against a base URL', () => {
  const html = `<!doctype html><script src="/_next/static/chunks/main.js"></script><script src="https://www.hellofresh.lu/_next/static/chunks/page.js"></script>`;
  const result = extractAssetScriptUrls(html, 'https://www.hellofresh.lu/plans');

  assert.deepEqual(result, [
    'https://www.hellofresh.lu/_next/static/chunks/main.js',
    'https://www.hellofresh.lu/_next/static/chunks/page.js',
  ]);
});

test('collectGatewayRoutes deduplicates and sorts gateway URLs found in markup', () => {
  const html = '/gw/menus-service/menus xxx /gw/menus-service/weeks yyy /gw/menus-service/menus';
  const result = collectGatewayRoutes(html);

  assert.deepEqual(result, [
    '/gw/menus-service/menus',
    '/gw/menus-service/weeks',
  ]);
});

test('extractServerBootstrap reads token, rewrites, and gateway routes from __NEXT_DATA__ and page scripts', () => {
  const result = extractServerBootstrap(sampleHtml);

  assert.equal(result.serverAuth.accessToken, 'test-access-token');
  assert.equal(result.serverAuth.tokenType, 'Bearer');
  assert.deepEqual(result.internalRewrites, {
    authService: 'https://auth-service.live-k8s.hellofresh.io',
    signinService: 'https://signin-service.live-k8s.hellofresh.io',
    productsService: 'https://products-service.live-k8s.hellofresh.io',
  });
  assert.deepEqual(result.gatewayRoutes, [
    '/gw/menus-service/menus',
    '/gw/menus-service/weeks',
    '/gw/products-service/funnel/v1/product-families-by-handles',
  ]);
});

test('buildWeeksUrl includes only provided query params', () => {
  const url = buildWeeksUrl('https://www.hellofresh.lu', {
    country: 'LU',
    locale: 'en-LU',
    brand: 'hellofresh',
  });

  assert.equal(
    url,
    'https://www.hellofresh.lu/gw/menus-service/weeks?country=LU&locale=en-LU&brand=hellofresh',
  );
});

test('buildMenusUrl requires country and supports mapped menu filters', () => {
  assert.throws(() => buildMenusUrl('https://www.hellofresh.lu', {}), /country is required/);

  const url = buildMenusUrl('https://www.hellofresh.lu', {
    country: 'LU',
    weeks: '2026-W18',
    locale: 'en-LU',
    exclude: 'recipes.category,recipes.nutrition,recipes.steps',
    take: 1,
    skip: 0,
    product: 'classic-menu',
    productSku: 'LU-CB-3-2-0',
  });

  assert.equal(
    url,
    'https://www.hellofresh.lu/gw/menus-service/menus?country=LU&weeks=2026-W18&locale=en-LU&exclude=recipes.category%2Crecipes.nutrition%2Crecipes.steps&take=1&skip=0&product=classic-menu&productSku=LU-CB-3-2-0',
  );
});
