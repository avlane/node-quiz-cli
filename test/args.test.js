'use strict';

const assert = require('assert');
const { test } = require('./harness');
const { readArgs } = require('../lib/args');

test('readArgs: defaults', () => {
  assert.deepStrictEqual(readArgs([]), { file: null, count: null, shuffle: true, help: false, list: false });
});

test('readArgs: file and count', () => {
  const opts = readArgs(['-n', '3', 'my.json']);
  assert.strictEqual(opts.file, 'my.json');
  assert.strictEqual(opts.count, 3);
});

test('readArgs: long forms', () => {
  const opts = readArgs(['--count', '10', '--no-shuffle', '--help']);
  assert.strictEqual(opts.count, 10);
  assert.strictEqual(opts.shuffle, false);
  assert.strictEqual(opts.help, true);
});

test('readArgs: rejects bad input', () => {
  assert.throws(() => readArgs(['-n']), /positive integer/);
  assert.throws(() => readArgs(['-n', 'abc']), /positive integer/);
  assert.throws(() => readArgs(['-n', '0']), /positive integer/);
  assert.throws(() => readArgs(['--bogus']), /unknown option/);
});
