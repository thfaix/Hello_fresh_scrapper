import test from 'node:test';
import assert from 'node:assert/strict';

import { getKnownParameterProfiles } from '../src/profiles.js';

test('getKnownParameterProfiles exposes observed parameter behavior for weeks and menus endpoints', () => {
  const profiles = getKnownParameterProfiles();

  assert.ok(profiles['/gw/menus-service/weeks']);
  assert.ok(profiles['/gw/menus-service/menus']);

  assert.deepEqual(profiles['/gw/menus-service/weeks'].required, []);
  assert.equal(profiles['/gw/menus-service/weeks'].params.country.effect, 'required_for_non_empty_data');
  assert.equal(profiles['/gw/menus-service/weeks'].params.locale.effect, 'optional');
  assert.equal(profiles['/gw/menus-service/weeks'].params.brand.effect, 'optional');

  assert.deepEqual(profiles['/gw/menus-service/menus'].required, ['country']);
  assert.equal(profiles['/gw/menus-service/menus'].params.country.effect, 'required');
  assert.equal(profiles['/gw/menus-service/menus'].params.weeks.effect, 'strong_filter');
  assert.equal(profiles['/gw/menus-service/menus'].params.take.effect, 'pagination_limit');
  assert.equal(profiles['/gw/menus-service/menus'].params.skip.effect, 'pagination_offset');
  assert.equal(profiles['/gw/menus-service/menus'].params.product.effect, 'filter');
  assert.equal(profiles['/gw/menus-service/menus'].params.products.effect, 'filter');
  assert.equal(profiles['/gw/menus-service/menus'].params.productSku.effect, 'filter');
  assert.equal(profiles['/gw/menus-service/menus'].params.exclude.effect, 'accepted_but_no_visible_change');
});
