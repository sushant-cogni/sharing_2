# GenAI & RAG — Full Course Notes
## Chapter 6: Advanced RAG & Optimization

---

> You have a working RAG system from Chapter 5. It loads documents, chunks them, embeds with FastEmbed, stores in Chroma, retrieves, and generates answers. This chapter makes that system significantly better — smarter retrieval, faster responses, lower cost, and handles complex queries that basic RAG fails on.

---

## 6.1 — Where Basic RAG Fails

Before learning advanced techniques, you need to understand exactly where the basic RAG system breaks. These are real failure patterns you will hit in production.

---

**Failure 1: The answer needs context from multiple places**

A user asks: "Compare the refund policy for electronics versus clothing."

Basic RAG retrieves the top 5 chunks. Maybe it finds 2 chunks about electronics refunds and misses the clothing refund section entirely — because the query embedding pulls toward one topic.

---

**Failure 2: The chunk has the answer but not enough context**

A chunk contains: "In this case, the standard 30-day policy does not apply."

But "this case" refers to something explained in the previous paragraph — which is in a different chunk. The LLM sees "this case" with no context and gives a wrong or confused answer.

---

**Failure 3: The query is complex and multi-part**

User asks: "What are the differences between the Pro and Enterprise plans, and which one is better for a team of 15 people?"

This is actually two questions. Basic RAG treats it as one and retrieves chunks that partially address both — giving an incomplete answer.

---

**Failure 4: The query uses different words than the document**

Document says: "Subscription can be terminated at any point."
User asks: "Can I cancel my plan?"

Basic RAG may miss this because "cancel" and "plan" are not in the document. The semantic similarity is decent but not great — a hybrid search would catch this perfectly.

---

Each of these has a specific solution. Let us go through them.

---

## 6.2 — Advanced Indexing: Sentence Window Retrieval

**The problem it solves:** Failure 2 above — chunk has the answer but lacks surrounding context.

**The idea:**

When you store documents, you store small sentence-level chunks for precise retrieval. But when you actually send context to the LLM, you send a larger window of sentences around the matched chunk.

So retrieval is precise (small chunks), but context sent to the LLM is rich (wider window).

```
Document sentences: [S1] [S2] [S3] [S4] [S5] [S6] [S7] [S8] [S9] [S10]

You embed each sentence individually for retrieval.
Query matches S5.
But you send S3 + S4 + S5 + S6 + S7 to the LLM (window of 2 around S5).
```

```python
import chromadb
from fastembed import TextEmbedding

embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
chroma_client = chromadb.PersistentClient(path="./advanced_rag_db")

# Two collections: one for sentence-level retrieval, one for full context
sentence_collection = chroma_client.get_or_create_collection(
    name="sentences",
    metadata={"hnsw:space": "cosine"}
)

def ingest_with_sentence_window(text: str, source: str, window_size: int = 2):
    """
    Store individual sentences for retrieval.
    Each sentence knows its position so we can fetch surrounding context.
    """
    # Split into sentences (simple split — use nltk for production)
    sentences = [s.strip() for s in text.split('.') if s.strip()]
    
    if not sentences:
        return
    
    embeddings = [emb.tolist() for emb in embedding_model.embed(sentences)]
    
    ids, docs, metas = [], [], []
    
    for idx, (sentence, embedding) in enumerate(zip(sentences, embeddings)):
        doc_id = f"{source}_sent_{idx}"
        ids.append(doc_id)
        docs.append(sentence)
        metas.append({
            "source": source,
            "sentence_index": idx,
            "total_sentences": len(sentences),
            # Store the full text so we can build windows later
            "full_text_key": source
        })
    
    sentence_collection.add(
        documents=docs,
        embeddings=embeddings,
        metadatas=metas,
        ids=ids
    )
    
    # Also store the full text separately for window retrieval
    import json
    with open(f"./full_texts/{source}.json", "w") as f:
        json.dump(sentences, f)
    
    print(f"Stored {len(sentences)} sentences from '{source}'")


def retrieve_with_window(query: str, top_k: int = 3, window: int = 2) -> list[dict]:
    """
    Retrieve sentences, then expand each result to include surrounding sentences.
    """
    import json, os
    
    query_emb = list(embedding_model.embed([query]))[0].tolist()
    
    results = sentence_collection.query(
        query_embeddings=[query_emb],
        n_results=top_k
    )
    
    expanded_results = []
    
    for doc, distance, meta in zip(
        results["documents"][0],
        results["distances"][0],
        results["metadatas"][0]
    ):
        source = meta["source"]
        sent_idx = meta["sentence_index"]
        total = meta["total_sentences"]
        score = round(1 - distance, 4)
        
        # Load full text and build window
        try:
            with open(f"./full_texts/{source}.json") as f:
                all_sentences = json.load(f)
            
            # Get window around the matched sentence
            start = max(0, sent_idx - window)
            end = min(total, sent_idx + window + 1)
            window_text = ". ".join(all_sentences[start:end])
            
        except FileNotFoundError:
            window_text = doc  # Fallback to just the matched sentence
        
        expanded_results.append({
            "matched_sentence": doc,
            "context_window": window_text,
            "score": score,
            "source": source
        })
    
    return expanded_results


# When building the RAG prompt, use context_window instead of matched_sentence
# This gives the LLM the surrounding context
import os
os.makedirs("./full_texts", exist_ok=True)

sample_text = """
Our company offers three subscription plans. The Starter plan costs nine dollars per month.
It supports up to five users and includes basic features. The Pro plan costs twenty nine dollars.
It supports up to twenty five users and includes advanced analytics. The Enterprise plan has custom pricing.
It supports unlimited users and includes all features plus dedicated support. 
For teams between ten and twenty people, the Pro plan is usually the best choice.
Teams above twenty five people should consider Enterprise for better value.
"""

ingest_with_sentence_window(sample_text.strip(), source="pricing_guide", window_size=2)

results = retrieve_with_window("which plan for a team of 15?", top_k=2, window=2)
for r in results:
    print(f"\nScore: {r['score']}")
    print(f"Matched: {r['matched_sentence']}")
    print(f"With context: {r['context_window']}")
```

