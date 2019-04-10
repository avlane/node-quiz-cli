'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { test } = require('./harness');
const { load, validate } = require('../lib/questions');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'quiz-test-'));
process.on('exit', () => {
  fs.readdirSync(dir).forEach(f => fs.unlinkSync(path.join(dir, f)));
  fs.rmdirSync(dir);
});

function write(name, data) {
  const file = path.join(dir, name);
  fs.writeFileSync(file, typeof data === 'string' ? data : JSON.stringify(data));
  return file;
}

test('load: reads a valid file', () => {
  const file = write('ok.json', [{ question: 'Q?', answer: 'A' }]);
  assert.deepStrictEqual(load(file), [{ question: 'Q?', answer: 'A' }]);
});

test('load: missing file', () => {
  assert.throws(() => load(path.join(dir, 'nope.json')), /cannot read/);
});

test('load: invalid JSON', () => {
  assert.throws(() => load(write('bad.json', '{oops')), /cannot read/);
});

test('load: empty list', () => {
  assert.throws(() => load(write('empty.json', [])), /non-empty array/);
});

test('validate: complains about the question number', () => {
  assert.throws(() => validate({ question: 'Q?' }, 2), /question 3 has no answer/);
  assert.throws(() => validate({ answer: 'x' }, 0), /question 1 has no question text/);
});

test('bundled question sets are valid', () => {
  const data = path.join(__dirname, '..', 'data');
  fs.readdirSync(data).filter(f => f.endsWith('.json')).forEach(f => {
    assert.ok(load(path.join(data, f)).length > 0, f);
  });
});

test('validate: options must contain the answer', () => {
  const q = { question: 'Q?', options: ['a', 'b'], answer: 'c' };
  assert.throws(() => validate(q, 0), /one of the options/);
});

test('validate: needs at least two options', () => {
  assert.throws(() => validate({ question: 'Q?', options: ['a'], answer: 'a' }, 0), /between 2 and 26/);
});

test('validate: accepts true/false questions', () => {
  assert.doesNotThrow(() => validate({ question: 'Q?', answer: false }, 0));
});

test('validate: answer lists must not be empty', () => {
  assert.throws(() => validate({ question: 'Q?', answer: [] }, 0), /answer list/);
  assert.doesNotThrow(() => validate({ question: 'Q?', answer: ['a', 'b'] }, 0));
});
