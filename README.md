# Retrieval Metrics Mini Project

## Evaluation results

Run the evaluator with:

```bash
node eval.js
```

The program prints this Markdown comparison table:

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

Semantic search performs better overall, achieving a higher MRR of 0.67 and a perfect Recall@10 of 1.00, compared with keyword search at 0.30 and 0.60. Keyword search wins on “redis or memcached for caching” and “sql or nosql for a new product,” where the queries contain specific product and technology terms that closely match the relevant content. Semantic search wins on the other eight queries, including questions about stale Redis data, adding semantic search, slower indexed queries, ACID guarantees, online schema changes, background jobs, database write throughput, and Redis memory growth. These wins suggest semantic search is better at understanding the intent and meaning of varied, natural-language questions, even when the wording does not closely match the relevant post. A team may still keep keyword search because exact terms, product names, and technical phrases can make it more effective for some queries, so the two approaches can complement each other.