The matched sentence alone might be "For teams between ten and twenty people, the Pro plan is usually the best choice." But with the window, the LLM also sees the Pro plan's details — giving a complete answer.

---

## 6.3 — Query Decomposition

**The problem it solves:** Failure 3 — complex multi-part queries.

**The idea:** Before retrieving anything, use an LLM to break the complex query into simpler sub-questions. Run RAG for each sub-question separately. Combine the results.

```python
from openai import OpenAI
from dotenv import load_dotenv
import json

load_dotenv()
client = OpenAI()

def decompose_query(query: str) -> list[str]:
    """
    Break a complex query into simpler sub-questions.
    Returns a list of simpler questions.
    """
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": """You break complex questions into simple sub-questions for document search.
Return a JSON array of strings. Each string is one simple sub-question.
If the query is already simple, return an array with just that one question.
Return ONLY the JSON array, nothing else."""
            },
            {
                "role": "user",
                "content": f"Break this into sub-questions: {query}"
            }
        ],
        temperature=0,
        max_tokens=200
    )
    
    try:
        sub_questions = json.loads(response.choices[0].message.content)
        return sub_questions if isinstance(sub_questions, list) else [query]
    except json.JSONDecodeError:
        return [query]  # Fallback to original query


def rag_with_decomposition(query: str, retriever_fn, top_k: int = 3) -> dict:
    """
    Decompose query → retrieve for each sub-question → combine → generate.
    """
    # Step 1: Decompose
    sub_questions = decompose_query(query)
    print(f"Original query: {query}")
    print(f"Decomposed into {len(sub_questions)} sub-questions:")
    for i, q in enumerate(sub_questions, 1):
        print(f"  {i}. {q}")
    
    # Step 2: Retrieve for each sub-question
    all_chunks = []
    seen_texts = set()
    
    for sub_q in sub_questions:
        chunks = retriever_fn(sub_q, top_k=top_k)
        for chunk in chunks:
            # Deduplicate — same chunk might appear for multiple sub-questions
            if chunk["text"] not in seen_texts:
                all_chunks.append(chunk)
                seen_texts.add(chunk["text"])
    
    print(f"\nTotal unique chunks retrieved: {len(all_chunks)}")
    
    # Step 3: Build context
    context = "\n\n".join([
        f"[{c['source']}]\n{c['text']}"
        for c in all_chunks
    ])
    
    # Step 4: Generate with all sub-questions in mind
    prompt = f"""Answer the following question using the context provided.
The question has multiple parts — make sure to address all of them.

CONTEXT:
{context}

QUESTION: {query}

ANSWER:"""
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
        max_tokens=600
    )
    
    return {
        "answer": response.choices[0].message.content,
        "sub_questions": sub_questions,
        "chunks_used": len(all_chunks)
    }


# Test
# result = rag_with_decomposition(
#     "What are the differences between Pro and Enterprise plans, and which is better for a team of 15?",
#     retriever_fn=your_retrieve_function
# )
# print(result["answer"])
```

