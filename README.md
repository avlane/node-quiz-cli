# node-quiz-cli

A small command line quiz written with Node's `readline` module. Questions
live in JSON files, the program asks them one by one, keeps score and
remembers your best runs.

Needs Node 12 or newer, no dependencies.

## Usage

    node bin/quiz.js                 # the default set, js-basics
    node bin/quiz.js node-trivia     # a bundled set by name
    node bin/quiz.js ./mine.json     # your own file
    node bin/quiz.js -n 5            # only five questions
    node bin/quiz.js --category arrays
    node bin/quiz.js --list          # bundled sets and their sizes
    node bin/quiz.js --scores        # the best five runs

Other options: `--no-shuffle` keeps the file order, `--help` prints usage.
If the input ends before the last question (ctrl-D, or a pipe that runs dry)
you still get the partial score.

High scores are stored in `~/.node-quiz-scores.json`. Set `QUIZ_SCORES` to use
another file.

## Question files

A question file is a JSON array. Every entry needs `question` and `answer`:

    [
      {"question": "Which module reads files?", "answer": "fs"},
      {"question": "Pick one", "options": ["red", "green"], "answer": "green"},
      {"question": "Node is single threaded for your code.", "answer": true},
      {"question": "Nickname?", "answer": ["js", "javascript"], "explanation": "Shown after a wrong answer."}
    ]

- With `options` the choices are lettered; answer with the letter or the text.
  `answer` must be one of the options.
- A boolean `answer` makes a true/false question (t, true, y, yes, f, false, n, no).
- An array `answer` lists accepted spellings. Case and extra spaces are ignored.
- `explanation` and `category` are optional.

## Layout

- `bin/quiz.js` command line entry point
- `lib/session.js` the interactive loop, takes streams so it can be tested
- `lib/engine.js` checking, formatting, shuffling, scoring
- `lib/questions.js`, `lib/args.js`, `lib/scores.js` loading, options, high scores
- `test/` plain `assert` tests, run with `npm test`
