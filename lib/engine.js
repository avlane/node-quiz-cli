'use strict';

const TRUE_WORDS = ['t', 'true', 'y', 'yes'];
const FALSE_WORDS = ['f', 'false', 'n', 'no'];

function normalize(s) {
  return String(s).trim().toLowerCase();
}

function optionIndex(question, given) {
  if (!Array.isArray(question.options) || given.length !== 1) return -1;
  const idx = given.charCodeAt(0) - 97;
  return idx >= 0 && idx < question.options.length ? idx : -1;
}

function check(question, answer) {
  const given = normalize(answer);
  if (typeof question.answer === 'boolean') {
    if (TRUE_WORDS.includes(given)) return question.answer === true;
    if (FALSE_WORDS.includes(given)) return question.answer === false;
    return false;
  }
  const idx = optionIndex(question, given);
  if (idx >= 0) return normalize(question.options[idx]) === normalize(question.answer);
  return given === normalize(question.answer);
}

function format(question, number) {
  const lines = [`Q${number}. ${question.question}`];
  if (Array.isArray(question.options)) {
    question.options.forEach((opt, i) => lines.push(`  ${String.fromCharCode(97 + i)}) ${opt}`));
  } else if (typeof question.answer === 'boolean') {
    lines.push('  (true or false)');
  }
  return lines.join('\n');
}

function correctAnswer(question) {
  return String(question.answer);
}

// Fisher-Yates. Returns a new array; rng is injectable so tests can be repeatable.
function shuffle(items, rng = Math.random) {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

module.exports = { normalize, check, format, correctAnswer, shuffle };
