// eval.js
const fs = require('fs');

// --- 1. Load the inputs (already done for you) -----------------------------
function loadTestSet(path) {
  const lines = fs.readFileSync(path, 'utf8').trim().split('\n').slice(1);
  return lines.map(line => {
    const [query, ids] = line.split(',');
    return {
      query: query.trim(),
      correctIds: ids.split(';').map(s => Number(s.trim())),
    };
  });
}
const testSet = loadTestSet('test-set.csv');
const results = JSON.parse(fs.readFileSync('search-results.json', 'utf8'));

// --- 2. Reciprocal Rank ----------------------------------------------------
// Rank of the first correct id in the top 10 (1-based), or null for a miss.
function rankOf(rankedIds, correctIds) {
  const top = rankedIds.slice(0, 10);
  for (let i = 0; i < top.length; i++) {
    if (correctIds.includes(Number(top[i]))) return i + 1;
  }
  return null;
}

function reciprocalRank(rankedIds, correctIds) {
  const rank = rankOf(rankedIds, correctIds);
  return rank === null ? 0 : 1 / rank;
}

// --- 3. Evaluation loop ----------------------------------------------------
const rows = [];
let keywordRRSum = 0;
let semanticRRSum = 0;
let keywordHits = 0;
let semanticHits = 0;

for (const { query, correctIds } of testSet) {
  const r = results[query];
  const kRank = rankOf(r.keyword, correctIds);
  const sRank = rankOf(r.semantic, correctIds);

  keywordRRSum += reciprocalRank(r.keyword, correctIds);
  semanticRRSum += reciprocalRank(r.semantic, correctIds);
  if (kRank !== null) keywordHits++;
  if (sRank !== null) semanticHits++;

  rows.push({
    query,
    kRank: kRank === null ? 'miss' : kRank,
    sRank: sRank === null ? 'miss' : sRank,
  });
}

const n = testSet.length;
const keywordMRR = (keywordRRSum / n).toFixed(2);
const semanticMRR = (semanticRRSum / n).toFixed(2);
const keywordRecall = (keywordHits / n).toFixed(2);
const semanticRecall = (semanticHits / n).toFixed(2);

// --- 4. Markdown table -----------------------------------------------------
console.log('| Query | Keyword rank | Semantic rank |');
console.log('|---|---|---|');
for (const row of rows) {
  console.log(`| ${row.query} | ${row.kRank} | ${row.sRank} |`);
}
console.log(
  `| **Summary** | **MRR ${keywordMRR} · Recall@10 ${keywordRecall}** | ` +
  `**MRR ${semanticMRR} · Recall@10 ${semanticRecall}** |`
);