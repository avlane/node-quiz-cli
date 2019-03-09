#!/usr/bin/env node
'use strict';

const path = require('path');
const readline = require('readline');
const engine = require('../lib/engine');
const { load } = require('../lib/questions');

const file = process.argv[2] || path.join(__dirname, '..', 'data', 'js-basics.json');
let questions;
try {
  questions = load(file);
} catch (err) {
  console.error('quiz: ' + err.message);
  process.exit(1);
}

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
