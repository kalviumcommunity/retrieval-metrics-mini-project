
const fs = require('fs');

// Load test queries and correct post IDs
function loadTestSet(path) {
  const lines = fs.readFileSync(path, 'utf8').trim().split(/\r?\n/).slice(1);

  return lines.map(line => {
    const [query, ids] = line.split(',');
    return {
      query,
      correctIds: ids.split(';').map(Number)
    };
  });
}

const testSet = loadTestSet('test-set.csv');

// Load search results
const results = JSON.parse(
  fs.readFileSync('search-results.json', 'utf8')
);

// Calculate reciprocal rank
function reciprocalRank(rankedIds, correctIds) {
  const rank = rankOf(rankedIds, correctIds);
  return rank === null ? 0 : 1 / rank;
}

// Find the first correct result's rank
function rankOf(rankedIds, correctIds) {
  const index = rankedIds.findIndex(id => correctIds.includes(Number(id)));
  return index === -1 ? null : index + 1;
}

// Evaluate keyword and semantic search
let keywordTotal = 0;
let semanticTotal = 0;
let keywordHits = 0;
let semanticHits = 0;

const rows = [];

for (const item of testSet) {
  const queryResults = results[item.query];

  const keywordRank = rankOf(queryResults.keyword, item.correctIds);
  const semanticRank = rankOf(queryResults.semantic, item.correctIds);

  const keywordRR = reciprocalRank(queryResults.keyword, item.correctIds);
  const semanticRR = reciprocalRank(queryResults.semantic, item.correctIds);

  keywordTotal += keywordRR;
  semanticTotal += semanticRR;

  if (keywordRR > 0) keywordHits++;
  if (semanticRR > 0) semanticHits++;

  rows.push({
    query: item.query,
    keywordRank: keywordRank === null ? 'miss' : keywordRank,
    semanticRank: semanticRank === null ? 'miss' : semanticRank
  });
}

// Calculate MRR and Recall@10
const totalQueries = testSet.length;
const keywordMRR = keywordTotal / totalQueries;
const semanticMRR = semanticTotal / totalQueries;
const keywordRecall = keywordHits / totalQueries;
const semanticRecall = semanticHits / totalQueries;

// Print Markdown comparison table
console.log('| Query | Keyword rank | Semantic rank |');
console.log('|---|---:|---:|');

for (const row of rows) {
  console.log(
    `| ${row.query} | ${row.keywordRank} | ${row.semanticRank} |`
  );
}

console.log(
  `| **Summary (MRR / Recall@10)** | ${keywordMRR.toFixed(2)} / ${keywordRecall.toFixed(2)} | ${semanticMRR.toFixed(2)} / ${semanticRecall.toFixed(2)} |`
);
