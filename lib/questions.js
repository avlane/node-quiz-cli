'use strict';

const fs = require('fs');

function isText(v) {
  return typeof v === 'string' && v.trim() !== '';
}

function validate(q, index) {
  const where = `question ${index + 1}`;
  if (!q || typeof q !== 'object') throw new Error(`${where} is not an object`);
  if (!isText(q.question)) throw new Error(`${where} has no question text`);
  if (q.explanation !== undefined && !isText(q.explanation)) {
    throw new Error(`${where} has an empty explanation`);
  }
  if (Array.isArray(q.options)) {
    if (q.options.length < 2 || q.options.length > 26 || !q.options.every(isText)) {
      throw new Error(`${where} needs between 2 and 26 text options`);
    }
    if (!q.options.includes(q.answer)) {
      throw new Error(`${where}: the answer must be one of the options`);
    }
  } else if (Array.isArray(q.answer)) {
    if (q.answer.length === 0 || !q.answer.every(isText)) {
      throw new Error(`${where} has an empty or invalid answer list`);
    }
  } else if (typeof q.answer === 'boolean') {
    // true/false question, nothing more to check
  } else if (!isText(q.answer)) {
    throw new Error(`${where} has no answer`);
  }
  return q;
}

function load(file) {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    throw new Error(`cannot read ${file}: ${err.message}`);
  }
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`${file} must contain a non-empty array of questions`);
  }
  return data.map(validate);
}

module.exports = { load, validate };
