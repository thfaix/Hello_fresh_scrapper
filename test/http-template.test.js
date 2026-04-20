import test from 'node:test';
import assert from 'node:assert/strict';

import { renderHttpFile } from '../src/http-template.js';

test('renderHttpFile creates a usable HF_api.http template with env vars and key requests', () => {
  const output = renderHttpFile();

  assert.match(output, /^@baseUrl = https:\/\/www\.hellofresh\.lu/m);
  assert.match(output, /^@country = LU/m);
  assert.match(output, /^@locale = en-LU/m);
  assert.match(output, /^@brand = hellofresh/m);
  assert.match(output, /^@week = 2026-W18/m);
  assert.match(output, /^@token = REPLACE_WITH_BEARER_TOKEN/m);

  assert.match(output, /^### Bootstrap page/m);
  assert.match(output, /^GET {{baseUrl}}\/plans/m);

  assert.match(output, /^### Weeks \(recommended\)/m);
  assert.match(output, /^GET {{baseUrl}}\/gw\/menus-service\/weeks\?country={{country}}&locale={{locale}}&brand={{brand}}/m);

  assert.match(output, /^### Menus \(recommended\)/m);
  assert.match(output, /^GET {{baseUrl}}\/gw\/menus-service\/menus\?country={{country}}&weeks={{week}}&locale={{locale}}&take=1/m);

  assert.match(output, /^### Menus filtered by product and SKU/m);
  assert.match(output, /^GET {{baseUrl}}\/gw\/menus-service\/menus\?country={{country}}&weeks={{week}}&locale={{locale}}&product=classic-menu&productSku=LU-CB-3-2-0&take=1/m);

  assert.match(output, /^Authorization: Bearer {{token}}/m);
  assert.match(output, /^Accept: application\/json/m);
});
