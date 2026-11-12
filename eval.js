// Evaluate keyword and semantic search using MRR and Recall@10.
const fs = require('fs');

// Load the test queries and their relevant post IDs.
function loadTestSet(path) {
  const lines = fs.readFileSync(path, 'utf8').trim().split(/\r?\n/).slice(1);
  return lines.map(line => {
    const [query, ids] = line.split(',');
    return { query, correctIds: ids.split(';').map(Number) };
  });
}

const testSet = loadTestSet('test-set.csv');
const results = JSON.parse(fs.readFileSync('search-results.json', 'utf8'));

// Return the 1-based rank of the first relevant result, or null for a miss.
function rankOf(rankedIds, correctIds) {
  const index = rankedIds.findIndex(id => correctIds.includes(Number(id)));
  return index === -1 ? null : index + 1;
}

// Reciprocal rank is zero for a miss and 1/rank for a hit.
function reciprocalRank(rankedIds, correctIds) {
  const rank = rankOf(rankedIds, correctIds);
  return rank === null ? 0 : 1 / rank;
}

let keywordRRTotal = 0;
let semanticRRTotal = 0;
let keywordHits = 0;
let semanticHits = 0;

console.log('| Query | Keyword rank | Semantic rank |');
console.log('|---|---|---|');

for (const { query, correctIds } of testSet) {
  const keywordResults = results[query].keyword;
  const semanticResults = results[query].semantic;

  const keywordRank = rankOf(keywordResults, correctIds);
  const semanticRank = rankOf(semanticResults, correctIds);

  const keywordRR = reciprocalRank(keywordResults, correctIds);
  const semanticRR = reciprocalRank(semanticResults, correctIds);

  keywordRRTotal += keywordRR;
  semanticRRTotal += semanticRR;
  if (keywordRR > 0) keywordHits++;
  if (semanticRR > 0) semanticHits++;

  console.log(`| ${query} | ${keywordRank ?? 'miss'} | ${semanticRank ?? 'miss'} |`);
}

const totalQueries = testSet.length;
const keywordMRR = keywordRRTotal / totalQueries;
const semanticMRR = semanticRRTotal / totalQueries;
const keywordRecall = keywordHits / totalQueries;
const semanticRecall = semanticHits / totalQueries;

console.log(
  `| **Summary** | **MRR ${keywordMRR.toFixed(2)} · Recall@10 ${keywordRecall.toFixed(2)}** | **MRR ${semanticMRR.toFixed(2)} · Recall@10 ${semanticRecall.toFixed(2)}** |`
);
