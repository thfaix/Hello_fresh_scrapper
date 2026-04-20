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
npm run extract -- --endpoint weeks --country LU --locale en-LU --brand hellofresh
```

### Fetch menus

```bash
npm run extract -- --endpoint menus --country LU --weeks 2026-W18 --locale en-LU --take 1
```

### Fetch only the bearer token

JSON payload:
```bash
npm run bearer
```

Raw token only:
```bash
npm run bearer -- --raw
```

Via the generic CLI:
```bash
npm run extract -- --endpoint bearer
npm run extract -- --endpoint bearer -- --raw
```

### Print curated parameter profiles

```bash
npm run extract -- --endpoint profiles
```

### Print curated response shapes

```bash
npm run extract -- --endpoint shapes
```

### Print the HTTP request collection

```bash
npm run extract -- --endpoint http
npm run generate:http
```

Generated file:
- `HF_api.http`

## Exact parameter mapping observed so far

## `/gw/menus-service/weeks`

Observed behavior:

- no query params → `200`, but `{"weeks":[]}`
- `country=LU` → `200`, returns populated weeks
- `locale=en-LU` alone → `200`, but still empty
- `brand=hellofresh` alone → `200`, but still empty
- `country=LU&locale=en-LU` → populated
- `country=LU&brand=hellofresh` → populated
- `country=DE&locale=de-DE` → populated in live test
- `country` is the practical minimum useful param

Parameter profile:

| Param | Effect | Notes |
|---|---|---|
| `country` | required for non-empty data | Without it, endpoint still returns `200` but `weeks` is empty |
| `locale` | optional | Accepted; does not make the response useful by itself |
| `brand` | optional | Accepted; does not make the response useful by itself |

Recommended form:

```text
/gw/menus-service/weeks?country=LU&locale=en-LU&brand=hellofresh
```

## `/gw/menus-service/menus`

Observed behavior:

- no `country` → `400` with `country cannot be empty`
- `country=LU` alone → `200`, huge mixed result set across weeks/products (`total=7189` in the live probe)
- `weeks=2026-W18` narrows results to one week (`total=15` in the live probe)
- `locale=en-LU` is accepted
- `brand=hellofresh` is accepted
- `take` works for pagination / limiting
- `skip` works for pagination offset
- `product=classic-menu` works and narrows to the matching menu family
- `products=classic-menu` also works in the same way in live tests
- `productSku=LU-CB-3-2-0` works and narrows to matching items
- `exclude=recipes.category,recipes.nutrition,recipes.steps` is accepted, but in current live checks those nested recipe fields still appeared in the payload
- `product=family` and `products=family` returned empty result sets in the tested week

Parameter profile:

| Param | Effect | Notes |
|---|---|---|
| `country` | required | Without it, request fails with `400` |
| `weeks` | strong filter | Best lever to shrink the dataset to one week |
| `locale` | optional | Accepted; no visible structural change in tested responses |
| `brand` | optional | Accepted; no visible structural change in tested responses |
| `take` | pagination limit | Changes `count`, keeps `total` |
| `skip` | pagination offset | Moves the item window |
| `product` | filter | Works with values like `classic-menu` |
| `products` | filter | Behaved like `product` in tested requests |
| `productSku` | filter | Restricts to items carrying the SKU |
| `exclude` | accepted but no visible change | Nested recipe fields still present in live payload |

Recommended form:

```text
/gw/menus-service/menus?country=LU&weeks=2026-W18&locale=en-LU&take=1
```

More selective example:

```text
/gw/menus-service/menus?country=LU&weeks=2026-W18&locale=en-LU&product=classic-menu&productSku=LU-CB-3-2-0&take=1
```

## Observed response shapes

### `weeks`
Top-level shape:
- `weeks`

Observed sample:
- first week: `2026-W17`

### `menus`
Top-level shape:
- `items`
- `take`
- `skip`
- `count`
- `total`

Observed `items[0]` keys:
- `id`
- `country`
- `product`
- `productSKUs`
- `week`
- `headline`
- `isActive`
- `isComplete`
- `isReadOnly`
- `serializedPreferences`
- `preferences`
- `courses`
- `modularity`
- `surveyTitle`
- `surveyQuestion`
- `surveyBody`
- `surveyOptIn`
- `averageRating`
- `rated`
- `link`
- `createdAt`
- `updatedAt`
- `clonedFrom`
- `mealSwapCombinations`
- `mealSwapCombinationsText`

Observed `courses[0]` keys:
- `index`
- `recipe`
- `selectionLimit`
- `isSoldOut`
- `hideOnSoldOut`
- `soldOutThreshold`
- `chargeSetting`
- `isHidden`
- `sections`
- `presets`
- `shoppingSegments`
- `shoppableProductId`

Observed `recipe` keys:
- `active`
- `averageRating`
- `category`
- `country`
- `cuisines`
- `difficulty`
- `favoritesCount`
- `headline`
- `id`
- `imageLink`
- `imagePath`
- `ingredients`
- `isPublished`
- `label`
- `name`
- `nutrition`
- `prepTime`
- `ratingsCount`
- `slug`
- `steps`
- `tags`
- `totalTime`
- `uuid`
- `websiteUrl`
- `yields`

Observed nested shapes:
- `category`: `{ id, name, slug, type }`
- `cuisines[]`: `{ id, name, slug, type }`
- `tags[]`: `{ id, name, slug, type, displayLabel, colorHandle, preferences }`
- `nutrition[]`: `{ type, name, amount, unit }`

Live-probe caveat:
- in the tested payload, `ingredients`, `steps`, and `yields` were present as keys but empty arrays
- `nutrition` was populated

## HTTP collection

A ready-to-use request collection is generated at:
- `HF_api.http`

It contains:
- bootstrap page request
- recommended `weeks` request
- recommended `menus` request
- filtered `menus` request by `product` and `productSku`
- pagination example
- `exclude` example

It now also centralizes shared variables so the file is easier to maintain:
- `@baseUrl`
- `@country`
- `@locale`
- `@brand`
- `@week`
- `@token`
- `@jsonAccept`
- `@plansPage`
- `@weeksPath`
- `@weeksCountryOnlyPath`
- `@menusBase`

That means most requests now reuse `{{menusBase}}` or `{{weeksPath}}` instead of repeating the full URL and repeated params.

## Notes

- this is **not** an official public API
- the SSR token may be ephemeral
- endpoint behavior may change at any time
- do not log or publish raw tokens

## Tests

```bash
npm test
```
