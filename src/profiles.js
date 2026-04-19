const KNOWN_PARAMETER_PROFILES = {
  '/gw/menus-service/weeks': {
    required: [],
    recommended: ['country', 'locale', 'brand'],
    notes: [
      'The endpoint returns HTTP 200 even without query params, but the weeks array is empty without a useful country.',
      'country is the practical minimum parameter for non-empty data.',
      'locale and brand are accepted and keep the response populated when country is present.',
    ],
    params: {
      country: {
        effect: 'required_for_non_empty_data',
        observedWith: 'country=US',
        observedResult: 'weeks array populated',
      },
      locale: {
        effect: 'optional',
        observedWith: 'locale=en-US',
        observedResult: 'accepted; still empty without country, populated with country',
      },
      brand: {
        effect: 'optional',
        observedWith: 'brand=hellofresh',
        observedResult: 'accepted; still empty without country, populated with country',
      },
    },
  },
  '/gw/menus-service/menus': {
    required: ['country'],
    recommended: ['country', 'weeks', 'locale', 'take'],
    notes: [
      'Without country the endpoint returns HTTP 400 with country cannot be empty.',
      'weeks strongly narrows the payload to a single week.',
      'take and skip work as pagination controls.',
      'product, products, and productSku behave as filters.',
      'exclude is accepted, but the excluded nested recipe fields still appeared in the live payloads tested.',
    ],
    params: {
      country: {
        effect: 'required',
        observedWith: 'country=US',
        observedResult: '200 response; broad mixed dataset',
      },
      weeks: {
        effect: 'strong_filter',
        observedWith: 'weeks=2026-W18',
        observedResult: 'narrows response to one week',
      },
      locale: {
        effect: 'optional',
        observedWith: 'locale=en-US',
        observedResult: 'accepted; no visible structural change in tested responses',
      },
      brand: {
        effect: 'optional',
        observedWith: 'brand=hellofresh',
        observedResult: 'accepted; no visible structural change in tested responses',
      },
      take: {
        effect: 'pagination_limit',
        observedWith: 'take=1',
        observedResult: 'count reduced to 1 while total stays at full match count',
      },
      skip: {
        effect: 'pagination_offset',
        observedWith: 'skip=1',
        observedResult: 'moves the window to the next matching item',
      },
      product: {
        effect: 'filter',
        observedWith: 'product=classic-menu',
        observedResult: 'restricts results to matching product; invalid value returns empty result set',
      },
      products: {
        effect: 'filter',
        observedWith: 'products=classic-menu',
        observedResult: 'behaves like product in tested requests',
      },
      productSku: {
        effect: 'filter',
        observedWith: 'productSku=US-CB-3-2-0',
        observedResult: 'restricts results to items carrying the SKU',
      },
      exclude: {
        effect: 'accepted_but_no_visible_change',
        observedWith: 'exclude=recipes.category,recipes.nutrition,recipes.steps',
        observedResult: 'request succeeds, but those nested recipe fields still appeared in tested live payloads',
      },
    },
  },
};

export function getKnownParameterProfiles() {
  return structuredClone(KNOWN_PARAMETER_PROFILES);
}
