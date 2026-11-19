// eval.js - Retrieval Metrics Evaluation
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

// Helper: find the rank of the first correct result
function rankOf(rankedIds, correctIds) {
  const index = rankedIds.findIndex(id =>
    correctIds.includes(Number(id))
  );

  return index === -1 ? null : index + 1;
}

// --- 3. Run the evaluation loop ---
let keywordRRTotal = 0;
let semanticRRTotal = 0;

let keywordHits = 0;
let semanticHits = 0;

const queryResults = [];

for (const item of testSet) {
  const ranked = results[item.query];

  const keywordRank = rankOf(ranked.keyword, item.correctIds);
  const semanticRank = rankOf(ranked.semantic, item.correctIds);

  const keywordRR = reciprocalRank(ranked.keyword, item.correctIds);
  const semanticRR = reciprocalRank(ranked.semantic, item.correctIds);

  keywordRRTotal += keywordRR;
  semanticRRTotal += semanticRR;

  if (keywordRR > 0) keywordHits++;
  if (semanticRR > 0) semanticHits++;

  queryResults.push({
    query: item.query,
    keywordRank,
    semanticRank
  });
}

// Calculate MRR and Recall@10
const keywordMRR = keywordRRTotal / testSet.length;
const semanticMRR = semanticRRTotal / testSet.length;

const keywordRecall = keywordHits / testSet.length;
const semanticRecall = semanticHits / testSet.length;

// --- 4. Print the markdown comparison table ---
console.log("| Query | Keyword rank | Semantic rank |");
console.log("|---|---|---|");

for (const row of queryResults) {
  console.log(
    `| ${row.query} | ${row.keywordRank ?? "miss"} | ${row.semanticRank ?? "miss"} |`
  );
}

console.log(
  `| **Summary** | **MRR ${keywordMRR.toFixed(2)} · Recall@10 ${keywordRecall.toFixed(2)}** | **MRR ${semanticMRR.toFixed(2)} · Recall@10 ${semanticRecall.toFixed(2)}** |`
);