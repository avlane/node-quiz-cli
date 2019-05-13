'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

function defaultFile() {
  return process.env.QUIZ_SCORES || path.join(os.homedir(), '.node-quiz-scores.json');
}

function readScores(file) {
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    return Array.isArray(data) ? data : [];
  } catch (err) {
    if (err.code === 'ENOENT' || err instanceof SyntaxError) return [];
    throw err;
  }
}

function addScore(file, entry) {
  const all = readScores(file);
  all.push(entry);
  fs.writeFileSync(file, JSON.stringify(all, null, 2) + '\n');
  return all;
}

// Best percentage first; older entries win ties.
function topScores(all, limit = 5) {
  return all
    .slice()
    .sort((a, b) => b.percent - a.percent || a.date.localeCompare(b.date))
    .slice(0, limit);
}

module.exports = { defaultFile, readScores, addScore, topScores };
