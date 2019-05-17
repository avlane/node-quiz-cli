'use strict';

const readline = require('readline');
const engine = require('./engine');

// Asks every question in turn. Resolves with { results, aborted } when the
// questions run out or the input ends early.
function runSession({ questions, input, output }) {
  const rl = readline.createInterface({ input, output });
  const results = [];
  return new Promise(resolve => {
    let done = false;
    const finish = aborted => {
      if (done) return;
      done = true;
      rl.close();
      resolve({ results, aborted });
    };
    rl.on('close', () => finish(true));

    const next = () => {
      if (results.length >= questions.length) return finish(false);
      const q = questions[results.length];
      output.write(engine.format(q, results.length + 1) + '\n> ');
      rl.once('line', line => {
        const correct = engine.check(q, line);
        results.push({ question: q, correct });
        if (correct) {
          output.write('Correct!\n\n');
        } else {
          output.write('Wrong. The answer is: ' + engine.correctAnswer(q) + '\n');
          if (q.explanation) output.write(q.explanation + '\n');
          output.write('\n');
        }
        next();
      });
    };
    next();
  });
}

module.exports = { runSession };