---

## 6.4 — Hybrid Search: Full Implementation

**The problem it solves:** Failure 4 — different words, same meaning.

**The idea:** Run both BM25 (keyword) search and semantic (vector) search. Merge the results using Reciprocal Rank Fusion (RRF).

First, understand RRF:

```
If a document ranks #1 in BM25 and #3 in semantic search:
  RRF score = 1/(1+60) + 1/(3+60) = 0.0161 + 0.0157 = 0.0318

If another document ranks #5 in BM25 and #1 in semantic:
  RRF score = 1/(5+60) + 1/(1+60) = 0.0154 + 0.0161 = 0.0315

Documents that rank well in BOTH searches score highest.
The constant 60 is standard — it reduces the impact of very high ranks.
```

```python
from rank_bm25 import BM25Okapi
import chromadb
from fastembed import TextEmbedding
import numpy as np

# Install: pip install rank-bm25

embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
chroma_client = chromadb.PersistentClient(path="./hybrid_db")
collection = chroma_client.get_or_create_collection(
    name="hybrid_docs",
    metadata={"hnsw:space": "cosine"}
)

class HybridSearchEngine:
    def __init__(self):
        self.documents = []       # Store all documents in memory for BM25
        self.doc_ids = []
        self.bm25 = None
        self.embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
        self.chroma = chroma_client.get_or_create_collection(
            name="hybrid_search",
            metadata={"hnsw:space": "cosine"}
        )
    
    def add_documents(self, documents: list[str], metadatas: list[dict] = None):
        """Add documents to both BM25 index and vector store."""
        
        # Store for BM25
        start_idx = len(self.documents)
        self.documents.extend(documents)
        self.doc_ids.extend([f"doc_{start_idx + i}" for i in range(len(documents))])
        
        # Rebuild BM25 index (tokenize by whitespace for simplicity)
        tokenized = [doc.lower().split() for doc in self.documents]
        self.bm25 = BM25Okapi(tokenized)
        
        # Store in vector DB
        embeddings = [emb.tolist() for emb in self.embedding_model.embed(documents)]
        ids = self.doc_ids[start_idx:]
        
        self.chroma.add(
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas or [{} for _ in documents],
            ids=ids
        )
        
        print(f"Added {len(documents)} docs. Total: {len(self.documents)}")
    
    def _bm25_search(self, query: str, top_k: int) -> list[tuple[str, float]]:
        """BM25 keyword search. Returns (doc_id, score) pairs."""
        if not self.bm25:
            return []
        
        tokenized_query = query.lower().split()
        scores = self.bm25.get_scores(tokenized_query)
        
        # Get top-k indices
        top_indices = np.argsort(scores)[::-1][:top_k]
        
        return [(self.doc_ids[i], float(scores[i])) for i in top_indices]
    
    def _vector_search(self, query: str, top_k: int) -> list[tuple[str, float]]:
        """Semantic vector search. Returns (doc_id, score) pairs."""
        query_emb = list(self.embedding_model.embed([query]))[0].tolist()
        
        results = self.chroma.query(
            query_embeddings=[query_emb],
            n_results=min(top_k, len(self.documents))
        )
        
        pairs = []
        for doc_id, distance in zip(results["ids"][0], results["distances"][0]):
            pairs.append((doc_id, 1 - distance))  # Convert distance to similarity
        
        return pairs
    
    def _reciprocal_rank_fusion(
        self,
        bm25_results: list[tuple[str, float]],
        vector_results: list[tuple[str, float]],
        k: int = 60
    ) -> list[tuple[str, float]]:
        """Merge two ranked lists using RRF."""
        
        scores = {}
        
        # Score from BM25 ranking
        for rank, (doc_id, _) in enumerate(bm25_results):
            scores[doc_id] = scores.get(doc_id, 0) + 1 / (rank + k)
        
        # Score from vector search ranking
        for rank, (doc_id, _) in enumerate(vector_results):
            scores[doc_id] = scores.get(doc_id, 0) + 1 / (rank + k)
        
        # Sort by combined RRF score
        sorted_results = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        return sorted_results
    
    def search(self, query: str, top_k: int = 5) -> list[dict]:
        """Hybrid search: BM25 + semantic + RRF fusion."""
        
        search_k = min(top_k * 2, len(self.documents))  # Get more, then rerank
        
        bm25_results = self._bm25_search(query, top_k=search_k)
        vector_results = self._vector_search(query, top_k=search_k)
        
        fused = self._reciprocal_rank_fusion(bm25_results, vector_results)
        
        # Get top_k results with document text
        final_results = []
        for doc_id, rrf_score in fused[:top_k]:
            if doc_id in self.doc_ids:
                idx = self.doc_ids.index(doc_id)
                final_results.append({
                    "text": self.documents[idx],
                    "rrf_score": round(rrf_score, 4),
                    "doc_id": doc_id
                })
        
        return final_results


# Test hybrid search
engine = HybridSearchEngine()

engine.add_documents([
    "Subscription can be terminated at any point by the user.",
    "Refunds are processed within 5 to 7 business days.",
    "The Pro plan includes advanced analytics and priority support.",
    "Enterprise customers get a dedicated account manager.",
    "Payment methods accepted include credit card and UPI.",
    "Free trial lasts 14 days with no credit card required."
])

print("\n--- Hybrid search: 'cancel my plan' ---")
results = engine.search("cancel my plan", top_k=3)
for r in results:
    print(f"[RRF: {r['rrf_score']}] {r['text']}")

# Notice: "Subscription can be terminated" scores high
# even though the words "cancel" and "plan" are not in the document
```

