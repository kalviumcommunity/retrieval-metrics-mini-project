// eval.js
// Measuring Retrieval: MRR and Recall@10
import fs from 'node:fs';

// 1. Load the test set
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

// Load search results
const results = JSON.parse(
  fs.readFileSync('search-results.json', 'utf8')
);

// 2. Calculate Reciprocal Rank
function reciprocalRank(rankedIds, correctIds) {
  const rank = rankOf(rankedIds, correctIds);

  return rank === null ? 0 : 1 / rank;
}

// Find the rank of the first correct answer
function rankOf(rankedIds, correctIds) {
  const index = rankedIds.findIndex(id => correctIds.includes(id));

  return index === -1 ? null : index + 1;
}

// 3. Run the evaluation loop

let keywordTotal = 0;
let semanticTotal = 0;

let keywordHits = 0;
let semanticHits = 0;

const tableRows = [];

for (const item of testSet) {
  const keywordResults = results[item.query].keyword;
  const semanticResults = results[item.query].semantic;

  const keywordRR = reciprocalRank(keywordResults, item.correctIds);
  const semanticRR = reciprocalRank(semanticResults, item.correctIds);

  const keywordRank = rankOf(keywordResults, item.correctIds);
  const semanticRank = rankOf(semanticResults, item.correctIds);

  keywordTotal += keywordRR;
  semanticTotal += semanticRR;

  if (keywordRR > 0) keywordHits++;
  if (semanticRR > 0) semanticHits++;

  tableRows.push({
    query: item.query,
    keywordRank: keywordRank ?? 'miss',
    semanticRank: semanticRank ?? 'miss'
  });
}

// Calculate MRR and Recall@10

const totalQueries = testSet.length;

const keywordMRR = keywordTotal / totalQueries;
const semanticMRR = semanticTotal / totalQueries;

const keywordRecall = keywordHits / totalQueries;
const semanticRecall = semanticHits / totalQueries;

// 4. Print Markdown comparison table

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