# Measuring Retrieval: MRR and Recall@10

## Objective

The objective of this project is to compare keyword search and semantic search using Mean Reciprocal Rank (MRR) and Recall@10. The evaluation uses a gold-standard test set containing 10 queries and their correct post IDs.

## Results

| Query                                                      |                  Keyword rank |                 Semantic rank |
| ---------------------------------------------------------- | ----------------------------: | ----------------------------: |
| my redis cache keeps showing old data                      |                             8 |                             1 |
| how do I add semantic search to a table I already have     |                          miss |                             2 |
| redis or memcached for caching                             |                             1 |                             2 |
| why did my query get slower after I added an index         |                          miss |                             1 |
| what does ACID actually guarantee                          |                             2 |                             1 |
| how do I keep my postgres online while changing the schema |                             6 |                             3 |
| my background jobs stop after every deploy                 |                          miss |                             2 |
| how do I let my database accept more writes per second     |                             4 |                             1 |
| sql or nosql for a new product                             |                             1 |                             3 |
| why does my redis memory keep climbing                     |                          miss |                             2 |
| **Summary**                                                | **MRR 0.30 · Recall@10 0.60** | **MRR 0.67 · Recall@10 1.00** |

## Interpretation

Semantic search performs better overall because it achieves an MRR of 0.67 and Recall@10 of 1.00, compared with keyword search's MRR of 0.30 and Recall@10 of 0.60. Keyword search performs well on queries such as "redis or memcached for caching" and "sql or nosql for a new product," where matching specific technical terms is useful. Semantic search performs better on queries such as "my redis cache keeps showing old data" and "why does my redis memory keep climbing," where understanding the meaning of a problem matters more than matching exact words. Semantic search finds a correct answer for all ten queries, while keyword search misses four answers within the top ten. These results show that semantic search both finds more correct answers and generally ranks them closer to the top. A team might still keep keyword search because it can perform better for exact technical terms, and combining both approaches could improve retrieval across different types of queries.
