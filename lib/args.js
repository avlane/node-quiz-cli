'use strict';

const USAGE = `Usage: quiz [options] [questions.json]

Options:
  -n, --count <n>   ask only n questions
  --no-shuffle      keep the questions in file order
  -h, --help        show this help`;

function readArgs(argv) {
  const opts = { file: null, count: null, shuffle: true, help: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '-h' || arg === '--help') opts.help = true;
    else if (arg === '--no-shuffle') opts.shuffle = false;
    else if (arg === '-n' || arg === '--count') {
      const n = Number(argv[++i]);
      if (!Number.isInteger(n) || n < 1) throw new Error('--count needs a positive integer');
      opts.count = n;
    } else if (arg.startsWith('-')) throw new Error('unknown option: ' + arg);
    else opts.file = arg;
  }
  return opts;
}

module.exports = { readArgs, USAGE };
