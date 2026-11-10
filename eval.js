
const fs = require('fs');

// 1. Load test set
function loadTestSet(path) {
  const lines = fs.readFileSync(path, 'utf8').trim().split('\n').slice(1);

  return lines.map(line => {
    const [query, ids] = line.trim().split(',');
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
  for (let i = 0; i < rankedIds.length; i++) {
    if (correctIds.includes(Number(rankedIds[i]))) {
      return 1 / (i + 1);
    }
  }

  return 0;
}

// Rank of first correct answer
function rankOf(rankedIds, correctIds) {
  for (let i = 0; i < rankedIds.length; i++) {
    if (correctIds.includes(Number(rankedIds[i]))) {
      return i + 1;
    }
  }

  return null;
}

// 3. Evaluation loop
const keywordRRs = [];
const semanticRRs = [];

let keywordHits = 0;
let semanticHits = 0;

for (const item of testSet) {
  const keywordResults = results[item.query].keyword;
  const semanticResults = results[item.query].semantic;

  const keywordRR = reciprocalRank(
    keywordResults,
    item.correctIds
  );

  const semanticRR = reciprocalRank(
    semanticResults,
    item.correctIds
  );

  keywordRRs.push(keywordRR);
  semanticRRs.push(semanticRR);

  if (keywordRR > 0) keywordHits++;
  if (semanticRR > 0) semanticHits++;
}

// Calculate average
function mean(values) {
  return values.reduce((sum, value) => sum + value, 0)
    / values.length;
}

const keywordMRR = mean(keywordRRs);
const semanticMRR = mean(semanticRRs);

const keywordRecall = keywordHits / testSet.length;
const semanticRecall = semanticHits / testSet.length;

// 4. Print Markdown comparison table
console.log('| Query | Keyword rank | Semantic rank |');
console.log('|---|---|---|');

for (const item of testSet) {
  const keywordRank = rankOf(
    results[item.query].keyword,
    item.correctIds
  );

  const semanticRank = rankOf(
    results[item.query].semantic,
    item.correctIds
  );

  console.log(
    `| ${item.query} | ${keywordRank ?? 'miss'} | ${semanticRank ?? 'miss'} |`
  );
}

console.log(
  `| **Summary** | **MRR ${keywordMRR.toFixed(2)} · Recall@10 ${keywordRecall.toFixed(2)}** | **MRR ${semanticMRR.toFixed(2)} · Recall@10 ${semanticRecall.toFixed(2)}** |`
);
