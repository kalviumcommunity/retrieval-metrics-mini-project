const fs = require("fs");

// Load the test set
function loadTestSet(path) {
    const lines = fs.readFileSync(path, "utf8").trim().split(/\r?\n/);
    const headers = lines[0].split(",");

    return lines.slice(1).filter(Boolean).map(line => {
        const [query, ids] = line.split(",");

        return {
            query,
            correctIds: ids.split(";").map(Number)
        };
    });
}

const testSet = loadTestSet("test-set.csv");

const results = JSON.parse(
    fs.readFileSync("search-results.json", "utf8")
);

// Calculate Reciprocal Rank
function reciprocalRank(rankedIds, correctIds) {
    const rank = rankOf(rankedIds, correctIds);
    return rank === null ? 0 : 1 / rank;
}

// Find the first correct result's 1-based rank
function rankOf(rankedIds, correctIds) {
    const correctSet = new Set(correctIds);

    for (let i = 0; i < rankedIds.length; i++) {
        if (correctSet.has(Number(rankedIds[i]))) {
            return i + 1;
        }
    }

    return null;
}

// Evaluation variables
const keywordRRs = [];
const semanticRRs = [];

let keywordHits = 0;
let semanticHits = 0;

const tableRows = [];

// Evaluate every query
for (const item of testSet) {
    const queryResults = results[item.query];

    if (!queryResults) {
        throw new Error(`Missing search results: ${item.query}`);
    }

    const keywordRank = rankOf(
        queryResults.keyword,
        item.correctIds
    );

    const semanticRank = rankOf(
        queryResults.semantic,
        item.correctIds
    );

    const keywordRR = reciprocalRank(
        queryResults.keyword,
        item.correctIds
    );

    const semanticRR = reciprocalRank(
        queryResults.semantic,
        item.correctIds
    );

    keywordRRs.push(keywordRR);
    semanticRRs.push(semanticRR);

    if (keywordRR > 0) keywordHits++;
    if (semanticRR > 0) semanticHits++;

    tableRows.push({
        query: item.query,
        keywordRank: keywordRank ?? "miss",
        semanticRank: semanticRank ?? "miss"
    });
}

// Calculate MRR
function mean(values) {
    return values.reduce((sum, value) => sum + value, 0)
        / values.length;
}

const keywordMRR = mean(keywordRRs);
const semanticMRR = mean(semanticRRs);

// Calculate Recall@10
const keywordRecall = keywordHits / testSet.length;
const semanticRecall = semanticHits / testSet.length;

// Print Markdown comparison table
console.log("| Query | Keyword rank | Semantic rank |");
console.log("|---|---|---|");

for (const row of tableRows) {
    console.log(
        `| ${row.query} | ${row.keywordRank} | ${row.semanticRank} |`
    );
}

// Print summary
console.log(
    `| **Summary** | **MRR ${keywordMRR.toFixed(2)} · Recall@10 ${keywordRecall.toFixed(2)}** | **MRR ${semanticMRR.toFixed(2)} · Recall@10 ${semanticRecall.toFixed(2)}** |`
);
