#!/usr/bin/env node
'use strict';

const path = require('path');
const engine = require('../lib/engine');
const scores = require('../lib/scores');
const { load, listSets, resolveSet } = require('../lib/questions');
const { readArgs, USAGE } = require('../lib/args');
const { runSession } = require('../lib/session');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DEFAULT_FILE = path.join(DATA_DIR, 'js-basics.json');

function printSummary(results) {
  const s = engine.summarize(results);
  console.log(`\nYou got ${s.correct} of ${s.total} right (${s.percent}%), grade ${s.grade}.`);
}

function saveScore(file, results) {
  const s = engine.summarize(results);
  const entry = {
    set: path.basename(file, '.json'),
    correct: s.correct,
    total: s.total,
    percent: s.percent,
    date: new Date().toISOString()
  };
  try {
    scores.addScore(scores.defaultFile(), entry);
  } catch (err) {
    console.error('quiz: could not save the score: ' + err.message);
  }
}

async function main() {
  const opts = readArgs(process.argv.slice(2));
  if (opts.help) {
    console.log(USAGE);
    return 0;
  }
  if (opts.list) {
    for (const set of listSets(DATA_DIR)) console.log(`${set.name}  (${set.count} questions)`);
    return 0;
  }
  if (opts.scores) {
    const top = scores.topScores(scores.readScores(scores.defaultFile()));
    if (top.length === 0) console.log('No scores yet.');
    for (const s of top) console.log(`${s.percent}%  ${s.correct}/${s.total}  ${s.set}  ${s.date.slice(0, 10)}`);
    return 0;
  }

  const file = resolveSet(opts.file || DEFAULT_FILE, DATA_DIR);
  let questions = load(file);
  questions = engine.pick(questions, {
    count: opts.count,
    category: opts.category,
    shuffle: opts.shuffle
  });
  if (questions.length === 0) throw new Error(`no questions found in category "${opts.category}"`);

  const { results, aborted } = await runSession({
    questions,
    input: process.stdin,
    output: process.stdout
  });
  if (aborted) console.log('\nStopped early.');
  if (results.length) printSummary(results);
  if (!aborted) saveScore(file, results);
  return aborted ? 1 : 0;
}

main().then(
  code => { process.exitCode = code; },
  err => {
    console.error('quiz: ' + err.message);
    process.exitCode = 1;
  }
);
