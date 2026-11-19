
const fs = require('fs');

// 1. Load input files
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
const results = JSON.parse(
  fs.readFileSync('search-results.json', 'utf8')
);

// 2. Calculate Reciprocal Rank
function reciprocalRank(rankedIds, correctIds) {
  const index = rankedIds.findIndex(id => correctIds.includes(Number(id)));

  return index === -1 ? 0 : 1 / (index + 1);
}

// Find the rank of the first correct answer
function rankOf(rankedIds, correctIds) {
  const index = rankedIds.findIndex(id => correctIds.includes(Number(id)));

  return index === -1 ? 'miss' : index + 1;
}

// 3. Evaluation loop
let keywordTotal = 0;
let semanticTotal = 0;

let keywordHits = 0;
let semanticHits = 0;

const rows = [];

for (const item of testSet) {
  const keywordList = results[item.query].keyword;
  const semanticList = results[item.query].semantic;

  const keywordRR = reciprocalRank(keywordList, item.correctIds);
  const semanticRR = reciprocalRank(semanticList, item.correctIds);

  keywordTotal += keywordRR;
  semanticTotal += semanticRR;

  if (keywordRR > 0) keywordHits++;
  if (semanticRR > 0) semanticHits++;

  rows.push({
    query: item.query,
    keywordRank: rankOf(keywordList, item.correctIds),
    semanticRank: rankOf(semanticList, item.correctIds)
  });
}

// 4. Calculate MRR and Recall@10
const total = testSet.length;

const keywordMRR = keywordTotal / total;
const semanticMRR = semanticTotal / total;

const keywordRecall = keywordHits / total;
const semanticRecall = semanticHits / total;

// 5. Print comparison table
console.log('| Query | Keyword rank | Semantic rank |');
console.log('|---|---|---|');

for (const row of rows) {
  console.log(
    `| ${row.query} | ${row.keywordRank} | ${row.semanticRank} |`
  );
}

console.log(
  `| **Summary** | **MRR ${keywordMRR.toFixed(2)} · Recall@10 ${keywordRecall.toFixed(2)}** | **MRR ${semanticMRR.toFixed(2)} · Recall@10 ${semanticRecall.toFixed(2)}** |`
);
