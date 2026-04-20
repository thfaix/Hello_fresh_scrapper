import test from 'node:test';
import assert from 'node:assert/strict';

import { getKnownResponseShapes } from '../src/response-shapes.js';

test('getKnownResponseShapes exposes observed top-level and nested HelloFresh response shapes', () => {
  const shapes = getKnownResponseShapes();

  assert.deepEqual(shapes.weeks.topKeys, ['weeks']);
  assert.equal(shapes.weeks.sampleWeek, '2026-W17');

  assert.deepEqual(shapes.menus.topKeys, ['items', 'take', 'skip', 'count', 'total']);
  assert.ok(shapes.menus.itemKeys.includes('product'));
  assert.ok(shapes.menus.itemKeys.includes('courses'));
  assert.ok(shapes.menus.courseKeys.includes('recipe'));
  assert.ok(shapes.menus.recipeKeys.includes('nutrition'));
  assert.ok(shapes.menus.recipeKeys.includes('steps'));
  assert.ok(shapes.menus.nutritionEntryKeys.includes('name'));
  assert.ok(shapes.menus.nutritionEntryKeys.includes('amount'));
  assert.equal(shapes.menus.notes.ingredientsObservedState, 'empty_array_in_live_probe');
  assert.equal(shapes.menus.notes.stepsObservedState, 'empty_array_in_live_probe');
});
