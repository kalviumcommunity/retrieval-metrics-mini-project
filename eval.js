// Evaluate keyword and semantic retrieval using MRR and Recall@10.
const fs = require('fs');

function loadTestSet(path) {
  const lines = fs.readFileSync(path, 'utf8').trim().split(/\r?\n/).slice(1);
  return lines.map((line) => {
    const comma = line.lastIndexOf(',');
    const query = line.slice(0, comma);
    const ids = line.slice(comma + 1);
    return { query, correctIds: ids.split(';').map(Number) };
  });
}

const testSet = loadTestSet('test-set.csv');
const results = JSON.parse(fs.readFileSync('search-results.json', 'utf8'));

function reciprocalRank(rankedIds, correctIds) {
  const correct = new Set(correctIds.map(Number));
  const index = rankedIds.findIndex((id) => correct.has(Number(id)));
  return index === -1 ? 0 : 1 / (index + 1);
}

function rankOf(rankedIds, correctIds) {
  const correct = new Set(correctIds.map(Number));
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
  if (!queryResults) throw new Error(`Missing search results for query: ${query}`);

  const keywordRank = rankOf(queryResults.keyword, correctIds);
  const semanticRank = rankOf(queryResults.semantic, correctIds);
  const keywordRR = reciprocalRank(queryResults.keyword, correctIds);
  const semanticRR = reciprocalRank(queryResults.semantic, correctIds);

  keywordRRs.push(keywordRR);
  semanticRRs.push(semanticRR);
  if (keywordRR > 0) keywordHits++;
  if (semanticRR > 0) semanticHits++;

  rows.push({ query, keywordRank, semanticRank });
}

const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
const keywordMRR = mean(keywordRRs);
const semanticMRR = mean(semanticRRs);
const keywordRecall = keywordHits / testSet.length;
const semanticRecall = semanticHits / testSet.length;
const fmt = (value) => value.toFixed(2);

console.log('| Query | Keyword rank | Semantic rank |');
console.log('|---|---|---|');
for (const row of rows) {
  console.log(`| ${row.query} | ${row.keywordRank ?? 'miss'} | ${row.semanticRank ?? 'miss'} |`);
}
console.log(`| **Summary** | **MRR ${fmt(keywordMRR)} · Recall@10 ${fmt(keywordRecall)}** | **MRR ${fmt(semanticMRR)} · Recall@10 ${fmt(semanticRecall)}** |`);
