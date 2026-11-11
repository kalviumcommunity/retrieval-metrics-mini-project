# Evaluation Results & Findings

## Results Table

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

Overall, semantic search is significantly better across both metrics, achieving an MRR of 0.67 (compared to keyword search's 0.30) and a perfect Recall@10 of 1.00 (finding the target document in all 10 queries, whereas keyword search managed only 0.60, missing 4 out of 10 queries). Keyword search won on only two specific queries ("redis or memcached for caching" and "sql or nosql for a new product"), both of which consist of exact technology names and technical terms that have exact lexical matches with post titles. On the other hand, semantic search won the remaining eight queries (e.g., "my redis cache keeps showing old data", "why did my query get slower after I added an index", and "why does my redis memory keep climbing"), all of which express symptoms, conceptual problems, and conversational questions where the user's vocabulary differs from the document wording. Despite being weaker overall, an engineering team would still keep keyword search in a hybrid retrieval architecture (such as Reciprocal Rank Fusion) because exact lexical matching provides unmatched precision for explicit product names, version strings, error codes, and exact technical acronyms where vector embeddings are prone to semantic drift or false positives.
