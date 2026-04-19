# Hello Fresh Scrapper

JavaScript toolkit to inspect the HelloFresh frontend bootstrap payload and replay a few internal `gw/*` endpoints using the SSR Bearer token exposed in `__NEXT_DATA__`.

## What it does

- fetches a HelloFresh page (`/plans` by default)
- extracts `serverAuth` and `internalRewrites` from `__NEXT_DATA__`
- builds URLs for:
  - `GET /gw/menus-service/weeks`
  - `GET /gw/menus-service/menus`
- replays those requests with the SSR `Bearer` token

## Install

```bash
npm install
```

## Commands

### Inspect bootstrap

```bash
npm run extract -- --endpoint bootstrap
```

### Fetch available weeks

```bash
npm run extract -- --endpoint weeks --country US --locale en-US --brand hellofresh
```

### Fetch menus

```bash
npm run extract -- --endpoint menus --country US --weeks 2026-W18 --locale en-US --take 1
```

## Exact parameter mapping observed so far

## `/gw/menus-service/weeks`

Observed behavior:

- no query params → `200`, but `{"weeks":[]}`
- `country=US` → `200`, returns populated weeks
- `locale=en-US` is accepted
- `brand=hellofresh` is accepted
- `country` is the practical minimum useful param

Recommended form:

```text
/gw/menus-service/weeks?country=US&locale=en-US&brand=hellofresh
```

## `/gw/menus-service/menus`

Observed behavior:

- no `country` → `400` with `country cannot be empty`
- `country=US` alone → `200`, huge mixed result set across weeks/products
- `weeks=2026-W18` narrows results to one week
- `take` works for pagination / limiting
- `skip` works for pagination offset
- `product=classic-menu` works
- `products=classic-menu` also works
- `productSku=US-CB-3-2-0` works
- `locale=en-US` is accepted
- `brand` is supported by the builder even if not strictly required in current tests
- `exclude=recipes.category,recipes.nutrition,recipes.steps` is accepted, but in current live checks those nested recipe fields still appeared in the payload

Recommended form:

```text
/gw/menus-service/menus?country=US&weeks=2026-W18&locale=en-US&take=1
```

More selective example:

```text
/gw/menus-service/menus?country=US&weeks=2026-W18&locale=en-US&product=classic-menu&productSku=US-CB-3-2-0&take=1
```

## Notes

- this is **not** an official public API
- the SSR token may be ephemeral
- endpoint behavior may change at any time
- do not log or publish raw tokens

## Tests

```bash
npm test
```
