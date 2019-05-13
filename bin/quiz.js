#!/usr/bin/env node
'use strict';

const path = require('path');
const readline = require('readline');
const engine = require('../lib/engine');
const { load, listSets, resolveSet } = require('../lib/questions');
const { readArgs, USAGE } = require('../lib/args');
const scores = require('../lib/scores');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DEFAULT_FILE = path.join(DATA_DIR, 'js-basics.json');

let opts;
let file;
let questions;
try {
  opts = readArgs(process.argv.slice(2));
  if (opts.help) {
    console.log(USAGE);
    process.exit(0);
  }
  if (opts.list) {
    for (const set of listSets(DATA_DIR)) console.log(`${set.name}  (${set.count} questions)`);
    process.exit(0);
  }
  if (opts.scores) {
    const top = scores.topScores(scores.readScores(scores.defaultFile()));
    if (top.length === 0) console.log('No scores yet.');
    for (const s of top) console.log(`${s.percent}%  ${s.correct}/${s.total}  ${s.set}  ${s.date.slice(0, 10)}`);
    process.exit(0);
  }
  file = resolveSet(opts.file || DEFAULT_FILE, DATA_DIR);
  questions = load(file);
} catch (err) {
  console.error('quiz: ' + err.message);
  process.exit(1);
}

if (opts.shuffle) questions = engine.shuffle(questions);
if (opts.count) questions = questions.slice(0, opts.count);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const results = [];
let finished = false;

function printSummary() {
  const s = engine.summarize(results);
  console.log(`\nYou got ${s.correct} of ${s.total} right (${s.percent}%), grade ${s.grade}.`);
}

function saveScore() {
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

function ask() {
  if (results.length >= questions.length) {
    finished = true;
    printSummary();
    saveScore();
    rl.close();
    return;
  }
  const q = questions[results.length];
  rl.question(engine.format(q, results.length + 1) + '\n> ', answer => {
    const correct = engine.check(q, answer);
    results.push({ question: q, correct });
    if (correct) {
      console.log('Correct!\n');
    } else {
      console.log(`Wrong. The answer is: ${engine.correctAnswer(q)}`);
      if (q.explanation) console.log(q.explanation);
      console.log('');
    }
    ask();
  });
}

rl.on('close', () => {
  if (finished) return;
  console.log('\nStopped early.');
  if (results.length) printSummary();
});

ask();
