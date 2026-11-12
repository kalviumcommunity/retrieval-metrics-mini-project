// Evaluate keyword and semantic retrieval using MRR and Recall@10.
const fs = require('node:fs');

// --- 1. Load the inputs -----------------------------------------------------
function loadTestSet(path) {
  const lines = fs.readFileSync(path, 'utf8').trim().split(/\r?\n/).slice(1);
  return lines.map((line) => {
    const separator = line.lastIndexOf(',');
    const query = line.slice(0, separator);
    const ids = line.slice(separator + 1);
    return { query, correctIds: ids.split(';').map(Number) };
  });
}

const testSet = loadTestSet('test-set.csv');
const results = JSON.parse(fs.readFileSync('search-results.json', 'utf8'));

// --- 2. Reciprocal Rank ----------------------------------------------------
// Return the 1-based rank of the first relevant result, or null for a miss.
function rankOf(rankedIds, correctIds) {
  const relevantIds = new Set(correctIds);
  const index = rankedIds.findIndex((id) => relevantIds.has(Number(id)));
  return index === -1 ? null : index + 1;
}

function reciprocalRank(rankedIds, correctIds) {
  const rank = rankOf(rankedIds, correctIds);
  return rank === null ? 0 : 1 / rank;
}

// --- 3. Evaluate both systems ----------------------------------------------
const scores = {
  keyword: { reciprocalRanks: [], hits: 0 },
  semantic: { reciprocalRanks: [], hits: 0 },
};

const rows = [];

for (const { query, correctIds } of testSet) {
  const queryResults = results[query];

  if (
    !queryResults ||
    !Array.isArray(queryResults.keyword) ||
    !Array.isArray(queryResults.semantic)
  ) {
    throw new Error(`Missing ranked results for query: ${query}`);
  }

  const keywordRank = rankOf(queryResults.keyword, correctIds);
  const semanticRank = rankOf(queryResults.semantic, correctIds);

  scores.keyword.reciprocalRanks.push(
    reciprocalRank(queryResults.keyword, correctIds)
  );
  scores.semantic.reciprocalRanks.push(
    reciprocalRank(queryResults.semantic, correctIds)
  );

  if (keywordRank !== null) scores.keyword.hits += 1;
  if (semanticRank !== null) scores.semantic.hits += 1;

  rows.push({
    query,
    keywordRank: keywordRank === null ? 'miss' : keywordRank,
    semanticRank: semanticRank === null ? 'miss' : semanticRank,
  });
}

const totalQueries = testSet.length;

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / totalQueries;
}

const keywordMRR = mean(scores.keyword.reciprocalRanks);
const semanticMRR = mean(scores.semantic.reciprocalRanks);
const keywordRecall = scores.keyword.hits / totalQueries;
const semanticRecall = scores.semantic.hits / totalQueries;

// --- 4. Print the markdown comparison table --------------------------------
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
