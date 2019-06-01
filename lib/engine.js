'use strict';

const TRUE_WORDS = ['t', 'true', 'y', 'yes'];
const FALSE_WORDS = ['f', 'false', 'n', 'no'];

function normalize(s) {
  return String(s).trim().toLowerCase().replace(/\s+/g, ' ');
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
  return [].concat(question.answer).some(a => normalize(a) === given);
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
  return String([].concat(question.answer)[0]);
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

function grade(percent) {
  if (percent >= 90) return 'A';
  if (percent >= 80) return 'B';
  if (percent >= 70) return 'C';
  if (percent >= 60) return 'D';
  return 'F';
}

// results: [{ question, correct }]
function summarize(results) {
  const total = results.length;
  const correct = results.filter(r => r.correct).length;
  const percent = total === 0 ? 0 : Math.round(correct / total * 100);
  return { correct, total, percent, grade: grade(percent) };
}

// Select the questions for one run: filter by category, shuffle, then trim.
function pick(questions, { count, category, shuffle: doShuffle = true, rng } = {}) {
  let list = category ? questions.filter(q => q.category === category) : questions.slice();
  if (doShuffle) list = shuffle(list, rng);
  return count ? list.slice(0, count) : list;
}

module.exports = { normalize, check, format, correctAnswer, shuffle, summarize, pick };