---

## 6.5 — Re-ranking with a Cross-Encoder

**The problem:** Both BM25 and vector search are fast but imprecise. They retrieve candidates. But ranking them accurately requires a deeper model.

**The idea:** After retrieval, pass the query + each retrieved chunk through a **cross-encoder** model that scores relevance directly. This is slower but much more accurate.

```
Bi-encoder (what we use for embedding): 
  embed(query) → vector
  embed(document) → vector  
  similarity = cosine(query_vec, doc_vec)
  ↳ Fast, scalable, but approximate

Cross-encoder (for reranking):
  score = model(query + document together)  ← sees both at same time
  ↳ Slow for large scale, but very accurate
  ↳ Only use on top 10-20 retrieved results
```

```python
from sentence_transformers import CrossEncoder

# Install: pip install sentence-transformers
# Downloads ~100MB model on first run

cross_encoder = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")

def rerank_results(query: str, retrieved_chunks: list[dict], top_k: int = 3) -> list[dict]:
    """
    Rerank retrieved chunks using a cross-encoder for more accurate relevance scoring.
    """
    if not retrieved_chunks:
        return []
    
    # Create query-document pairs
    pairs = [[query, chunk["text"]] for chunk in retrieved_chunks]
    
    # Score each pair
    scores = cross_encoder.predict(pairs)
    
    # Add scores to chunks and sort
    for chunk, score in zip(retrieved_chunks, scores):
        chunk["rerank_score"] = round(float(score), 4)
    
    reranked = sorted(retrieved_chunks, key=lambda x: x["rerank_score"], reverse=True)
    
    return reranked[:top_k]


# Usage in your RAG pipeline:
# 1. Retrieve top 15 chunks with vector search (cast wide net)
# 2. Rerank to get top 3 most relevant
# 3. Send those 3 to the LLM

# chunks = retrieve_chunks(query, top_k=15)     # Fast, wide retrieval
# reranked = rerank_results(query, chunks, top_k=3)  # Accurate reranking
# answer = generate_answer(query, reranked)     # Generate with best 3
```

**When to use reranking:**
- When answer quality matters more than speed
- When you have a lot of similar-looking documents and need precise selection
- When users are asking nuanced or technical questions

**When to skip it:**
- When your document set is small and retrieval is already precise
- When response latency is critical (reranking adds 200–500ms)

---

## 6.6 — Semantic Caching

**The problem:** Users ask similar questions repeatedly. Every time you run the full RAG pipeline — retrieve, generate — you pay for API calls and spend time.

"What is the refund policy?" and "How do I get a refund?" are different words but close in meaning. The answer is probably the same.

**The idea:** Cache answers by semantic similarity, not exact text match. If the new query is very similar to a previously asked query, return the cached answer.

