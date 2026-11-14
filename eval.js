
// eval.js
const fs = require('fs');

// 1. Load test set
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

// 2. Reciprocal Rank
function reciprocalRank(rankedIds, correctIds) {
  const rank = rankOf(rankedIds, correctIds);

  return rank === null ? 0 : 1 / rank;
}

// Find first correct result's 1-based rank
function rankOf(rankedIds, correctIds) {
  const index = rankedIds.findIndex(id =>
    correctIds.includes(Number(id))
  );

  return index === -1 ? null : index + 1;
}

// 3. Evaluation loop
let keywordRR = 0;
let semanticRR = 0;

let keywordHits = 0;
let semanticHits = 0;

const totalQueries = testSet.length;
const tableRows = [];

for (const item of testSet) {
  const keywordIds = results[item.query].keyword;
  const semanticIds = results[item.query].semantic;

  const kRR = reciprocalRank(keywordIds, item.correctIds);
  const sRR = reciprocalRank(semanticIds, item.correctIds);

  keywordRR += kRR;
  semanticRR += sRR;

  if (kRR > 0) keywordHits++;
  if (sRR > 0) semanticHits++;

  const kRank = rankOf(keywordIds, item.correctIds);
  const sRank = rankOf(semanticIds, item.correctIds);

  tableRows.push({
    query: item.query,
    keywordRank: kRank ?? 'miss',
    semanticRank: sRank ?? 'miss'
  });
}

// Calculate MRR and Recall@10
const keywordMRR = keywordRR / totalQueries;
const semanticMRR = semanticRR / totalQueries;

const keywordRecall = keywordHits / totalQueries;
const semanticRecall = semanticHits / totalQueries;

// 4. Print markdown comparison table
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
