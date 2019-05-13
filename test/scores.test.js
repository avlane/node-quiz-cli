'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { test } = require('./harness');
const scores = require('../lib/scores');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'quiz-scores-'));
process.on('exit', () => {
  fs.readdirSync(dir).forEach(f => fs.unlinkSync(path.join(dir, f)));
  fs.rmdirSync(dir);
});

const entry = (percent, date) => ({ set: 'x', correct: 1, total: 1, percent, date });

test('readScores: missing file is an empty list', () => {
  assert.deepStrictEqual(scores.readScores(path.join(dir, 'none.json')), []);
});

test('readScores: corrupt file is an empty list', () => {
  const file = path.join(dir, 'corrupt.json');
  fs.writeFileSync(file, 'not json');
  assert.deepStrictEqual(scores.readScores(file), []);
});

test('addScore: appends and persists', () => {
  const file = path.join(dir, 'scores.json');
  scores.addScore(file, entry(50, '2019-05-01T10:00:00.000Z'));
  scores.addScore(file, entry(80, '2019-05-02T10:00:00.000Z'));
  assert.strictEqual(scores.readScores(file).length, 2);
});

test('topScores: best first, limited, older wins ties', () => {
  const all = [
    entry(70, '2019-05-03'), entry(90, '2019-05-02'), entry(70, '2019-05-01'),
    entry(100, '2019-05-04'), entry(10, '2019-05-05'), entry(60, '2019-05-06'), entry(65, '2019-05-07')
  ];
  const top = scores.topScores(all);
  assert.deepStrictEqual(top.map(s => s.percent), [100, 90, 70, 70, 65]);
  assert.strictEqual(top[2].date, '2019-05-01');
  assert.strictEqual(scores.topScores(all, 2).length, 2);
});

test('defaultFile: honours QUIZ_SCORES', () => {
  const saved = process.env.QUIZ_SCORES;
  process.env.QUIZ_SCORES = '/tmp/somewhere.json';
  assert.strictEqual(scores.defaultFile(), '/tmp/somewhere.json');
  if (saved === undefined) delete process.env.QUIZ_SCORES;
  else process.env.QUIZ_SCORES = saved;
});
