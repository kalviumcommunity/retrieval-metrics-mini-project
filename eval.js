const fs = require('fs');

// 1. Load the test set
function loadTestSet(path) {
  const lines = fs.readFileSync(path, 'utf8').trim().split('\n').slice(1);

  return lines.map(line => {
    const [query, ids] = line.trim().split(',');
    return {
      query: query.trim(),
      correctIds: ids.split(';').map(Number)
    };
  });
}

const testSet = loadTestSet('test-set.csv');

// Load search results
const results = JSON.parse(
  fs.readFileSync('search-results.json', 'utf8')
);

// 2. Calculate Reciprocal Rank
function reciprocalRank(rankedIds, correctIds) {
  for (let i = 0; i < rankedIds.length; i++) {
    if (correctIds.includes(Number(rankedIds[i]))) {
      return 1 / (i + 1);
    }
  }

  return 0;
}

// Find the rank of the correct answer
function rankOf(rankedIds, correctIds) {
  for (let i = 0; i < rankedIds.length; i++) {
    if (correctIds.includes(Number(rankedIds[i]))) {
      return i + 1;
    }
  }

  return null;
}

// 3. Run the evaluation loop

const keywordRRs = [];
const semanticRRs = [];

let keywordHits = 0;
let semanticHits = 0;

const rows = [];

for (const { query, correctIds } of testSet) {

  const keywordResults = results[query].keyword;
  const semanticResults = results[query].semantic;

  const keywordRR = reciprocalRank(keywordResults, correctIds);
  const semanticRR = reciprocalRank(semanticResults, correctIds);

  keywordRRs.push(keywordRR);
  semanticRRs.push(semanticRR);

  if (keywordRR > 0) {
    keywordHits++;
  }

  if (semanticRR > 0) {
    semanticHits++;
  }

  const keywordRank = rankOf(keywordResults, correctIds);
  const semanticRank = rankOf(semanticResults, correctIds);

  rows.push({
    query,
    keywordRank: keywordRank === null ? 'miss' : keywordRank,
    semanticRank: semanticRank === null ? 'miss' : semanticRank
  });
}

// Calculate MRR
function mean(arr) {
  return arr.reduce((sum, value) => sum + value, 0) / arr.length;
}

const keywordMRR = mean(keywordRRs);
const semanticMRR = mean(semanticRRs);

// Calculate Recall@10
const keywordRecall = keywordHits / testSet.length;
const semanticRecall = semanticHits / testSet.length;

// 4. Print comparison table

console.log('| Query | Keyword rank | Semantic rank |');
console.log('|---|---|---|');

for (const row of rows) {
  console.log(
    `| ${row.query} | ${row.keywordRank} | ${row.semanticRank} |`
  );
}

// Print summary
console.log(
  `| **Summary** | **MRR ${keywordMRR.toFixed(2)} · Recall@10 ${keywordRecall.toFixed(2)}** | **MRR ${semanticMRR.toFixed(2)} · Recall@10 ${semanticRecall.toFixed(2)}** |`
);