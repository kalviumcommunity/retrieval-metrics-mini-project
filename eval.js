// eval.js starter. Fill in the four TODOs, then run: node eval.js
// You should not need any libraries. Plain Node.js is enough.

const fs = require('fs');

// --- 1. Load the inputs (already done for you) -----------------------------
// test-set.csv has a header row, then: query,correct_post_ids
// correct_post_ids may be a semicolon list, e.g. "1024;1025".
function loadTestSet(path) {
  const lines = fs.readFileSync(path, 'utf8').trim().split('\n').slice(1);

  return lines.map(line => {
    const [query, ids] = line.split(',');

    return {
      query,
      correctIds: ids.split(';').map(Number)
    };
  });
}

const testSet = loadTestSet('test-set.csv');

// search-results.json maps each query to the top-10 ranked post_id lists that
// each system returned: { "<query>": { keyword: [...], semantic: [...] } }

const results = JSON.parse(
  fs.readFileSync('search-results.json', 'utf8')
);

// --- 2. TODO: Reciprocal Rank ----------------------------------------------

function reciprocalRank(rankedIds, correctIds) {
  for (let i = 0; i < rankedIds.length; i++) {
    if (correctIds.includes(rankedIds[i])) {
      return 1 / (i + 1);
    }
  }

  return 0;
}

// Helper: the 1-based rank of the first correct id, or null if it is a miss.

function rankOf(rankedIds, correctIds) {
  for (let i = 0; i < rankedIds.length; i++) {
    if (correctIds.includes(rankedIds[i])) {
      return i + 1;
    }
  }

  return null;
}

// --- 3. TODO: run the evaluation loop --------------------------------------

const keywordRRs = [];
const semanticRRs = [];

let keywordHits = 0;
let semanticHits = 0;

for (const { query, correctIds } of testSet) {
  const keywordResults = results[query].keyword;
  const semanticResults = results[query].semantic;

  const keywordRR = reciprocalRank(keywordResults, correctIds);
  const semanticRR = reciprocalRank(semanticResults, correctIds);

  keywordRRs.push(keywordRR);
  semanticRRs.push(semanticRR);

  if (keywordRR > 0) {
    keywordHits++;
  }

  if (semanticRR > 0) {
    semanticHits++;
  }
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

const keywordMRR = mean(keywordRRs);
const semanticMRR = mean(semanticRRs);

const keywordRecall = keywordHits / testSet.length;
const semanticRecall = semanticHits / testSet.length;

// --- 4. TODO: print a markdown comparison table ----------------------------

console.log('| Query | Keyword rank | Semantic rank |');
console.log('|---|---|---|');

for (const { query, correctIds } of testSet) {
  const keywordResults = results[query].keyword;
  const semanticResults = results[query].semantic;

  const keywordRank = rankOf(keywordResults, correctIds);
  const semanticRank = rankOf(semanticResults, correctIds);

  console.log(
    `| ${query} | ${keywordRank ?? 'miss'} | ${semanticRank ?? 'miss'} |`
  );
}

console.log(
  `| **Summary** | **MRR ${keywordMRR.toFixed(2)} · Recall@10 ${keywordRecall.toFixed(2)}** | **MRR ${semanticMRR.toFixed(2)} · Recall@10 ${semanticRecall.toFixed(2)}** |`
);