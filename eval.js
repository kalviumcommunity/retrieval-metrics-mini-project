const fs = require('fs');

// --- 1. Load the inputs --------------------------------

function loadTestSet(path) {
  const lines = fs.readFileSync(path, 'utf8').trim().split('\n').slice(1);

  return lines.map(line => {
    const [query, ids] = line.split(',');
    return { query, correctIds: ids.split(';').map(Number) };
  });
}

const testSet = loadTestSet('test-set.csv');

const results = JSON.parse(
  fs.readFileSync('search-results.json', 'utf8')
);

// --- 2. Reciprocal Rank --------------------------------

function reciprocalRank(rankedIds, correctIds) {
  const rank = rankOf(rankedIds, correctIds);

  if (rank === null) {
    return 0;
  }

  return 1 / rank;
}

// Helper function to find the first correct answer rank

function rankOf(rankedIds, correctIds) {
  const index = rankedIds.findIndex(id => correctIds.includes(id));

  return index === -1 ? null : index + 1;
}

// --- 3. Run the evaluation loop ------------------------

let keywordTotalRR = 0;
let semanticTotalRR = 0;

let keywordHits = 0;
let semanticHits = 0;

const tableRows = [];

for (const item of testSet) {
  const query = item.query;
  const correctIds = item.correctIds;

  const keywordResults = results[query].keyword;
  const semanticResults = results[query].semantic;

  const keywordRR = reciprocalRank(keywordResults, correctIds);
  const semanticRR = reciprocalRank(semanticResults, correctIds);

  const keywordRank = rankOf(keywordResults, correctIds);
  const semanticRank = rankOf(semanticResults, correctIds);

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
    keywordRank: keywordRank === null ? 'miss' : keywordRank,
    semanticRank: semanticRank === null ? 'miss' : semanticRank
  });
}

// Calculate MRR and Recall@10

const totalQueries = testSet.length;

const keywordMRR = keywordTotalRR / totalQueries;
const semanticMRR = semanticTotalRR / totalQueries;

const keywordRecall = keywordHits / totalQueries;
const semanticRecall = semanticHits / totalQueries;

// --- 4. Print markdown comparison table ----------------

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