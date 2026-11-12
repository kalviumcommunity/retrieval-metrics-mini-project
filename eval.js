// Evaluate the keyword and semantic search rankings with MRR and Recall@10.
// You should not need any libraries. Plain Node.js is enough.
const fs = require('fs');

// --- 1. Load the inputs (already done for you) -----------------------------
// test-set.csv has a header row, then: query,correct_post_ids
// correct_post_ids may be a semicolon list, e.g. "1024;1025".
function loadTestSet(path) {
  const lines = fs.readFileSync(path, 'utf8').trim().split('\n').slice(1);
  return lines.map(line => {
    const separator = line.lastIndexOf(',');
    if (separator === -1) {
      throw new Error(`Invalid test-set row: ${line}`);
    }
    const query = line.slice(0, separator).trim();
    const ids = line.slice(separator + 1).trim();
    return { query, correctIds: ids.split(';').map(Number) };
  });
}
const testSet = loadTestSet('test-set.csv');

// search-results.json maps each query to the top-10 ranked post_id lists that
// each system returned: { "<query>": { keyword: [...], semantic: [...] } }
const results = JSON.parse(fs.readFileSync('search-results.json', 'utf8'));

// --- 2. Reciprocal Rank ----------------------------------------------------
// Return 1 / (rank of the FIRST correct id in rankedIds). Return 0 if none of
// the correct ids appear in rankedIds. Rank is 1-based (first result = rank 1).
function reciprocalRank(rankedIds, correctIds) {
  const rank = rankOf(rankedIds, correctIds);
  return rank === null ? 0 : 1 / rank;
}

// Helper: the 1-based rank of the first correct id, or null if it is a miss.
function rankOf(rankedIds, correctIds) {
  const correctIdSet = new Set(correctIds);
  const index = rankedIds.findIndex(id => correctIdSet.has(id));
  return index === -1 ? null : index + 1;
}

// --- 3. Run the evaluation loop -------------------------------------------
// For every query: look up its keyword and semantic ranked lists, compute the
// reciprocal rank of each, accumulate the RRs, and count a "hit" whenever the
// correct answer was found in the top 10 (RR > 0).
// Then compute:
//   keywordMRR, semanticMRR         = average RR across all queries
//   keywordRecall, semanticRecall   = hits / number of queries
const totals = {
  keyword: { reciprocalRanks: 0, hits: 0 },
  semantic: { reciprocalRanks: 0, hits: 0 }
};

const rows = testSet.map(({ query, correctIds }) => {
  const queryResults = results[query];
  if (!queryResults || !Array.isArray(queryResults.keyword) || !Array.isArray(queryResults.semantic)) {
    throw new Error(`Missing ranked results for query: ${query}`);
  }

  const keywordRank = rankOf(queryResults.keyword, correctIds);
  const semanticRank = rankOf(queryResults.semantic, correctIds);
  const keywordRR = reciprocalRank(queryResults.keyword, correctIds);
  const semanticRR = reciprocalRank(queryResults.semantic, correctIds);

  totals.keyword.reciprocalRanks += keywordRR;
  totals.keyword.hits += keywordRR > 0 ? 1 : 0;
  totals.semantic.reciprocalRanks += semanticRR;
  totals.semantic.hits += semanticRR > 0 ? 1 : 0;

  return { query, keywordRank, semanticRank };
});

const queryCount = testSet.length;
if (queryCount === 0) {
  throw new Error('The test set must contain at least one query.');
}

const keywordMRR = totals.keyword.reciprocalRanks / queryCount;
const semanticMRR = totals.semantic.reciprocalRanks / queryCount;
const keywordRecall = totals.keyword.hits / queryCount;
const semanticRecall = totals.semantic.hits / queryCount;

// --- 4. Print a markdown comparison table ---------------------------------
// Print one row per query: | query | keyword rank | semantic rank |  (use "miss"
// when the answer was not in the top 10), then a final **Summary** row with
// MRR and Recall@10 for each system, each rounded to 2 decimals.
const displayRank = rank => rank === null ? 'miss' : rank;
const formatMetric = value => value.toFixed(2);

console.log('| Query | Keyword rank | Semantic rank |');
console.log('|---|---|---|');
for (const { query, keywordRank, semanticRank } of rows) {
  console.log(`| ${query} | ${displayRank(keywordRank)} | ${displayRank(semanticRank)} |`);
}
console.log(`| **Summary** | **MRR ${formatMetric(keywordMRR)} · Recall@10 ${formatMetric(keywordRecall)}** | **MRR ${formatMetric(semanticMRR)} · Recall@10 ${formatMetric(semanticRecall)}** |`);
