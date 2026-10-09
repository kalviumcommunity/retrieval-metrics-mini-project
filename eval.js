
// eval.js

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

  if (rank === null) {
    return 0;
  }

  return 1 / rank;
}

// Find the 1-based rank of the first correct answer

function rankOf(rankedIds, correctIds) {
  const index = rankedIds.findIndex(id =>
    correctIds.includes(Number(id))
  );

  return index === -1 ? null : index + 1;
}

// 3. Run the evaluation loop

let keywordRRTotal = 0;
let semanticRRTotal = 0;

let keywordHits = 0;
let semanticHits = 0;

const tableRows = [];

for (const item of testSet) {
  const query = item.query;
  const correctIds = item.correctIds;

  const keywordIds = results[query].keyword;
  const semanticIds = results[query].semantic;

  const keywordRank = rankOf(keywordIds, correctIds);
  const semanticRank = rankOf(semanticIds, correctIds);

  const keywordRR = reciprocalRank(keywordIds, correctIds);
  const semanticRR = reciprocalRank(semanticIds, correctIds);

  keywordRRTotal += keywordRR;
  semanticRRTotal += semanticRR;

  if (keywordRR > 0) {
    keywordHits++;
  }

  if (semanticRR > 0) {
    semanticHits++;
  }

  tableRows.push({
    query,
    keywordRank: keywordRank ?? 'miss',
    semanticRank: semanticRank ?? 'miss'
  });
}

const totalQueries = testSet.length;

const keywordMRR = keywordRRTotal / totalQueries;
const semanticMRR = semanticRRTotal / totalQueries;

const keywordRecall = keywordHits / totalQueries;
const semanticRecall = semanticHits / totalQueries;

// 4. Print the Markdown comparison table

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
