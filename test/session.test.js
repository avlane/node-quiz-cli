'use strict';

const assert = require('assert');
const { PassThrough } = require('stream');
const { test } = require('./harness');
const { runSession } = require('../lib/session');

const questions = [
  { question: 'Keyword for block scoped variables?', answer: 'let' },
  { question: 'Sky is blue', answer: true, explanation: 'Rayleigh scattering.' },
  { question: 'Pick one', options: ['red', 'green'], answer: 'green' }
];

function play(lines) {
  const input = new PassThrough();
  const output = new PassThrough();
  let text = '';
  output.on('data', chunk => { text += chunk; });
  const session = runSession({ questions, input, output });
  if (lines.length) input.write(lines.join('\n') + '\n');
  input.end();
  return session.then(outcome => Object.assign({ text }, outcome));
}

test('session: all correct', async () => {
  const { results, aborted, text } = await play(['let', 'yes', 'b']);
  assert.strictEqual(aborted, false);
  assert.deepStrictEqual(results.map(r => r.correct), [true, true, true]);
  assert.ok(text.includes('Q1. Keyword for block scoped variables?'));
  assert.ok(text.includes('b) green'));
  assert.strictEqual(text.split('Correct!').length - 1, 3);
});

test('session: wrong answers show the right one and the explanation', async () => {
  const { results, text } = await play(['var', 'no', 'a']);
  assert.deepStrictEqual(results.map(r => r.correct), [false, false, false]);
  assert.ok(text.includes('Wrong. The answer is: let'));
  assert.ok(text.includes('Wrong. The answer is: true'));
  assert.ok(text.includes('Rayleigh scattering.'));
});

test('session: input ending early is reported as aborted', async () => {
  const { results, aborted } = await play(['let']);
  assert.strictEqual(aborted, true);
  assert.strictEqual(results.length, 1);
});

test('session: no input at all', async () => {
  const { results, aborted } = await play([]);
  assert.strictEqual(aborted, true);
  assert.strictEqual(results.length, 0);
});
