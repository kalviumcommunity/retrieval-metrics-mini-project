const fs = require('fs');

const lines = fs.readFileSync('test-set.csv', 'utf8')
  .trim()
  .split(/\r?\n/)
  .slice(1);

const testSet = lines.map(line => {
  const [query, ids] = line.split(',');
  return {
    query,
    correctIds: ids.split(';').map(Number)
  };
});

const results = JSON.parse(
  fs.readFileSync('search-results.json', 'utf8')
);

function reciprocalRank(rankedIds, correctIds) {
  for (let i = 0; i < rankedIds.length; i++) {
    if (correctIds.includes(Number(rankedIds[i]))) {
      return 1 / (i + 1);
    }
  }
  return 0;
}

function rankOf(rankedIds, correctIds) {
  for (let i = 0; i < rankedIds.length; i++) {
    if (correctIds.includes(Number(rankedIds[i]))) {
      return i + 1;
    }
  }
  return 'miss';
}

const keywordRRs = [];
const semanticRRs = [];

let keywordHits = 0;
let semanticHits = 0;

const rows = [];

for (const item of testSet) {
  const keyword = results[item.query].keyword;
  const semantic = results[item.query].semantic;

  const kwRR = reciprocalRank(keyword, item.correctIds);
  const semRR = reciprocalRank(semantic, item.correctIds);

  keywordRRs.push(kwRR);
  semanticRRs.push(semRR);

  if (kwRR > 0) keywordHits++;
  if (semRR > 0) semanticHits++;

  rows.push({
    query: item.query,
    keywordRank: rankOf(keyword, item.correctIds),
    semanticRank: rankOf(semantic, item.correctIds)
  });
}

function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

const keywordMRR = mean(keywordRRs);
const semanticMRR = mean(semanticRRs);

const keywordRecall = keywordHits / testSet.length;
const semanticRecall = semanticHits / testSet.length;

console.log('| Query | Keyword rank | Semantic rank |');
console.log('|---|---|---|');

for (const row of rows) {
  console.log(`| ${row.query} | ${row.keywordRank} | ${row.semanticRank} |`);
}

console.log(
  `| **Summary** | **MRR ${keywordMRR.toFixed(2)} · Recall@10 ${keywordRecall.toFixed(2)}** | **MRR ${semanticMRR.toFixed(2)} · Recall@10 ${semanticRecall.toFixed(2)}** |`
);
