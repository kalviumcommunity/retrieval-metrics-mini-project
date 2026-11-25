
const fs = require('fs');

// 1. Load the inputs
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
  const rank = rankOf(rankedIds, correctIds);

  return rank === null ? 0 : 1 / rank;
}

// Helper: Find the rank of the first correct answer
function rankOf(rankedIds, correctIds) {
  for (let i = 0; i < rankedIds.length; i++) {
    if (correctIds.includes(Number(rankedIds[i]))) {
      return i + 1;
    }
  }

  return null;
}

// 3. Run the evaluation loop
const kwRRs = [];
const semRRs = [];

let kwHits = 0;
let semHits = 0;

for (const { query, correctIds } of testSet) {
  const keywordResults = results[query].keyword;
  const semanticResults = results[query].semantic;

  const kwRR = reciprocalRank(keywordResults, correctIds);
  const semRR = reciprocalRank(semanticResults, correctIds);

  kwRRs.push(kwRR);
  semRRs.push(semRR);

  if (kwRR > 0) kwHits++;
  if (semRR > 0) semHits++;
}

// Calculate MRR
const mean = arr =>
  arr.reduce((sum, value) => sum + value, 0) / arr.length;

const keywordMRR = mean(kwRRs);
const semanticMRR = mean(semRRs);

// Calculate Recall@10
const keywordRecall = kwHits / testSet.length;
const semanticRecall = semHits / testSet.length;

// 4. Print Markdown comparison table
console.log('| Query | Keyword rank | Semantic rank |');
console.log('|---|---|---|');

for (const { query, correctIds } of testSet) {
  const keywordRank = rankOf(results[query].keyword, correctIds);
  const semanticRank = rankOf(results[query].semantic, correctIds);

  console.log(
    `| ${query} | ${keywordRank ?? 'miss'} | ${semanticRank ?? 'miss'} |`
  );
}

// Print summary
console.log(
  `| **Summary** | **MRR ${keywordMRR.toFixed(2)} · Recall@10 ${keywordRecall.toFixed(2)}** | **MRR ${semanticMRR.toFixed(2)} · Recall@10 ${semanticRecall.toFixed(2)}** |`
);
