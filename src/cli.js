#!/usr/bin/env node
import {
  buildMenusUrl,
  buildWeeksUrl,
  extractServerBootstrap,
  fetchJson,
  fetchPageHtml,
} from './extractor.js';
import { getKnownParameterProfiles } from './profiles.js';

function parseArgs(argv) {
  const args = {
    page: 'https://www.hellofresh.com/plans',
    endpoint: 'bootstrap',
    country: undefined,
    locale: undefined,
    brand: undefined,
    weeks: undefined,
    exclude: undefined,
    take: undefined,
    skip: undefined,
    product: undefined,
    products: undefined,
    productSku: undefined,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    if (!current.startsWith('--')) {
      continue;
    }

    const key = current.slice(2);
    const value = argv[index + 1];
    args[key] = value;
    index += 1;
  }

  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const html = await fetchPageHtml(args.page);
  const bootstrap = extractServerBootstrap(html);

  if (args.endpoint === 'bootstrap') {
    console.log(JSON.stringify({
      page: args.page,
      serverAuth: {
        tokenType: bootstrap.serverAuth.tokenType,
        hasAccessToken: Boolean(bootstrap.serverAuth.accessToken),
      },
      internalRewrites: bootstrap.internalRewrites,
      gatewayRoutes: bootstrap.gatewayRoutes,
    }, null, 2));
    return;
  }

  if (args.endpoint === 'profiles') {
    console.log(JSON.stringify(getKnownParameterProfiles(), null, 2));
    return;
  }

  if (!bootstrap.serverAuth.accessToken) {
    throw new Error('No SSR access token found in __NEXT_DATA__');
  }

  const baseUrl = new URL(args.page).origin;
  let url;

  if (args.endpoint === 'weeks') {
    url = buildWeeksUrl(baseUrl, {
      country: args.country,
      locale: args.locale,
      brand: args.brand,
    });
  } else if (args.endpoint === 'menus') {
    url = buildMenusUrl(baseUrl, {
      country: args.country,
      weeks: args.weeks,
      locale: args.locale,
      exclude: args.exclude,
      take: args.take,
      skip: args.skip,
      product: args.product,
      products: args.products,
      productSku: args.productSku,
      brand: args.brand,
    });
  } else {
    throw new Error(`Unsupported endpoint: ${args.endpoint}`);
  }

  const response = await fetchJson(url, bootstrap.serverAuth.accessToken);
  console.log(JSON.stringify({
    page: args.page,
    endpoint: args.endpoint,
    url,
    response,
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
