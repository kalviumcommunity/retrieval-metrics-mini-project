# Retrieval Metrics Mini Project

This project evaluates keyword search and semantic search using **Mean Reciprocal Rank (MRR)** and **Recall@10**.

## Files

- `eval.js` — computes reciprocal rank for each query, averages the scores into MRR, calculates Recall@10, and prints a Markdown comparison table.
- `test-set.csv` — the 10 gold-standard queries and their correct post IDs.
- `search-results.json` — the top-10 ranked post IDs returned by each search system.
- `posts-dataset.csv` — the supplied post dataset for reference.

## Run the evaluation

You only need Node.js; no database, API keys, or npm packages are required.

```bash
node eval.js
```

## Results

| Query | Keyword rank | Semantic rank |
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
| **Summary** | **MRR 0.30 · Recall@10 0.60** | **MRR 0.67 · Recall@10 1.00** |

## Interpretation

Semantic search performs better overall on both metrics: it has a higher MRR (0.67 versus 0.30) and higher Recall@10 (1.00 versus 0.60). Keyword search wins on “redis or memcached for caching” and “sql or nosql for a new product,” where exact technical terms appear directly in the query and match the document wording. Semantic search wins on the remaining queries, especially symptom-based or paraphrased questions such as outdated Redis data, slow queries, and background jobs stopping after deployment. These results show that semantic search finds a relevant answer for all ten queries and generally ranks it closer to the top. A team may still keep keyword search because exact rare terms and product-specific wording can be matched more effectively by literal text search on some queries.

## Metric definitions

- **Reciprocal Rank (RR):** `1 / rank` of the first correct result; `0` when no correct result appears in the top 10.
- **Mean Reciprocal Rank (MRR):** average RR across all test queries.
- **Recall@10:** number of queries with at least one correct result in the top 10 divided by the total number of queries.
