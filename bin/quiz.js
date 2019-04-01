#!/usr/bin/env node
'use strict';

const path = require('path');
const readline = require('readline');
const engine = require('../lib/engine');
const { load } = require('../lib/questions');
const { readArgs, USAGE } = require('../lib/args');

const DEFAULT_FILE = path.join(__dirname, '..', 'data', 'js-basics.json');

let opts;
let questions;
try {
  opts = readArgs(process.argv.slice(2));
  if (opts.help) {
    console.log(USAGE);
    process.exit(0);
  }
  questions = load(opts.file || DEFAULT_FILE);
} catch (err) {
  console.error('quiz: ' + err.message);
  process.exit(1);
}

if (opts.shuffle) questions = engine.shuffle(questions);
if (opts.count) questions = questions.slice(0, opts.count);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
let index = 0;
let score = 0;

function ask() {
  if (index >= questions.length) {
    console.log(`\nYou scored ${score} out of ${questions.length}.`);
    rl.close();
    return;
  }
  const q = questions[index];
  rl.question(engine.format(q, index + 1) + '\n> ', answer => {
    if (engine.check(q, answer)) {
      console.log('Correct!\n');
      score++;
    } else {
      console.log(`Wrong. The answer is: ${engine.correctAnswer(q)}\n`);
    }
    index++;
    ask();
  });
}

ask();
