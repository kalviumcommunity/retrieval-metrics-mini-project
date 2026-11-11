# Retrieval Metrics Mini Project

A small, dependency-free Node.js program that compares keyword and semantic retrieval using **Mean Reciprocal Rank (MRR)** and **Recall@10**.

## Project files

- `eval.js` — calculates reciprocal rank, MRR, and Recall@10, then prints a Markdown comparison table.
- `test-set.csv` — the 10 gold-standard queries and their relevant post IDs. Multiple correct IDs are separated by semicolons.
- `search-results.json` — the top-10 ranked post IDs returned by keyword and semantic search for each query.
- `posts-dataset.csv` — the source post dataset, provided for optional inspection.

## Metrics

For a query, **Reciprocal Rank (RR)** is the reciprocal of the rank of the first relevant result. It is zero when no relevant result appears in the top 10.

```text
RR        = 1 / rank of the first relevant result (or 0 if not found)
MRR       = sum of all query RR scores / number of queries
Recall@10 = queries with a relevant result in the top 10 / total queries
```

MRR rewards systems that rank a correct answer near the top. Recall@10 measures whether a correct answer appears anywhere in the first ten results, regardless of its exact position.

## Run the project

Requires Node.js. No npm install or API keys are needed.

```bash
node eval.js
```

## Evaluation output

Running the script with the supplied fixture data prints:

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

Semantic search performs better overall: it scores **0.67 MRR and 1.00 Recall@10**, compared with keyword search at **0.30 MRR and 0.60 Recall@10**. Keyword search ranks the correct result higher for “redis or memcached for caching” and “sql or nosql for a new product”; both queries contain explicit technology or database terms that can match directly. Semantic search wins on the other eight queries, especially symptom-based and paraphrased questions where the wording differs from the underlying technical topic. It also finds a relevant result for all ten queries, while keyword search misses four. A team may still keep keyword search because exact technical terms can make it stronger on some queries, so combining both approaches may provide better coverage than relying on either one alone.

## Optional extension

If a PostgreSQL database with pgvector embeddings is available, replace the fixture results with live keyword and vector-search results. The evaluation functions can remain unchanged because they only need each system's ranked post IDs.
