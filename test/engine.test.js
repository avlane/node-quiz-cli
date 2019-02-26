'use strict';

const assert = require('assert');
const { test } = require('./harness');
const engine = require('../lib/engine');

test('check: ignores case and surrounding spaces', () => {
  assert.strictEqual(engine.check({ answer: 'Closure' }, '  closure \n'), true);
});

test('check: rejects wrong answers', () => {
  assert.strictEqual(engine.check({ answer: 'let' }, 'var'), false);
  assert.strictEqual(engine.check({ answer: 'let' }, ''), false);
});
