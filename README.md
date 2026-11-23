# Retrieval Metrics Evaluation

## Introduction

This project compares two search systems:

- Keyword Search
- Semantic Search

The comparison uses two evaluation metrics:

- **MRR (Mean Reciprocal Rank):** Measures how high the first correct result appears in the search results.
- **Recall@10:** Measures how many queries have at least one correct answer in the top 10 results.

## Results

| Query | Keyword rank | Semantic rank |
|---|---|---|
| my redis cache keeps showing old data | 8 | 1 |
| how do I add semantic search to a table I already have | miss | 2 |
| redis or memcached for caching | 1 | 2 |
| why did my query get slower after I added an index | miss | 1 |
| what does ACID actually guarantee | 2 | 1 |
| how do I keep my postgres online while changing the schema | 6 | 3 |
| my background jobs stop after every deploy | miss | 2 |
| how do I let my database accept more writes per second | 4 | 1 |
| sql or nosql for a new product | 1 | 3 |
| why does my redis memory keep climbing | miss | 2 |
| **Summary** | **MRR 0.30 · Recall@10 0.60** | **MRR 0.67 · Recall@10 1.00** |

## Interpretation

Semantic search performs better overall than keyword search because it achieves a higher MRR of 0.67 and Recall@10 of 1.00. Keyword search performs better on the queries "redis or memcached for caching" and "sql or nosql for a new product" because these queries contain specific technical keywords. Semantic search performs better on the remaining eight queries because it understands the meaning and intention behind questions rather than depending only on exact words. It also finds relevant results for all 10 queries, while keyword search misses four queries. A team might still keep keyword search because it performs well on exact keyword-based searches, and both systems can complement each other.

## How to Run

Make sure Node.js is installed.

Run the following command:

```bash
node eval.js
```

No database or API keys are required.