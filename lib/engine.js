'use strict';

function normalize(s) {
  return String(s).trim().toLowerCase();
}

function check(question, answer) {
  return normalize(answer) === normalize(question.answer);
}

module.exports = { normalize, check };
