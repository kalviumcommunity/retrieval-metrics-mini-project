
const fs = require('fs');

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
const results = JSON.parse(fs.readFileSync('search-results.json', 'utf8'));

function rankOf(rankedIds, correctIds) {
  const index = rankedIds.findIndex(id =>
    correctIds.includes(Number(id))
  );
  return index === -1 ? null : index + 1;
}

function reciprocalRank(rankedIds, correctIds) {
  const rank = rankOf(rankedIds, correctIds);
  return rank === null ? 0 : 1 / rank;
}

let keywordTotal = 0;
let semanticTotal = 0;
let keywordHits = 0;
let semanticHits = 0;
const rows = [];

for (const item of testSet) {
  const keyword = results[item.query].keyword;
  const semantic = results[item.query].semantic;

  const kr = rankOf(keyword, item.correctIds);
  const sr = rankOf(semantic, item.correctIds);
  const krr = reciprocalRank(keyword, item.correctIds);
  const srr = reciprocalRank(semantic, item.correctIds);

  keywordTotal += krr;
  semanticTotal += srr;

  if (krr > 0) keywordHits++;
  if (srr > 0) semanticHits++;

  rows.push({
    query: item.query,
    keywordRank: kr === null ? 'miss' : kr,
    semanticRank: sr === null ? 'miss' : sr
  });
}

const n = testSet.length;
const keywordMRR = keywordTotal / n;
const semanticMRR = semanticTotal / n;
const keywordRecall = keywordHits / n;
const semanticRecall = semanticHits / n;

console.log('| Query | Keyword rank | Semantic rank |');
console.log('|---|---|---|');

for (const row of rows) {
  console.log(`| ${row.query} | ${row.keywordRank} | ${row.semanticRank} |`);
}

console.log(
  `| **Summary** | **MRR ${keywordMRR.toFixed(2)} · Recall@10 ${keywordRecall.toFixed(2)}** | **MRR ${semanticMRR.toFixed(2)} · Recall@10 ${semanticRecall.toFixed(2)}** |`
);
