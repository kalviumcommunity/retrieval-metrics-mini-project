# Retrieval Metrics Mini Project

This project evaluates two search systems, keyword search and semantic search, on the same set of 10 test queries. It computes **MRR** (Mean Reciprocal Rank) and **Recall@10** for each system and prints a markdown comparison table.

## Files

- `eval.js`: loads the test set and ranked results, computes the metrics, and prints the comparison table.
- `test-set.csv`: 10 queries with their correct post ids. Multiple correct answers are separated by semicolons.
- `search-results.json`: the top-10 ranked post ids each system returned for each query. Position 0 is rank 1.
- `posts-dataset.csv`: the 35 posts the ids refer to, for reference.

## Metrics

- **Reciprocal Rank (one query)** = 1 / (rank of the first correct answer), or 0 if it is not in the top 10.
- **MRR** = average reciprocal rank across all queries.
- **Recall@10** = (queries whose correct answer is in the top 10) / (total queries).

## Running

```bash
node eval.js
```

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

[Write 4 to 6 sentences in your own words. Cover: which system is better overall and on which metrics; which queries keyword search won and what they have in common; which queries semantic search won and what they have in common; and why a team would keep the weaker system.]