export function renderHttpFile() {
  return `@baseUrl = https://www.hellofresh.com
@country = US
@locale = en-US
@brand = hellofresh
@week = 2026-W18
@token = REPLACE_WITH_BEARER_TOKEN

### Bootstrap page
GET {{baseUrl}}/plans
Accept: text/html

### Weeks (recommended)
GET {{baseUrl}}/gw/menus-service/weeks?country={{country}}&locale={{locale}}&brand={{brand}}
Authorization: Bearer {{token}}
Accept: application/json

### Weeks (country only)
GET {{baseUrl}}/gw/menus-service/weeks?country={{country}}
Authorization: Bearer {{token}}
Accept: application/json

### Menus (recommended)
GET {{baseUrl}}/gw/menus-service/menus?country={{country}}&weeks={{week}}&locale={{locale}}&take=1
Authorization: Bearer {{token}}
Accept: application/json

### Menus filtered by product and SKU
GET {{baseUrl}}/gw/menus-service/menus?country={{country}}&weeks={{week}}&locale={{locale}}&product=classic-menu&productSku=US-CB-3-2-0&take=1
Authorization: Bearer {{token}}
Accept: application/json

### Menus with pagination
GET {{baseUrl}}/gw/menus-service/menus?country={{country}}&weeks={{week}}&locale={{locale}}&take=1&skip=1
Authorization: Bearer {{token}}
Accept: application/json

### Menus with explicit exclude flag (accepted, but live impact not confirmed)
GET {{baseUrl}}/gw/menus-service/menus?country={{country}}&weeks={{week}}&locale={{locale}}&exclude=recipes.category%2Crecipes.nutrition%2Crecipes.steps&take=1
Authorization: Bearer {{token}}
Accept: application/json
`;
}
