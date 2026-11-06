import fs from "fs";

// 1. Load test-set.csv and search-results.json
const csvContent = fs.readFileSync("test-set.csv", "utf8").trim();
const searchResults = JSON.parse(fs.readFileSync("search-results.json", "utf8"));

// 2. Parse test-set.csv
const rawLines = csvContent.split("\n").map((line) => line.trim()).filter(Boolean);

// Remove CSV header if present
const dataLines = rawLines[0].toLowerCase().startsWith("query")
  ? rawLines.slice(1)
  : rawLines;

const testCases = dataLines.map((line) => {
  const lastCommaIndex = line.lastIndexOf(",");
  const query = line.slice(0, lastCommaIndex).replace(/^"|"$/g, "").trim();
  const rawIds = line.slice(lastCommaIndex + 1).replace(/^"|"$/g, "").trim();
  const correctIds = rawIds.split(";").map((id) => Number(id.trim()));
  return { query, correctIds };
});

// Helper function to evaluate rank, reciprocal rank, and hit count
function evaluateQuery(rankedList, correctIds) {
  const validIds = new Set(correctIds);

  for (let i = 0; i < rankedList.length; i++) {
    if (validIds.has(Number(rankedList[i]))) {
      const rank = i + 1; // 1-based position
      return { rankDisplay: String(rank), rr: 1 / rank, hit: 1 };
    }
  }

  return { rankDisplay: "miss", rr: 0, hit: 0 };
}

// 3. Run evaluation loop
let keywordTotalRR = 0;
let keywordHits = 0;
let semanticTotalRR = 0;
let semanticHits = 0;

const rows = [];

for (const { query, correctIds } of testCases) {
  const queryResults = searchResults[query] || { keyword: [], semantic: [] };

  const kw = evaluateQuery(queryResults.keyword || [], correctIds);
  const sem = evaluateQuery(queryResults.semantic || [], correctIds);

  keywordTotalRR += kw.rr;
  keywordHits += kw.hit;
  semanticTotalRR += sem.rr;
  semanticHits += sem.hit;

  rows.push(`| ${query} | ${kw.rankDisplay} | ${sem.rankDisplay} |`);
}

const totalQueries = testCases.length;
const kwMRR = (keywordTotalRR / totalQueries).toFixed(2);
const kwRecall = (keywordHits / totalQueries).toFixed(2);
const semMRR = (semanticTotalRR / totalQueries).toFixed(2);
const semRecall = (semanticHits / totalQueries).toFixed(2);

// 4. Output Markdown Table
console.log("| Query | Keyword rank | Semantic rank |");
console.log("|---|---|---|");
rows.forEach((row) => console.log(row));
console.log(
  `| **Summary** | **MRR ${kwMRR} · Recall@10 ${kwRecall}** | **MRR ${semMRR} · Recall@10 ${semRecall}** |`
);