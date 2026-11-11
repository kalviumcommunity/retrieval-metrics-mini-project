const fs = require('fs');
const path = require('path');

// Helper to parse simple CSV file (query,correct_post_ids)
function loadTestSet(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
    const testSet = [];
    
    const startIndex = lines[0].startsWith('query') ? 1 : 0;
    
    for (let i = startIndex; i < lines.length; i++) {
        const lastCommaIndex = lines[i].lastIndexOf(',');
        const query = lines[i].substring(0, lastCommaIndex).replace(/^["']|["']$/g, '');
        const idsStr = lines[i].substring(lastCommaIndex + 1).replace(/^["']|["']$/g, '');
        const correctIds = idsStr.split(';').map(id => id.trim());
        
        testSet.push({ query, correctIds });
    }
    return testSet;
}

// Load files
const testSetPath = path.join(__dirname, 'test-set.csv');
const searchResultsPath = path.join(__dirname, 'search-results.json');

const testSet = loadTestSet(testSetPath);
const searchResults = JSON.parse(fs.readFileSync(searchResultsPath, 'utf-8'));

// TODO 1: Reciprocal Rank function
function getReciprocalRank(rankedList, correctIds) {
    for (let i = 0; i < rankedList.length; i++) {
        const docId = String(rankedList[i]);
        if (correctIds.includes(docId)) {
            const rank = i + 1;
            return { rank, rr: 1 / rank };
        }
    }
    return { rank: 'miss', rr: 0 };
}

// TODO 2 & 3: Run the evaluation loop and accumulate metrics
let keywordRRSum = 0;
let keywordHits = 0;
let semanticRRSum = 0;
let semanticHits = 0;

const totalQueries = testSet.length;
const resultsTable = [];

for (const item of testSet) {
    const { query, correctIds } = item;
    const systemResult = searchResults[query] || { keyword: [], semantic: [] };

    const kwEval = getReciprocalRank(systemResult.keyword, correctIds);
    const semEval = getReciprocalRank(systemResult.semantic, correctIds);

    keywordRRSum += kwEval.rr;
    if (kwEval.rank !== 'miss') keywordHits++;

    semanticRRSum += semEval.rr;
    if (semEval.rank !== 'miss') semanticHits++;

    resultsTable.push({
        query,
        kwRank: kwEval.rank,
        semRank: semEval.rank
    });
}

const keywordMRR = (keywordRRSum / totalQueries).toFixed(2);
const keywordRecall = (keywordHits / totalQueries).toFixed(2);

const semanticMRR = (semanticRRSum / totalQueries).toFixed(2);
const semanticRecall = (semanticHits / totalQueries).toFixed(2);

// TODO 4: Print the Markdown comparison table
console.log('| Query | Keyword rank | Semantic rank |');
console.log('|---|---|---|');

for (const row of resultsTable) {
    console.log(`| ${row.query} | ${row.kwRank} | ${row.semRank} |`);
}

console.log(`| **Summary** | **MRR ${keywordMRR} · Recall@10 ${keywordRecall}** | **MRR ${semanticMRR} · Recall@10 ${semanticRecall}** |`);