```python
import numpy as np
from fastembed import TextEmbedding
from datetime import datetime

embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")

class SemanticCache:
    def __init__(self, similarity_threshold: float = 0.92):
        """
        similarity_threshold: how similar queries need to be to be considered a cache hit.
        0.92 means 92% cosine similarity — very similar but not identical.
        """
        self.threshold = similarity_threshold
        self.cache = []  # List of {query, query_embedding, answer, timestamp}
    
    def _cosine_similarity(self, v1, v2) -> float:
        return float(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)))
    
    def get(self, query: str):
        """
        Check if a similar query exists in cache.
        Returns cached answer if found, None otherwise.
        """
        if not self.cache:
            return None
        
        query_emb = list(embedding_model.embed([query]))[0]
        
        best_score = 0
        best_answer = None
        
        for entry in self.cache:
            score = self._cosine_similarity(query_emb, entry["query_embedding"])
            if score > best_score:
                best_score = score
                best_answer = entry["answer"]
        
        if best_score >= self.threshold:
            print(f"Cache hit (similarity: {best_score:.3f})")
            return best_answer
        
        return None
    
    def set(self, query: str, answer: str):
        """Store a query-answer pair in cache."""
        query_emb = list(embedding_model.embed([query]))[0]
        
        self.cache.append({
            "query": query,
            "query_embedding": query_emb,
            "answer": answer,
            "timestamp": datetime.now()
        })
    
    def size(self) -> int:
        return len(self.cache)


# Usage
cache = SemanticCache(similarity_threshold=0.92)

def rag_with_cache(query: str, rag_pipeline_fn) -> str:
    # Check cache first
    cached = cache.get(query)
    if cached:
        return cached
    
    # Cache miss — run full pipeline
    print("Cache miss — running full RAG pipeline")
    answer = rag_pipeline_fn(query)
    
    # Store in cache
    cache.set(query, answer)
    
    return answer


# Test
def fake_rag(query):
    return f"[RAG answer for: {query}]"

ans1 = rag_with_cache("What is the refund policy?", fake_rag)
print(f"Answer 1: {ans1}\n")

# This similar query should hit the cache
ans2 = rag_with_cache("How do I get a refund?", fake_rag)
print(f"Answer 2: {ans2}\n")

# This unrelated query should miss
ans3 = rag_with_cache("What payment methods do you accept?", fake_rag)
print(f"Answer 3: {ans3}\n")

print(f"Cache size: {cache.size()}")
```

---

## 6.7 — Async Ingestion for Large Document Sets

**The problem:** If you have 500 PDFs to ingest, doing it synchronously blocks everything. The user cannot use the system while ingestion runs.

**The solution:** Run ingestion in the background as an async task.

```python
import asyncio
from concurrent.futures import ThreadPoolExecutor
from fastembed import TextEmbedding
import chromadb

embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
chroma_client = chromadb.PersistentClient(path="./async_rag_db")
collection = chroma_client.get_or_create_collection("async_docs")

executor = ThreadPoolExecutor(max_workers=4)

def _embed_and_store_batch(batch_data: dict):
    """CPU-bound work: embed and store a batch of chunks."""
    chunks = batch_data["chunks"]
    metas = batch_data["metas"]
    ids = batch_data["ids"]
    
    embeddings = [emb.tolist() for emb in embedding_model.embed(chunks)]
    collection.add(documents=chunks, embeddings=embeddings, metadatas=metas, ids=ids)
    
    return len(chunks)

async def ingest_documents_async(documents: list[dict]):
    """
    Ingest multiple documents asynchronously.
    Each document is a dict with 'text', 'source', and optional metadata.
    """
    
    all_tasks = []
    
    for doc in documents:
        # Chunk the document
        text = doc["text"]
        source = doc["source"]
        chunks = [text[i:i+500] for i in range(0, len(text), 450)]
        
        if not chunks:
            continue
        
        start_id = collection.count() + len(all_tasks)
        batch = {
            "chunks": chunks,
            "metas": [{"source": source} for _ in chunks],
            "ids": [f"chunk_{start_id + i}" for i in range(len(chunks))]
        }
        
        # Schedule as async task using thread pool (FastEmbed is not async-native)
        loop = asyncio.get_event_loop()
        task = loop.run_in_executor(executor, _embed_and_store_batch, batch)
        all_tasks.append(task)
    
    # Run all ingestion tasks concurrently
    results = await asyncio.gather(*all_tasks)
    total_chunks = sum(results)
    
    print(f"Async ingestion complete: {total_chunks} chunks from {len(documents)} documents")
    return total_chunks


# Run async ingestion
async def main():
    documents = [
        {"text": "Document one content here " * 50, "source": "doc1.pdf"},
        {"text": "Document two content here " * 50, "source": "doc2.pdf"},
        {"text": "Document three content here " * 50, "source": "doc3.pdf"},
    ]
    
    await ingest_documents_async(documents)
    print(f"Total in DB: {collection.count()}")

asyncio.run(main())
```

