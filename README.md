# Retrieval Metrics: MRR and Recall@10

This project evaluates keyword search and semantic search against the same ten test queries using Mean Reciprocal Rank (MRR) and Recall@10.

## Result table

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

Semantic search is better overall because it achieves both a higher MRR (0.67 compared with 0.30) and higher Recall@10 (1.00 compared with 0.60). Keyword search ranks the Redis-versus-Memcached query and the SQL-versus-NoSQL query higher, likely because their distinctive product and technology names closely match the document titles. Semantic search ranks higher on the other eight queries, especially when the user describes a problem or goal in natural language rather than repeating the exact words in a post title. These include questions about stale Redis data, adding semantic search, slow queries after indexing, ACID guarantees, online schema changes, background jobs after deployment, database write throughput, and growing Redis memory usage. A team may still keep keyword search because exact terminology can produce precise matches and it complements semantic search on the queries where literal wording matters.

## How to run

No database, API keys, or external packages are required. Run:

```bash
node eval.js
```

The script reads `test-set.csv` and `search-results.json`, calculates the first relevant rank for each query, computes MRR and Recall@10 for both systems, and prints the comparison table.
