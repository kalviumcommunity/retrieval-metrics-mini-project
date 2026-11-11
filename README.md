# Retrieval Metrics Mini Project

Build a tiny evaluation tool that measures how good a search system is.

In this mini project you will implement `eval.js` so it scores two search systems, keyword search and semantic search, on the same set of test queries, computes **MRR** and **Recall@10** for each, and prints a **markdown comparison table**. No database or API keys are needed: the two systems' ranked results are already captured for you as data, so you can focus on the metrics themselves.

## What is in this project

- `eval.js` : the file you build. It has four TODOs; the file-loading is done for you.
- `test-set.csv` : 10 `(query, correct_post_ids)` pairs. A row may list more than one correct answer, semicolon-separated (for example `1024;1025`).
- `search-results.json` : for each query, the top-10 ranked `post_id` list each system returned, shaped as `{ "<query>": { "keyword": [...], "semantic": [...] } }`. Array position 0 is rank 1.
- `posts-dataset.csv` : the 35 posts the ids refer to (for sanity-checking; not required by the core build).

## What to build

1. **Load** `test-set.csv` and `search-results.json` (already wired up in the starter).
2. **Reciprocal Rank:** for one query, return `1 / rank` of the first correct id in a ranked list, or `0` if no correct id is in the top 10 (rank is 1-based).
3. **Evaluation loop:** for every query, compute the reciprocal rank for the keyword and semantic lists and count a hit whenever the correct answer is in the top 10. Then compute, for each system:
   - **MRR** = average reciprocal rank across all 10 queries.
   - **Recall@10** = (queries whose correct answer is in the top 10) / 10.
4. **Print a markdown comparison table:** one row per query with keyword and semantic ranks (`miss` when not found), then a **Summary** row with each system's MRR and Recall@10 rounded to two decimals.

## Formulas

```text
Reciprocal Rank (one query) = 1 / (rank of the first correct answer)
                            = 0   if the correct answer is not in the top 10
MRR       = average of the reciprocal ranks over all queries
Recall@10 = (queries whose correct answer is in the top 10) / (total queries)
```

## Run it

```bash
node eval.js
```

## Expected output

A correct `eval.js` prints exactly this table. If your numbers differ, your metric code has a bug.

```text
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
```

## Write up your findings

### Results Table

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

### Interpretation

Overall, semantic search is significantly better across both metrics, achieving an MRR of 0.67 (compared to keyword search's 0.30) and a perfect Recall@10 of 1.00 (finding the target document in all 10 queries, whereas keyword search managed only 0.60, missing 4 out of 10 queries). Keyword search won on only two specific queries ("redis or memcached for caching" and "sql or nosql for a new product"), both of which consist of exact technology names and technical terms that have exact lexical matches with post titles. On the other hand, semantic search won the remaining eight queries (e.g., "my redis cache keeps showing old data", "why did my query get slower after I added an index", and "why does my redis memory keep climbing"), all of which express symptoms, conceptual problems, and conversational questions where the user's vocabulary differs from the document wording. Despite being weaker overall, an engineering team would still keep keyword search in a hybrid retrieval architecture (such as Reciprocal Rank Fusion) because exact lexical matching provides unmatched precision for explicit product names, version strings, error codes, and exact technical acronyms where vector embeddings are prone to semantic drift or false positives.

## Take it further (optional)

If you have a working Postgres with the posts loaded and embeddings generated, swap `search-results.json` for real searches:

```sql
-- Keyword search (PG full-text)
SELECT post_id
FROM posts
WHERE to_tsvector('english', title || ' ' || body) @@ plainto_tsquery('english', $1)
ORDER BY ts_rank(to_tsvector('english', title || ' ' || body), plainto_tsquery('english', $1)) DESC
LIMIT 10;

-- Semantic search (pgvector)
SELECT post_id FROM posts ORDER BY embedding <=> $1 LIMIT 10;
```

Wire each into `async keywordSearch(query)` and `async semanticSearch(query)` returning ranked `post_id` lists, then run your exact same metric code. The metrics do not change, only where the ranked lists come from.
