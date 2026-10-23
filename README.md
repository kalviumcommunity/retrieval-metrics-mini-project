
# Measuring Retrieval: MRR and Recall@10

## Overview

This project evaluates keyword search and semantic search using Mean Reciprocal Rank (MRR) and Recall@10.

- **MRR:** Measures how highly the first correct result is ranked. A higher value means correct results tend to appear nearer the top.
- **Recall@10:** Measures the fraction of queries for which a correct result appears in the top 10 results.

## Results

| Query | Keyword Rank | Semantic Rank |
|---|---:|---:|
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
| **Summary (MRR / Recall@10)** | **0.30 / 0.60** | **0.67 / 1.00** |

## Interpretation

Semantic search achieved an MRR of 0.67, compared with 0.30 for keyword search. This indicates that semantic search generally ranked correct results closer to the top. Semantic search achieved Recall@10 of 1.00, meaning it found a correct result in the top 10 for all 10 test queries. Keyword search achieved Recall@10 of 0.60, finding correct results for 6 of the 10 queries. Keyword search performed well on some exact-match queries, such as "redis or memcached for caching." Overall, semantic search performed better on this test set, although more queries would be needed to draw broader conclusions.

## How to Run

Make sure Node.js is installed, then run:

```bash
node eval.js
```

The program reads `test-set.csv` and `search-results.json` and prints a Markdown comparison table.
