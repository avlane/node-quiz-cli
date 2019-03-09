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

test('format: lists the options with letters', () => {
  const q = { question: 'Pick one', options: ['red', 'green'], answer: 'green' };
  assert.strictEqual(engine.format(q, 3), 'Q3. Pick one\n  a) red\n  b) green');
});

test('check: multiple choice by letter', () => {
  const q = { question: 'Pick one', options: ['red', 'green', 'blue'], answer: 'green' };
  assert.strictEqual(engine.check(q, 'b'), true);
  assert.strictEqual(engine.check(q, ' B '), true);
  assert.strictEqual(engine.check(q, 'a'), false);
  assert.strictEqual(engine.check(q, 'd'), false);
});

test('check: multiple choice by text', () => {
  const q = { question: 'Pick one', options: ['red', 'green', 'blue'], answer: 'green' };
  assert.strictEqual(engine.check(q, 'Green'), true);
  assert.strictEqual(engine.check(q, 'blue'), false);
});