---

## 6.8 — Putting It Together: An Optimized RAG Pipeline

Here is a production-grade RAG pipeline that uses everything from this chapter:

```python
import chromadb
import numpy as np
from fastembed import TextEmbedding
from rank_bm25 import BM25Okapi
from openai import OpenAI
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

class OptimizedRAG:
    def __init__(self, db_path: str = "./optimized_rag"):
        self.embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
        self.openai = OpenAI()
        self.chroma = chromadb.PersistentClient(path=db_path)
        self.collection = self.chroma.get_or_create_collection(
            name="optimized_docs",
            metadata={"hnsw:space": "cosine"}
        )
        self.documents = []          # For BM25
        self.doc_ids = []
        self.bm25 = None
        self.cache = []              # Semantic cache
        self.cache_threshold = 0.92
    
    # ── INGESTION ──────────────────────────
    
    def add(self, text: str, source: str):
        chunks = self._chunk(text, 500, 50)
        embeddings = [e.tolist() for e in self.embedding_model.embed(chunks)]
        start = len(self.documents)
        ids = [f"doc_{start + i}" for i in range(len(chunks))]
        metas = [{"source": source} for _ in chunks]
        
        self.collection.add(documents=chunks, embeddings=embeddings, metadatas=metas, ids=ids)
        self.documents.extend(chunks)
        self.doc_ids.extend(ids)
        
        tokenized = [d.lower().split() for d in self.documents]
        self.bm25 = BM25Okapi(tokenized)
        
        print(f"Added '{source}': {len(chunks)} chunks. Total: {len(self.documents)}")
    
    # ── RETRIEVAL ──────────────────────────
    
    def _hybrid_retrieve(self, query: str, top_k: int = 10) -> list[dict]:
        if not self.documents:
            return []
        
        k = min(top_k, len(self.documents))
        
        # BM25
        bm25_scores = self.bm25.get_scores(query.lower().split())
        bm25_top = [(self.doc_ids[i], float(bm25_scores[i]))
                    for i in np.argsort(bm25_scores)[::-1][:k]]
        
        # Vector
        q_emb = list(self.embedding_model.embed([query]))[0].tolist()
        v_results = self.collection.query(query_embeddings=[q_emb], n_results=k)
        vector_top = [(doc_id, 1 - dist)
                      for doc_id, dist in zip(v_results["ids"][0], v_results["distances"][0])]
        
        # RRF fusion
        rrf = {}
        for rank, (doc_id, _) in enumerate(bm25_top):
            rrf[doc_id] = rrf.get(doc_id, 0) + 1 / (rank + 60)
        for rank, (doc_id, _) in enumerate(vector_top):
            rrf[doc_id] = rrf.get(doc_id, 0) + 1 / (rank + 60)
        
        sorted_ids = sorted(rrf, key=rrf.get, reverse=True)[:top_k]
        
        results = []
        for doc_id in sorted_ids:
            if doc_id in self.doc_ids:
                idx = self.doc_ids.index(doc_id)
                results.append({
                    "text": self.documents[idx],
                    "score": round(rrf[doc_id], 4),
                    "doc_id": doc_id
                })
        return results
    
    # ── CACHE ──────────────────────────────
    
    def _cache_get(self, query: str):
        if not self.cache:
            return None
        q_emb = list(self.embedding_model.embed([query]))[0]
        best = max(self.cache,
                   key=lambda e: float(np.dot(q_emb, e["emb"]) /
                                       (np.linalg.norm(q_emb) * np.linalg.norm(e["emb"]))))
        score = float(np.dot(q_emb, best["emb"]) /
                      (np.linalg.norm(q_emb) * np.linalg.norm(best["emb"])))
        return best["answer"] if score >= self.cache_threshold else None
    
    def _cache_set(self, query: str, answer: str):
        emb = list(self.embedding_model.embed([query]))[0]
        self.cache.append({"query": query, "emb": emb, "answer": answer})
    
    # ── QUERY ──────────────────────────────
    
    def ask(self, query: str) -> str:
        # 1. Cache check
        cached = self._cache_get(query)
        if cached:
            print("(from cache)")
            return cached
        
        # 2. Hybrid retrieve
        chunks = self._hybrid_retrieve(query, top_k=10)
        if not chunks:
            return "No relevant documents found."
        
        # 3. Use top 4 after retrieval
        top_chunks = chunks[:4]
        context = "\n\n".join([f"[{c['doc_id']}]\n{c['text']}" for c in top_chunks])
        
        # 4. Generate
        prompt = f"""Answer based only on the context below.
If the answer is not there, say so clearly.

CONTEXT:
{context}

QUESTION: {query}
ANSWER:"""
        
        response = self.openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            max_tokens=500
        )
        
        answer = response.choices[0].message.content
        self._cache_set(query, answer)
        return answer
    
    def _chunk(self, text, size, overlap):
        chunks, start = [], 0
        while start < len(text):
            chunk = text[start:start+size].strip()
            if chunk:
                chunks.append(chunk)
            start += size - overlap
        return chunks


# Use it
rag = OptimizedRAG()

rag.add("""
Our return policy allows returns within 30 days. Contact support with your order number.
Refunds process in 5-7 business days. Items must be unused and in original packaging.
Electronics have a 15-day return window. Damaged items are not eligible for return.
Subscription cancellation can happen at any time from account settings.
After cancellation your access continues until the billing period ends.
""", "policies")

print(rag.ask("Can I return a damaged phone?"))
print()
print(rag.ask("How do I stop my subscription?"))
print()
print(rag.ask("How do I stop my subscription?"))  # Should hit cache
```

