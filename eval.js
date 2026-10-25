// eval.js: scores keyword vs semantic search with MRR and Recall@10.
// Run: node eval.js
const fs = require('fs');

// --- 1. Load the inputs (already done for you) -----------------------------
function loadTestSet(path) {
  const lines = fs.readFileSync(path, 'utf8').trim().split('\n').slice(1);
  return lines.map(line => {
    const [query, ids] = line.split(',');
    return { query, correctIds: ids.split(';').map(Number) };
  });
}
const testSet = loadTestSet('test-set.csv');
const results = JSON.parse(fs.readFileSync('search-results.json', 'utf8'));

// --- 2. Reciprocal Rank ----------------------------------------------------
// Rank (1-based) of the FIRST correct id in the ranked list, or null on a miss.
function rankOf(rankedIds, correctIds) {
  const idx = rankedIds.findIndex(id => correctIds.includes(id));
  return idx === -1 ? null : idx + 1;
}

// 1 / rank of the first correct id; 0 if no correct id is in the list.
function reciprocalRank(rankedIds, correctIds) {
  const rank = rankOf(rankedIds, correctIds);
  return rank === null ? 0 : 1 / rank;
}

// --- 3. Evaluation loop ----------------------------------------------------
const totals = {
  keyword: { rrSum: 0, hits: 0 },
  semantic: { rrSum: 0, hits: 0 },
};
const rows = [];

for (const { query, correctIds } of testSet) {
  const entry = results[query];
  if (!entry) throw new Error(`No search results found for query: "${query}"`);

  const ranks = {};
  for (const system of ['keyword', 'semantic']) {
    const rr = reciprocalRank(entry[system], correctIds);
    totals[system].rrSum += rr;
    if (rr > 0) totals[system].hits += 1; // correct answer was in the top 10
    ranks[system] = rankOf(entry[system], correctIds);
  }
  rows.push({ query, ranks });
}

const n = testSet.length;
const keywordMRR = totals.keyword.rrSum / n;
const semanticMRR = totals.semantic.rrSum / n;
const keywordRecall = totals.keyword.hits / n;
const semanticRecall = totals.semantic.hits / n;

// --- 4. Markdown comparison table ------------------------------------------
const fmt = rank => (rank === null ? 'miss' : String(rank));

console.log('| Query | Keyword rank | Semantic rank |');
console.log('|---|---|---|');
for (const { query, ranks } of rows) {
  console.log(`| ${query} | ${fmt(ranks.keyword)} | ${fmt(ranks.semantic)} |`);
}
console.log(
  `| **Summary** | **MRR ${keywordMRR.toFixed(2)} \u00b7 Recall@10 ${keywordRecall.toFixed(2)}** | ` +
  `**MRR ${semanticMRR.toFixed(2)} \u00b7 Recall@10 ${semanticRecall.toFixed(2)}** |`
);