
// eval.js
// Run using: node eval.js

const fs = require('fs');

// --- 1. Load the inputs ---------------------------------------------

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

const results = JSON.parse(
  fs.readFileSync('search-results.json', 'utf8')
);

// --- 2. Reciprocal Rank ---------------------------------------------

function reciprocalRank(rankedIds, correctIds) {
  for (let i = 0; i < rankedIds.length; i++) {

    if (correctIds.includes(rankedIds[i])) {
      return 1 / (i + 1);
    }

  }

  return 0;
}

// --- 3. Find the rank of the correct answer -------------------------

function rankOf(rankedIds, correctIds) {
  for (let i = 0; i < rankedIds.length; i++) {

    if (correctIds.includes(rankedIds[i])) {
      return i + 1;
    }

  }

  return null;
}

// --- 4. Run the evaluation loop -------------------------------------

const keywordRRs = [];
const semanticRRs = [];

let keywordHits = 0;
let semanticHits = 0;

const comparisonRows = [];

for (const item of testSet) {

  const query = item.query;
  const correctIds = item.correctIds;

  const keywordResults = results[query].keyword;
  const semanticResults = results[query].semantic;

  // Calculate Reciprocal Rank
  const keywordRR = reciprocalRank(keywordResults, correctIds);
  const semanticRR = reciprocalRank(semanticResults, correctIds);

  // Store RR scores
  keywordRRs.push(keywordRR);
  semanticRRs.push(semanticRR);

  // Count successful searches
  if (keywordRR > 0) {
    keywordHits++;
  }

  if (semanticRR > 0) {
    semanticHits++;
  }

  // Find the actual rank for the comparison table
  const keywordRank = rankOf(keywordResults, correctIds);
  const semanticRank = rankOf(semanticResults, correctIds);

  comparisonRows.push({
    query,
    keywordRank: keywordRank === null ? 'miss' : keywordRank,
    semanticRank: semanticRank === null ? 'miss' : semanticRank
  });

}

// --- 5. Calculate MRR and Recall@10 -------------------------------

function mean(arr) {
  return arr.reduce((total, value) => total + value, 0) / arr.length;
}

const keywordMRR = mean(keywordRRs);
const semanticMRR = mean(semanticRRs);

const keywordRecall = keywordHits / testSet.length;
const semanticRecall = semanticHits / testSet.length;

// --- 6. Print the Markdown comparison table ------------------------

console.log('| Query | Keyword rank | Semantic rank |');
console.log('|---|---|---|');

for (const row of comparisonRows) {
  console.log(
    `| ${row.query} | ${row.keywordRank} | ${row.semanticRank} |`
  );
}

console.log(
  `| **Summary** | **MRR ${keywordMRR.toFixed(2)} · Recall@10 ${keywordRecall.toFixed(2)}** | **MRR ${semanticMRR.toFixed(2)} · Recall@10 ${semanticRecall.toFixed(2)}** |`
);
