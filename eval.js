const fs = require("fs");

// Read the test set and search results.
const csv = fs.readFileSync("test-set.csv", "utf8").trim();
const searchResults = JSON.parse(
  fs.readFileSync("search-results.json", "utf8")
);

// Parse a CSV row, including quoted fields.
function parseCSVLine(line) {
  const values = [];
  let value = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        value += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      values.push(value);
      value = "";
    } else {
      value += char;
    }
  }

  values.push(value);
  return values;
}

// Convert the CSV into query and correct-answer records.
const lines = csv.split(/\r?\n/);
const headers = parseCSVLine(lines[0]).map((h) => h.trim());

const queryIndex = headers.indexOf("query");
const correctIndex = headers.indexOf("correct_post_ids");

if (queryIndex === -1 || correctIndex === -1) {
  throw new Error(
    "Could not find query and correct_post_ids columns in test-set.csv"
  );
}

const testSet = lines.slice(1)
  .filter((line) => line.trim() !== "")
  .map((line) => {
    const columns = parseCSVLine(line);

    return {
      query: columns[queryIndex].trim(),
      correct_post_ids: columns[correctIndex]
        .split(";")
        .map((id) => id.trim())
        .filter(Boolean)
    };
  });

// Calculate Reciprocal Rank.
// The first correct result gets the score 1 / rank.
// Return 0 if no correct result appears in the top 10.
function reciprocalRank(results, correctIds) {
  for (let i = 0; i < results.length; i++) {
    const result = results[i];

    const postId =
      typeof result === "object" && result !== null
        ? result.post_id
        : result;

    if (correctIds.includes(String(postId))) {
      return 1 / (i + 1);
    }
  }

  return 0;
}

// Get the rank of the first correct result for display.
function correctRank(results, correctIds) {
  for (let i = 0; i < results.length; i++) {
    const result = results[i];

    const postId =
      typeof result === "object" && result !== null
        ? result.post_id
        : result;

    if (correctIds.includes(String(postId))) {
      return i + 1;
    }
  }

  return "miss";
}

// Store reciprocal ranks and hit counts for both systems.
const keywordRRs = [];
const semanticRRs = [];

let keywordHits = 0;
let semanticHits = 0;

const tableRows = [];

// Evaluate every query.
for (const item of testSet) {
  const { query, correct_post_ids } = item;

  const results = searchResults[query];

  if (!results || !results.keyword || !results.semantic) {
    throw new Error(`Search results not found for query: ${query}`);
  }

  const keywordResults = results.keyword;
  const semanticResults = results.semantic;

  const keywordRR = reciprocalRank(
    keywordResults,
    correct_post_ids
  );

  const semanticRR = reciprocalRank(
    semanticResults,
    correct_post_ids
  );

  keywordRRs.push(keywordRR);
  semanticRRs.push(semanticRR);

  if (keywordRR > 0) keywordHits++;
  if (semanticRR > 0) semanticHits++;

  tableRows.push({
    query,
    keywordRank: correctRank(keywordResults, correct_post_ids),
    semanticRank: correctRank(semanticResults, correct_post_ids)
  });
}

// Calculate the mean of an array.
function mean(values) {
  if (values.length === 0) return 0;

  return values.reduce((sum, value) => sum + value, 0) /
    values.length;
}

// Calculate MRR and Recall@10.
const keywordMRR = mean(keywordRRs);
const semanticMRR = mean(semanticRRs);

const keywordRecall = keywordHits / testSet.length;
const semanticRecall = semanticHits / testSet.length;

// Print the Markdown comparison table.
console.log("| Query | Keyword rank | Semantic rank |");
console.log("|---|---|---|");

for (const row of tableRows) {
  console.log(
    `| ${row.query} | ${row.keywordRank} | ${row.semanticRank} |`
  );
}

console.log(
  `| **Summary** | **MRR ${keywordMRR.toFixed(2)} · Recall@10 ${keywordRecall.toFixed(2)}** | **MRR ${semanticMRR.toFixed(2)} · Recall@10 ${semanticRecall.toFixed(2)}** |`
);

