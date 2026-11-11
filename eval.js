
// eval.js — Retrieval Metrics Evaluation
// Run with: node eval.js

const fs = require('fs');

// 1. Load the test data
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

// 2. Calculate Reciprocal Rank
function reciprocalRank(rankedIds, correctIds) {
  const rank = rankOf(rankedIds, correctIds);

  if (rank === null) {
    return 0;
  }

  return 1 / rank;
}

// Find the first correct result's position
function rankOf(rankedIds, correctIds) {
  const index = rankedIds.findIndex(id => correctIds.includes(id));

  if (index === -1) {
    return null;
  }

  return index + 1;
}

// 3. Run the evaluation
let keywordTotalRR = 0;
let semanticTotalRR = 0;

let keywordHits = 0;
let semanticHits = 0;

const numberOfQueries = testSet.length;

const tableRows = [];

for (const test of testSet) {
  const query = test.query;
  const correctIds = test.correctIds;

  const keywordResults = results[query].keyword;
  const semanticResults = results[query].semantic;

  const keywordRank = rankOf(keywordResults, correctIds);
  const semanticRank = rankOf(semanticResults, correctIds);

  const keywordRR = reciprocalRank(keywordResults, correctIds);
  const semanticRR = reciprocalRank(semanticResults, correctIds);

  keywordTotalRR += keywordRR;
  semanticTotalRR += semanticRR;

  if (keywordRR > 0) {
    keywordHits++;
  }

  if (semanticRR > 0) {
    semanticHits++;
  }

  tableRows.push({
    query,
    keywordRank,
    semanticRank
  });
}

// Calculate MRR and Recall@10
const keywordMRR = keywordTotalRR / numberOfQueries;
const semanticMRR = semanticTotalRR / numberOfQueries;

const keywordRecall = keywordHits / numberOfQueries;
const semanticRecall = semanticHits / numberOfQueries;

// 4. Print the Markdown comparison table
console.log('| Query | Keyword rank | Semantic rank |');
console.log('|---|---:|---:|');

for (const row of tableRows) {
  const keyword = row.keywordRank === null
    ? 'miss'
    : row.keywordRank;

  const semantic = row.semanticRank === null
    ? 'miss'
    : row.semanticRank;

  console.log(`| ${row.query} | ${keyword} | ${semantic} |`);
}

// Print summary
console.log(
  `| **Summary** | MRR: ${keywordMRR.toFixed(2)}, Recall@10: ${keywordRecall.toFixed(2)} | MRR: ${semanticMRR.toFixed(2)}, Recall@10: ${semanticRecall.toFixed(2)} |`
);
