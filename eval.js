
const fs = require('fs');

// --- 1. Load the inputs --------------------------------

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

// --- 2. Reciprocal Rank --------------------------------

function reciprocalRank(rankedIds, correctIds) {
  for (let i = 0; i < Math.min(rankedIds.length, 10); i++) {
    if (correctIds.includes(rankedIds[i])) {
      return 1 / (i + 1);
    }
  }

  return 0;
}

// Find 1-based rank
function rankOf(rankedIds, correctIds) {
  for (let i = 0; i < Math.min(rankedIds.length, 10); i++) {
    if (correctIds.includes(rankedIds[i])) {
      return i + 1;
    }
  }

  return null;
}

// --- 3. Evaluation loop --------------------------------

let keywordRRTotal = 0;
let semanticRRTotal = 0;

let keywordHits = 0;
let semanticHits = 0;

const tableRows = [];

for (const item of testSet) {
  const queryResults = results[item.query];

  if (!queryResults) {
    throw new Error(`Missing search results for: ${item.query}`);
  }

  const keywordList = queryResults.keyword;
  const semanticList = queryResults.semantic;

  const keywordRR = reciprocalRank(keywordList, item.correctIds);
  const semanticRR = reciprocalRank(semanticList, item.correctIds);

  const keywordRank = rankOf(keywordList, item.correctIds);
  const semanticRank = rankOf(semanticList, item.correctIds);

  keywordRRTotal += keywordRR;
  semanticRRTotal += semanticRR;

  if (keywordRR > 0) keywordHits++;
  if (semanticRR > 0) semanticHits++;

  tableRows.push({
    query: item.query,
    keywordRank: keywordRank === null ? 'miss' : keywordRank,
    semanticRank: semanticRank === null ? 'miss' : semanticRank
  });
}

const totalQueries = testSet.length;

const keywordMRR = keywordRRTotal / totalQueries;
const semanticMRR = semanticRRTotal / totalQueries;

const keywordRecall = keywordHits / totalQueries;
const semanticRecall = semanticHits / totalQueries;


// --- 4. Print Markdown table ---------------------------

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
