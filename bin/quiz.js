#!/usr/bin/env node
'use strict';

const readline = require('readline');
const engine = require('../lib/engine');
const questions = require('../data/js-basics.json');

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
  rl.question(`Q${index + 1}. ${q.question} `, answer => {
    if (engine.check(q, answer)) {
      console.log('Correct!\n');
      score++;
    } else {
      console.log(`Wrong. The answer is: ${q.answer}\n`);
    }
    index++;
    ask();
  });
}

ask();
