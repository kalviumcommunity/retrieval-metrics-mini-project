
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

// --- 2. Reciprocal Rank -------------------------------

// Return 1 / rank of first correct result
function reciprocalRank(rankedIds, correctIds) {
  const rank = rankOf(rankedIds, correctIds);

  if (rank === null) {
    return 0;
  }

  return 1 / rank;
}

// Find the rank of the first correct result
function rankOf(rankedIds, correctIds) {
  for (let i = 0; i < rankedIds.length; i++) {
    if (correctIds.includes(Number(rankedIds[i]))) {
      return i + 1;
    }
  }

  return null;
}

// --- 3. Run the evaluation loop ------------------------

let keywordTotalRR = 0;
let semanticTotalRR = 0;

let keywordHits = 0;
let semanticHits = 0;

const comparison = [];

for (const item of testSet) {
  const query = item.query;
  const correctIds = item.correctIds;

  const keywordResults = results[query]?.keyword || [];
  const semanticResults = results[query]?.semantic || [];

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

  comparison.push({
    query,
    keywordRank: keywordRank ?? 'miss',
    semanticRank: semanticRank ?? 'miss'
  });
}

// Calculate MRR and Recall@10
const totalQueries = testSet.length;

const keywordMRR = keywordTotalRR / totalQueries;
const semanticMRR = semanticTotalRR / totalQueries;

const keywordRecall = keywordHits / totalQueries;
const semanticRecall = semanticHits / totalQueries;

// --- 4. Print Markdown comparison table ----------------

console.log('| Query | Keyword Rank | Semantic Rank |');
console.log('|---|---:|---:|');

for (const row of comparison) {
  console.log(
    `| ${row.query} | ${row.keywordRank} | ${row.semanticRank} |`
  );
}

console.log(
  `| **Summary (MRR / Recall@10)** | **${keywordMRR.toFixed(2)} / ${keywordRecall.toFixed(2)}** | **${semanticMRR.toFixed(2)} / ${semanticRecall.toFixed(2)}** |`
);
