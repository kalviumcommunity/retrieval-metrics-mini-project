
// eval.js - Retrieval Metrics Assignment

const fs = require('fs');

// --- 1. Load the inputs --------------------------------

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

// --- 2. Reciprocal Rank --------------------------------

// Find the reciprocal rank of the first correct answer.
function reciprocalRank(rankedIds, correctIds) {
  const rank = rankOf(rankedIds, correctIds);

  if (rank === null) {
    return 0;
  }

  return 1 / rank;
}

// Find the position of the first correct answer.
function rankOf(rankedIds, correctIds) {
  const index = rankedIds.findIndex(id =>
    correctIds.includes(Number(id))
  );

  if (index === -1) {
    return null;
  }

  return index + 1;
}

// --- 3. Run the evaluation loop -------------------------

const keywordRRs = [];
const semanticRRs = [];

let keywordHits = 0;
let semanticHits = 0;

const tableRows = [];

for (const item of testSet) {

  const keywordResults = results[item.query].keyword;
  const semanticResults = results[item.query].semantic;

  const keywordRank = rankOf(
    keywordResults,
    item.correctIds
  );

  const semanticRank = rankOf(
    semanticResults,
    item.correctIds
  );

  const keywordRR = reciprocalRank(
    keywordResults,
    item.correctIds
  );

  const semanticRR = reciprocalRank(
    semanticResults,
    item.correctIds
  );

  keywordRRs.push(keywordRR);
  semanticRRs.push(semanticRR);

  if (keywordRR > 0) {
    keywordHits++;
  }

  if (semanticRR > 0) {
    semanticHits++;
  }

  tableRows.push({
    query: item.query,
    keywordRank: keywordRank === null ? 'miss' : keywordRank,
    semanticRank: semanticRank === null ? 'miss' : semanticRank
  });
}

// Calculate MRR and Recall@10.

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

const keywordMRR = mean(keywordRRs);
const semanticMRR = mean(semanticRRs);

const keywordRecall = keywordHits / testSet.length;
const semanticRecall = semanticHits / testSet.length;

// --- 4. Print the Markdown comparison table ---------------

console.log('| Query | Keyword rank | Semantic rank |');
console.log('|---|---|---|');

for (const row of tableRows) {
  console.log(
    `| ${row.query} | ${row.keywordRank} | ${row.semanticRank} |`
  );
}

console.log(
  `| **Summary** | **MRR ${keywordMRR.toFixed(2)} · Recall@10 ${keywordRecall.toFixed(2)}** | **MRR ${semanticMRR.toFixed(2)} · Recall@10 ${semanticRecall.toFixed(2)}** |`
);
