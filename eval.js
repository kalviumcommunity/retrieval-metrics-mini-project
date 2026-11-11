// Evaluate keyword and semantic retrieval using MRR and Recall@10.
// Run with: node eval.js
// No third-party packages are required.

const fs = require('node:fs');
const path = require('node:path');

const TOP_K = 10;

function parseCsvLine(line) {
  const fields = [];
  let value = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"' && line[i + 1] === '"' && inQuotes) {
      value += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      fields.push(value);
      value = '';
    } else {
      value += char;
    }
  }

  fields.push(value);
  return fields;
}

function loadTestSet(filePath) {
  const content = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '').trim();
  const lines = content.split(/\r?\n/);

  if (lines.length < 2) {
    throw new Error('test-set.csv must contain a header and at least one query.');
  }

  const header = parseCsvLine(lines[0]).map((field) => field.trim());
  const queryIndex = header.indexOf('query');
  const idsIndex = header.indexOf('correct_post_ids');

  if (queryIndex === -1 || idsIndex === -1) {
    throw new Error('CSV must contain query and correct_post_ids columns.');
  }

  return lines.slice(1).filter((line) => line.trim() !== '').map((line, index) => {
    const fields = parseCsvLine(line);
    const query = (fields[queryIndex] || '').trim();
    const correctIds = (fields[idsIndex] || '')
      .split(';')
      .map((id) => Number(id.trim()))
      .filter(Number.isFinite);

    if (!query || correctIds.length === 0) {
      throw new Error(`Invalid test-set.csv row at line ${index + 2}.`);
    }

    return { query, correctIds };
  });
}

// Return the 1-based rank of the first relevant result, or null for a miss.
function rankOf(rankedIds, correctIds) {
  if (!Array.isArray(rankedIds) || !Array.isArray(correctIds)) {
    throw new TypeError('rankedIds and correctIds must be arrays.');
  }

  const correctIdSet = new Set(correctIds.map(Number));
  const index = rankedIds.findIndex((id) => correctIdSet.has(Number(id)));

  return index === -1 || index >= TOP_K ? null : index + 1;
}

// Reciprocal Rank gives more credit when a relevant result appears near the top.
function reciprocalRank(rankedIds, correctIds) {
  const rank = rankOf(rankedIds, correctIds);
  return rank === null ? 0 : 1 / rank;
}

function getRankedResults(query, system, results) {
  const queryResults = results[query];

  if (!queryResults || !Array.isArray(queryResults[system])) {
    throw new Error(`Missing ${system} results for query: "${query}"`);
  }

  return queryResults[system].slice(0, TOP_K);
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function evaluate(testSet, results) {
  const keywordRRs = [];
  const semanticRRs = [];
  let keywordHits = 0;
  let semanticHits = 0;
  const rows = [];

  for (const { query, correctIds } of testSet) {
    const keywordResults = getRankedResults(query, 'keyword', results);
    const semanticResults = getRankedResults(query, 'semantic', results);

    const keywordRank = rankOf(keywordResults, correctIds);
    const semanticRank = rankOf(semanticResults, correctIds);
    const keywordRR = reciprocalRank(keywordResults, correctIds);
    const semanticRR = reciprocalRank(semanticResults, correctIds);

    keywordRRs.push(keywordRR);
    semanticRRs.push(semanticRR);

    if (keywordRR > 0) keywordHits += 1;
    if (semanticRR > 0) semanticHits += 1;

    rows.push({
      query,
      keywordRank: keywordRank === null ? 'miss' : keywordRank,
      semanticRank: semanticRank === null ? 'miss' : semanticRank,
    });
  }

  return {
    rows,
    keyword: {
      mrr: average(keywordRRs),
      recall: keywordHits / testSet.length,
    },
    semantic: {
      mrr: average(semanticRRs),
      recall: semanticHits / testSet.length,
    },
  };
}

function printMarkdownTable(report) {
  console.log('| Query | Keyword rank | Semantic rank |');
  console.log('|---|---:|---:|');

  for (const row of report.rows) {
    console.log(`| ${row.query} | ${row.keywordRank} | ${row.semanticRank} |`);
  }

  const keyword = report.keyword;
  const semantic = report.semantic;

  console.log(
    `| **Summary** | **MRR ${keyword.mrr.toFixed(2)} · Recall@10 ${keyword.recall.toFixed(2)}** | **MRR ${semantic.mrr.toFixed(2)} · Recall@10 ${semantic.recall.toFixed(2)}** |`,
  );
}

function main() {
  const root = __dirname;
  const testSet = loadTestSet(path.join(root, 'test-set.csv'));
  const results = JSON.parse(
    fs.readFileSync(path.join(root, 'search-results.json'), 'utf8'),
  );

  const report = evaluate(testSet, results);
  printMarkdownTable(report);
}

main();
