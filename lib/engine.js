'use strict';

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
  const idx = optionIndex(question, given);
  if (idx >= 0) return normalize(question.options[idx]) === normalize(question.answer);
  return given === normalize(question.answer);
}

function format(question, number) {
  const lines = [`Q${number}. ${question.question}`];
  if (Array.isArray(question.options)) {
    question.options.forEach((opt, i) => lines.push(`  ${String.fromCharCode(97 + i)}) ${opt}`));
  }
  return lines.join('\n');
}

function correctAnswer(question) {
  return String(question.answer);
}

module.exports = { normalize, check, format, correctAnswer };