---

## 6.9 — Project: Multi-Source RAG System

Build a system that ingests from multiple sources and routes queries to the right one.

**What to build:**

1. Ingest three different document sources:
   - A PDF (company handbook or any document)
   - A web page (fetch and parse with BeautifulSoup)
   - A plain text file (your own notes or any text)

2. Tag each source with metadata so you can filter by source type

3. Build a router that classifies the query and decides which source to search:
   - "What does our handbook say about..." → search handbook source
   - "What is on the website about..." → search web source
   - General questions → search all sources

4. Use hybrid search for retrieval

5. Show the source in the final answer with a confidence score

**Starter code for the router:**

```python
def route_query(query: str) -> str:
    """Classify query to determine which source to search."""
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": """Classify which source is most relevant for this query.
Return one word only: 'handbook', 'website', 'notes', or 'all'.
Return ONLY the word, nothing else."""
            },
            {"role": "user", "content": query}
        ],
        temperature=0,
        max_tokens=10
    )
    
    source = response.choices[0].message.content.strip().lower()
    return source if source in ["handbook", "website", "notes"] else "all"


def routed_rag_query(query: str, rag_system) -> dict:
    source = route_query(query)
    print(f"Routing to: {source}")
    
    if source == "all":
        chunks = rag_system._hybrid_retrieve(query)
    else:
        # Filter by source metadata
        query_emb = list(embedding_model.embed([query]))[0].tolist()
        results = collection.query(
            query_embeddings=[query_emb],
            n_results=5,
            where={"source_type": source}
        )
        chunks = [{"text": d} for d in results["documents"][0]]
    
    return {"source_used": source, "chunks": chunks}
```

---

## Chapter 6 Summary

| Technique | Problem it solves | When to use |
|---|---|---|
| Sentence window retrieval | Chunk lacks surrounding context | When answers need context beyond one sentence |
| Query decomposition | Multi-part complex queries | When users ask comparative or multi-step questions |
| Hybrid search (BM25 + vector + RRF) | Different words, same meaning | Almost always — adds robustness |
| Cross-encoder reranking | Imprecise ranking from fast retrieval | When answer quality matters more than speed |
| Semantic caching | Repeated similar queries cost money | Any production system with real users |
| Async ingestion | Slow blocking ingestion | When processing many documents |

---

## What Is Coming Next

**Chapter 7 — LangChain: Building LLM Applications**

Everything you have built so far has been from scratch — raw API calls, custom chunkers, custom retrievers. LangChain is a framework that provides ready-made versions of all of this, plus powerful abstractions for chains, memory, and agents. You will rebuild your RAG system using LangChain in a fraction of the code — and then use it as the foundation for agents in Chapter 8.

---

*End of Chapter 6*
