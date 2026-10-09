# Retrieval Metrics Mini Project

## Overview

This project evaluates keyword search and semantic search using two information retrieval metrics: Mean Reciprocal Rank (MRR) and Recall@10.

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

Semantic search performs better overall, achieving an MRR of 0.67 and Recall@10 of 1.00, compared with keyword search's MRR of 0.30 and Recall@10 of 0.60. Keyword search performs better on "redis or memcached for caching" and "sql or nosql for a new product," ranking the correct answers first for both queries. These queries contain specific technical terms that keyword matching can identify effectively. Semantic search performs better on queries such as "how do I add semantic search to a table I already have" and "why did my query get slower after I added an index," where understanding the meaning of the question is useful. Semantic search also finds a correct answer for all ten queries. A team could still keep keyword search because it can rank exact-term matches highly and complement semantic search on queries where specific keywords are important.

## How to Run

Run the following command in the project directory:

```bash
node eval.js
```

