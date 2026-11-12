// Retrieval Metrics Mini Project
// Run with: node eval.js
const fs = require('fs');

function loadTestSet(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8').trim().split(/\r?\n/);
  return lines.slice(1).map((line) => {
    // The supplied query strings contain no commas, so this simple CSV split
    // is sufficient for the provided fixture.
    const [query, ids] = line.split(',');
    return {
      query,
      correctIds: ids.split(';').map((id) => Number(id.trim())),
    };
  });
}

const testSet = loadTestSet('test-set.csv');
const results = JSON.parse(fs.readFileSync('search-results.json', 'utf8'));

// Return the reciprocal of the 1-based position of the first relevant result.
// A zero score means that none of the correct IDs appeared in the ranked list.
function reciprocalRank(rankedIds, correctIds) {
  const rank = rankOf(rankedIds, correctIds);
  return rank === null ? 0 : 1 / rank;
}

// Return the 1-based rank of the first relevant result, or null for a miss.
function rankOf(rankedIds, correctIds) {
  const correct = new Set(correctIds);
  const index = rankedIds.findIndex((id) => correct.has(Number(id)));
  return index === -1 ? null : index + 1;
}

const keywordRRs = [];
const semanticRRs = [];
let keywordHits = 0;
let semanticHits = 0;
const rows = [];

for (const { query, correctIds } of testSet) {
  const queryResults = results[query];

  if (!queryResults || !Array.isArray(queryResults.keyword) || !Array.isArray(queryResults.semantic)) {
    throw new Error(`Missing or invalid ranked results for query: ${query}`);
  }

  const keywordRank = rankOf(queryResults.keyword, correctIds);
  const semanticRank = rankOf(queryResults.semantic, correctIds);
  const keywordRR = reciprocalRank(queryResults.keyword, correctIds);
  const semanticRR = reciprocalRank(queryResults.semantic, correctIds);

  keywordRRs.push(keywordRR);
  semanticRRs.push(semanticRR);
  if (keywordRR > 0) keywordHits += 1;
  if (semanticRR > 0) semanticHits += 1;

  rows.push({
    query,
    keywordRank: keywordRank === null ? 'miss' : keywordRank,
    semanticRank: semanticRank === null ? 'miss' : semanticRank,
  });
}

const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
const keywordMRR = mean(keywordRRs);
const semanticMRR = mean(semanticRRs);
const keywordRecall = keywordHits / testSet.length;
const semanticRecall = semanticHits / testSet.length;
const twoDecimals = (value) => value.toFixed(2);

console.log('| Query | Keyword rank | Semantic rank |');
console.log('|---|---:|---:|');
for (const row of rows) {
  console.log(`| ${row.query} | ${row.keywordRank} | ${row.semanticRank} |`);
}
console.log(
  `| **Summary** | **MRR ${twoDecimals(keywordMRR)} · Recall@10 ${twoDecimals(keywordRecall)}** | **MRR ${twoDecimals(semanticMRR)} · Recall@10 ${twoDecimals(semanticRecall)}** |`
);
