
const fs = require('fs');

// --- 1. Load the inputs ---
function loadTestSet(path) {
  const lines = fs.readFileSync(path, 'utf8').trim().split('\n').slice(1);
  return lines.map(line => {
    const [query, ids] = line.split(',');
    return { query, correctIds: ids.split(';').map(Number) };
  });
}

const testSet = loadTestSet('test-set.csv');

const results = JSON.parse(fs.readFileSync('search-results.json', 'utf8'));

// --- 2. Reciprocal Rank ---
function reciprocalRank(rankedIds, correctIds) {
  const rank = rankOf(rankedIds, correctIds);
  return rank === null ? 0 : 1 / rank;
}

// Helper: Find the rank of the first correct result
function rankOf(rankedIds, correctIds) {
  const index = rankedIds.findIndex(id => correctIds.includes(id));
  return index === -1 ? null : index + 1;
}

// --- 3. Run the evaluation loop ---
let keywordTotalRR = 0;
let semanticTotalRR = 0;
let keywordHits = 0;
let semanticHits = 0;

const rows = [];

for (const test of testSet) {
  const keywordRanked = results[test.query].keyword;
  const semanticRanked = results[test.query].semantic;

  const keywordRR = reciprocalRank(keywordRanked, test.correctIds);
  const semanticRR = reciprocalRank(semanticRanked, test.correctIds);

  keywordTotalRR += keywordRR;
  semanticTotalRR += semanticRR;

  if (keywordRR > 0) keywordHits++;
  if (semanticRR > 0) semanticHits++;

  rows.push({
    query: test.query,
    keywordRank: rankOf(keywordRanked, test.correctIds),
    semanticRank: rankOf(semanticRanked, test.correctIds)
  });
}

const keywordMRR = keywordTotalRR / testSet.length;
const semanticMRR = semanticTotalRR / testSet.length;

const keywordRecall = keywordHits / testSet.length;
const semanticRecall = semanticHits / testSet.length;

// --- 4. Print Markdown comparison table ---
console.log('| Query | Keyword Rank | Semantic Rank |');
console.log('|---|---:|---:|');

for (const row of rows) {
  console.log(
    `| ${row.query} | ${row.keywordRank ?? 'miss'} | ${row.semanticRank ?? 'miss'} |`
  );
}

console.log(
  `| **Summary** | **MRR: ${keywordMRR.toFixed(2)}, Recall@10: ${keywordRecall.toFixed(2)}** | **MRR: ${semanticMRR.toFixed(2)}, Recall@10: ${semanticRecall.toFixed(2)}** |`
);
