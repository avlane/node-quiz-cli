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

test('check: true/false answers', () => {
  const yes = { question: 'Sky is blue', answer: true };
  const no = { question: 'Sky is green', answer: false };
  ['t', 'true', 'Y', ' yes '].forEach(a => {
    assert.strictEqual(engine.check(yes, a), true, a);
    assert.strictEqual(engine.check(no, a), false, a);
  });
  ['f', 'FALSE', 'n', 'no'].forEach(a => {
    assert.strictEqual(engine.check(no, a), true, a);
    assert.strictEqual(engine.check(yes, a), false, a);
  });
  assert.strictEqual(engine.check(yes, 'maybe'), false);
});

test('format and correctAnswer for true/false', () => {
  const q = { question: 'Sky is blue', answer: true };
  assert.strictEqual(engine.format(q, 1), 'Q1. Sky is blue\n  (true or false)');
  assert.strictEqual(engine.correctAnswer(q), 'true');
});

function lcg(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

test('shuffle: keeps every element and leaves the input alone', () => {
  const input = [1, 2, 3, 4, 5, 6, 7, 8];
  const out = engine.shuffle(input, lcg(42));
  assert.deepStrictEqual(input, [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepStrictEqual(out.slice().sort((a, b) => a - b), input);
});

test('shuffle: same seed, same order', () => {
  const input = [1, 2, 3, 4, 5, 6, 7, 8];
  assert.deepStrictEqual(engine.shuffle(input, lcg(7)), engine.shuffle(input, lcg(7)));
  assert.notDeepStrictEqual(engine.shuffle(input, lcg(7)), input);
});

test('shuffle: empty and single element lists', () => {
  assert.deepStrictEqual(engine.shuffle([]), []);
  assert.deepStrictEqual(engine.shuffle(['x']), ['x']);
});

test('check: any of several accepted answers', () => {
  const q = { question: 'Nickname for JavaScript?', answer: ['js', 'javascript', 'ecmascript'] };
  assert.strictEqual(engine.check(q, 'JS'), true);
  assert.strictEqual(engine.check(q, 'ECMAScript'), true);
  assert.strictEqual(engine.check(q, 'java'), false);
  assert.strictEqual(engine.correctAnswer(q), 'js');
});

test('check: collapses inner whitespace', () => {
  const q = { question: 'Two words', answer: 'event   loop' };
  assert.strictEqual(engine.check(q, 'event loop'), true);
  assert.strictEqual(engine.check(q, '  Event \t Loop  '), true);
});

test('summarize: counts and grades', () => {
  const mk = (n, ok) => new Array(n).fill({ question: {}, correct: ok });
  assert.deepStrictEqual(engine.summarize(mk(9, true).concat(mk(1, false))),
    { correct: 9, total: 10, percent: 90, grade: 'A' });
  assert.strictEqual(engine.summarize(mk(4, true).concat(mk(1, false))).grade, 'B');
  assert.strictEqual(engine.summarize(mk(1, true).concat(mk(1, false))).grade, 'F');
});

test('summarize: no answers at all', () => {
  assert.deepStrictEqual(engine.summarize([]), { correct: 0, total: 0, percent: 0, grade: 'F' });
});

test('pick: filters by category before trimming', () => {
  const qs = [
    { category: 'a', question: '1', answer: 'x' },
    { category: 'b', question: '2', answer: 'x' },
    { category: 'a', question: '3', answer: 'x' }
  ];
  assert.deepStrictEqual(engine.pick(qs, { category: 'a', shuffle: false }).map(q => q.question), ['1', '3']);
  assert.deepStrictEqual(engine.pick(qs, { category: 'a', shuffle: false, count: 1 }).map(q => q.question), ['1']);
  assert.deepStrictEqual(engine.pick(qs, { category: 'zzz' }), []);
});

test('pick: without options returns every question', () => {
  const qs = [{ question: '1', answer: 'x' }, { question: '2', answer: 'x' }];
  assert.strictEqual(engine.pick(qs).length, 2);
  assert.strictEqual(engine.pick(qs, { count: 1 }).length, 1);
});

test('byCategory: tallies right and wrong answers', () => {
  const results = [
    { question: { category: 'a' }, correct: true },
    { question: { category: 'a' }, correct: false },
    { question: { category: 'b' }, correct: true },
    { question: {}, correct: false }
  ];
  assert.deepStrictEqual(engine.byCategory(results), {
    a: { correct: 1, total: 2 },
    b: { correct: 1, total: 1 },
    general: { correct: 0, total: 1 }
  });
});
