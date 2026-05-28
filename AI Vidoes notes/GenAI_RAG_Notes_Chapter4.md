# GenAI & RAG — Full Course Notes
## Chapter 4: Embeddings and Vector Databases

---

> This chapter is the bridge to RAG. If Chapter 3 was about talking to LLMs, this chapter is about making computers understand the *meaning* of text — so you can search by meaning, not just by keywords. Read this carefully. Once this clicks, RAG will feel completely obvious.

---

## 4.1 — The Problem With Normal Search

Imagine you have a database of 10,000 customer support tickets. A new customer asks:

**"My app keeps crashing when I open it"**

You want to find similar past tickets to help resolve it. You do a normal database search — something like:

```sql
SELECT * FROM tickets WHERE description LIKE '%crashing%'
```

This will only find tickets that contain the word "crashing". But what about tickets that say:

- "Application closes unexpectedly on launch"
- "App won't open, it shuts down immediately"
- "Getting a force close error every time I start the app"

All of these mean the exact same thing as "app keeps crashing" — but none of them contain the word "crashing". Your keyword search misses all of them.

**This is the fundamental problem with keyword-based search:**
It matches words, not meaning.

**The solution → Search by meaning using embeddings.**

---

## 4.2 — What is an Embedding?

An embedding is a way of converting text into a list of numbers such that texts with similar meanings produce numbers that are mathematically close to each other.

Let us make this very concrete.

Imagine a very simple world where every word can be described by just two numbers:
- First number → how much the word relates to "royalty" (0 to 1)
- Second number → how much the word relates to "female gender" (0 to 1)

In this imaginary world:
- "king" → [0.9, 0.1] (high royalty, low female)
- "queen" → [0.9, 0.9] (high royalty, high female)
- "man" → [0.1, 0.1] (low royalty, low female)
- "woman" → [0.1, 0.9] (low royalty, high female)
- "bicycle" → [0.0, 0.0] (nothing to do with royalty or gender)

Now if you ask "what word is most similar to queen?", you can compare numbers:
- queen [0.9, 0.9] vs king [0.9, 0.1] → difference = 0.8
- queen [0.9, 0.9] vs woman [0.1, 0.9] → difference = 0.8
- queen [0.9, 0.9] vs bicycle [0.0, 0.0] → difference = 1.8

Bicycle is the most different. King and woman are equally close.

**Real embeddings work exactly like this — but instead of 2 numbers, they use 768, 1536, or even 3072 numbers.** Each number captures some aspect of meaning. No single number has a clear label like "royalty" — the model figures out what aspects to encode during training. But the principle is identical.

A sentence like "My app keeps crashing" and "Application closes unexpectedly" will produce vectors of numbers that are very close to each other — because they mean the same thing.

This is how you can search by meaning.

---

## 4.3 — How Embedding Models Work

An embedding model is a neural network that takes text as input and outputs a vector of numbers.

It is trained on massive amounts of text. During training, it learns to produce similar vectors for sentences that appear in similar contexts. Over time, the numbers it produces start to reflect meaning.

**You do not train embedding models yourself.** You use pre-trained ones. There are many:

| Model | Provider | Dimensions | Speed | Notes |
|---|---|---|---|---|
| text-embedding-3-small | OpenAI | 1536 | Fast | Good quality, cheap |
| text-embedding-3-large | OpenAI | 3072 | Slower | Higher quality |
| embed-english-v3.0 | Cohere | 1024 | Fast | Good for English |
| BAAI/bge-small-en | Open source | 384 | Very fast | Runs locally, free |
| BAAI/bge-base-en | Open source | 768 | Fast | Good balance |
| sentence-transformers/all-MiniLM-L6-v2 | Open source | 384 | Very fast | Lightweight, popular |

**What are "dimensions"?**
The number of dimensions is the length of the output vector. `text-embedding-3-small` produces a list of 1536 numbers for any input text.

More dimensions generally means more expressive — more aspects of meaning captured. But also uses more memory and is slower to compare.

---

## 4.4 — FastEmbed: Fast, Free, Local Embeddings

This is the library you specifically wanted to learn. Let us cover it properly.

**What is FastEmbed?**

FastEmbed is an open-source library made by Qdrant (a vector database company). It lets you run embedding models locally on your machine — no API key needed, no cost per call, and it is optimized to be fast even on CPU (no GPU required).

**Why use FastEmbed?**
- Free — no API cost, unlike OpenAI embeddings
- Fast — optimized for CPU, uses ONNX runtime under the hood
- Private — your data never leaves your machine
- Easy — very simple API, just a few lines

**Install FastEmbed:**

```bash
pip install fastembed
```

**Your first embedding with FastEmbed:**

```python
from fastembed import TextEmbedding

# Load the embedding model
# First time: downloads the model (~90MB). After that, it is cached locally.
embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")

# Embed a single sentence
documents = ["My app keeps crashing when I open it"]

# embed() returns a generator — convert to list
embeddings = list(embedding_model.embed(documents))

# embeddings[0] is a numpy array of 384 numbers
print(f"Vector length: {len(embeddings[0])}")
# Output: Vector length: 384

print(f"First 5 numbers: {embeddings[0][:5]}")
# Output: First 5 numbers: [-0.023  0.045  0.012  -0.087  0.034]
```

Those 384 numbers represent the meaning of that sentence.

**Embedding multiple texts at once (batch embedding):**

```python
from fastembed import TextEmbedding

embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")

texts = [
    "My app keeps crashing when I open it",
    "Application closes unexpectedly on launch",
    "App won't open, it shuts down immediately",
    "Getting a force close error every time I start the app",
    "How do I reset my password?",
    "I forgot my login credentials"
]

embeddings = list(embedding_model.embed(texts))

print(f"Number of embeddings: {len(embeddings)}")
# Output: Number of embeddings: 6

print(f"Each embedding has {len(embeddings[0])} dimensions")
# Output: Each embedding has 384 dimensions
```

FastEmbed processes in batches efficiently. You can pass thousands of texts at once.

**Which FastEmbed model to use?**

```python
# See all available models
from fastembed import TextEmbedding

print(TextEmbedding.list_supported_models())
```

**Recommended models for different needs:**

- `BAAI/bge-small-en-v1.5` — 384 dims, ~90MB, fastest, good quality. Best for learning and most projects.
- `BAAI/bge-base-en-v1.5` — 768 dims, ~420MB, better quality, slightly slower.
- `BAAI/bge-large-en-v1.5` — 1024 dims, ~1.2GB, best quality, slowest.

For this course, use `BAAI/bge-small-en-v1.5` unless you specifically need higher quality.

---

## 4.5 — Measuring Similarity Between Vectors

Once you have vectors, you need a way to measure how similar two vectors are. There are three common methods:

### Cosine Similarity

This is the most commonly used method for text embeddings.

It measures the angle between two vectors. If two vectors point in the same direction (angle = 0), they are identical. If they point in completely opposite directions (angle = 180°), they are completely different.

- Cosine similarity = 1.0 → identical
- Cosine similarity = 0.0 → completely unrelated
- Cosine similarity = -1.0 → opposite meaning

**The important property:** Cosine similarity ignores the length of the vectors. It only cares about direction. This is good for text because a long paragraph and a short sentence about the same topic should be considered similar — even though one produces a "longer" vector activation.

```python
import numpy as np
from fastembed import TextEmbedding

embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")

def cosine_similarity(vec1, vec2):
    # Dot product divided by the product of magnitudes
    dot_product = np.dot(vec1, vec2)
    magnitude = np.linalg.norm(vec1) * np.linalg.norm(vec2)
    return dot_product / magnitude

texts = [
    "My app keeps crashing when I open it",         # index 0 — query
    "Application closes unexpectedly on launch",    # index 1 — should be similar
    "App won't open, it shuts down immediately",    # index 2 — should be similar
    "How do I reset my password?",                  # index 3 — should be different
    "I forgot my login credentials"                 # index 4 — should be different
]

embeddings = list(embedding_model.embed(texts))

query_embedding = embeddings[0]

print("Similarity scores compared to query: 'My app keeps crashing when I open it'")
print()

for i in range(1, len(texts)):
    score = cosine_similarity(query_embedding, embeddings[i])
    print(f"Score: {score:.4f} | Text: {texts[i]}")
```

Output will look something like:
```
Score: 0.8921 | Text: Application closes unexpectedly on launch
Score: 0.8756 | Text: App won't open, it shuts down immediately
Score: 0.2341 | Text: How do I reset my password?
Score: 0.2198 | Text: I forgot my login credentials
```

The crashing-related tickets score very high (0.87–0.89). The password tickets score very low (0.22). The embedding model understood meaning — even though the words are completely different.

This is the core of semantic search.

### Dot Product

Similar to cosine similarity but also considers the magnitude (length) of vectors. Used when your vectors are normalized (length = 1), in which case dot product and cosine similarity give the same result. Most embedding models output normalized vectors, so dot product is often used as a faster alternative.

### Euclidean Distance

Measures the straight-line distance between two points in vector space. Unlike cosine similarity, lower is better (smaller distance = more similar). Less commonly used for text embeddings.

**Rule of thumb:** Use cosine similarity (or dot product with normalized vectors) for text embeddings. That is the industry standard.

---

## 4.6 — The Problem With Searching Vectors Manually

In the example above, you have 5 texts. Comparing the query against all 5 is instant.

But what if you have 1 million documents?

Comparing the query vector against 1 million stored vectors one by one (called **brute force search**) would take too long. Imagine doing this for every user query on a real application.

**The problem:** You need a way to find the most similar vectors out of millions — without checking every single one.

**The solution → Vector Databases with ANN indexes.**

---

## 4.7 — What is a Vector Database?

A vector database is a database built specifically to store vectors and search them efficiently.

The key technology inside is called **Approximate Nearest Neighbor (ANN) search.** Instead of finding the *exact* most similar vector (which requires checking all of them), it finds vectors that are *approximately* the most similar — but does it in milliseconds even with millions of vectors.

The most common ANN algorithm is **HNSW (Hierarchical Navigable Small World).**

**How HNSW works (intuition only):**

Imagine you are looking for a person in a large city. You do not knock on every door. Instead:
1. You start at a well-connected person in the city (a "hub")
2. You ask them "who do you know that is most similar to who I am looking for?"
3. You go to that person and ask the same question
4. You keep following the closest connections until you cannot find anyone closer

HNSW builds a similar graph structure over your vectors. Searching it is extremely fast — you jump to approximately the right neighborhood immediately, rather than checking every vector.

You do not need to implement this yourself. Every vector database uses it internally. You just insert your vectors and search — the database handles everything.

---

## 4.8 — Vector Database Options

There are several vector databases. Here are the main ones you will encounter:

| Database | Type | Best For |
|---|---|---|
| Pinecone | Cloud, managed | Easiest to start, no setup |
| Qdrant | Open source + cloud | Best with FastEmbed, great for local dev |
| Weaviate | Open source + cloud | Feature-rich, good for complex setups |
| Chroma | Open source, local | Best for local development and learning |
| MongoDB Atlas | Cloud | If you already use MongoDB |
| pgvector | PostgreSQL extension | If you already use PostgreSQL |

For this course you will use **Chroma** for local learning (no account needed, runs on your machine) and **Qdrant** for more serious work (works perfectly with FastEmbed, same company made both).

---

## 4.9 — Chroma: Local Vector Database for Learning

Chroma is the easiest vector database to start with. It runs entirely on your machine, no account needed, no cloud setup.

**Install:**
```bash
pip install chromadb
```

**Full example — storing and searching documents:**

```python
import chromadb
from fastembed import TextEmbedding

# Initialize FastEmbed
embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")

# Initialize Chroma — stores data in a folder called "chroma_db"
chroma_client = chromadb.PersistentClient(path="./chroma_db")

# Create a collection (like a table in a regular database)
# If it already exists, get it. If not, create it.
collection = chroma_client.get_or_create_collection(
    name="support_tickets",
    metadata={"hnsw:space": "cosine"}  # Use cosine similarity
)

# Your documents
documents = [
    "My app keeps crashing when I open it",
    "Application closes unexpectedly on launch",
    "App won't open, it shuts down immediately",
    "Getting a force close error every time I start the app",
    "How do I reset my password?",
    "I forgot my login credentials",
    "Cannot log into my account",
    "Billing charge was incorrect this month",
    "I was charged twice for my subscription",
    "How do I cancel my subscription?"
]

# Create embeddings using FastEmbed
embeddings = list(embedding_model.embed(documents))

# Convert numpy arrays to lists (Chroma requires lists)
embeddings_as_lists = [emb.tolist() for emb in embeddings]

# Store documents, embeddings, and IDs in Chroma
collection.add(
    documents=documents,
    embeddings=embeddings_as_lists,
    ids=[f"ticket_{i}" for i in range(len(documents))]
)

print(f"Stored {collection.count()} documents in Chroma.")
# Output: Stored 10 documents in Chroma.


# Now search by meaning
def semantic_search(query, top_k=3):
    # Embed the query
    query_embedding = list(embedding_model.embed([query]))[0].tolist()
    
    # Search Chroma
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )
    
    return results

# Test it
query = "The application crashes immediately after opening"
results = semantic_search(query, top_k=3)

print(f"\nQuery: '{query}'")
print("\nTop 3 similar documents:")
for i, (doc, distance) in enumerate(zip(
    results["documents"][0],
    results["distances"][0]
)):
    similarity = 1 - distance  # Convert distance to similarity score
    print(f"{i+1}. Score: {similarity:.4f} | {doc}")
```

Output:
```
Query: 'The application crashes immediately after opening'

Top 3 similar documents:
1. Score: 0.8934 | App won't open, it shuts down immediately
2. Score: 0.8821 | Application closes unexpectedly on launch
3. Score: 0.8756 | My app keeps crashing when I open it
```

The search found semantically similar documents even though the query uses completely different words. This is semantic search working.

---

## 4.10 — Adding Metadata to Your Vectors

In real applications, you do not just store the text. You also store **metadata** — extra information about each document. This lets you filter results.

```python
import chromadb
from fastembed import TextEmbedding

embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
chroma_client = chromadb.PersistentClient(path="./chroma_db_meta")
collection = chroma_client.get_or_create_collection(
    name="articles",
    metadata={"hnsw:space": "cosine"}
)

documents = [
    "Python is a popular programming language for data science",
    "JavaScript is widely used for web development",
    "Machine learning models require large amounts of data",
    "React is a JavaScript library for building user interfaces",
    "Neural networks are inspired by the human brain",
    "Node.js lets you run JavaScript on the server"
]

# Metadata for each document
metadatas = [
    {"category": "programming", "language": "python", "year": 2024},
    {"category": "programming", "language": "javascript", "year": 2024},
    {"category": "ai", "language": "general", "year": 2024},
    {"category": "programming", "language": "javascript", "year": 2023},
    {"category": "ai", "language": "general", "year": 2023},
    {"category": "programming", "language": "javascript", "year": 2024},
]

embeddings = [emb.tolist() for emb in embedding_model.embed(documents)]

collection.add(
    documents=documents,
    embeddings=embeddings,
    metadatas=metadatas,
    ids=[f"doc_{i}" for i in range(len(documents))]
)

# Search with metadata filter — only look in "ai" category
query = "how do machines learn from data"
query_embedding = list(embedding_model.embed([query]))[0].tolist()

results = collection.query(
    query_embeddings=[query_embedding],
    n_results=3,
    where={"category": "ai"}   # Filter by metadata
)

print(f"Query: '{query}' (filtered to AI category only)")
for doc in results["documents"][0]:
    print(f" → {doc}")
```

Output:
```
Query: 'how do machines learn from data' (filtered to AI category only)
 → Machine learning models require large amounts of data
 → Neural networks are inspired by the human brain
```

Only AI category documents were searched — even though "React is a JavaScript library" might have matched if no filter was applied. Metadata filtering is essential in real RAG systems where you might have multiple document collections.

---

## 4.11 — Qdrant: Production Vector Database + FastEmbed Integration

Qdrant is made by the same team as FastEmbed. They work perfectly together. For any serious project, Qdrant is a great choice.

**Run Qdrant locally with Docker:**
```bash
docker pull qdrant/qdrant
docker run -p 6333:6333 -v $(pwd)/qdrant_data:/qdrant/storage qdrant/qdrant
```

**Install the Python client:**
```bash
pip install qdrant-client fastembed
```

**Full example with Qdrant + FastEmbed (native integration):**

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

# Connect to local Qdrant
client = QdrantClient(host="localhost", port=6333)

# Qdrant has a built-in FastEmbed integration
# You do not even need to embed manually — Qdrant does it for you

# Create a collection
client.create_collection(
    collection_name="knowledge_base",
    vectors_config=VectorParams(
        size=384,           # BAAI/bge-small-en-v1.5 produces 384-dim vectors
        distance=Distance.COSINE
    )
)

# Add documents — Qdrant + FastEmbed handles embedding automatically
documents = [
    "Photosynthesis is the process by which plants convert sunlight into food",
    "The mitochondria is the powerhouse of the cell",
    "DNA carries the genetic information of living organisms",
    "The speed of light is approximately 299,792 kilometers per second",
    "Gravity is the force that attracts two objects with mass toward each other",
    "Water is composed of two hydrogen atoms and one oxygen atom"
]

# add() with FastEmbed — no manual embedding needed
client.add(
    collection_name="knowledge_base",
    documents=documents,
    ids=list(range(len(documents)))
)

print(f"Added {len(documents)} documents to Qdrant")

# Search — again, just provide the query text, FastEmbed handles it
results = client.query(
    collection_name="knowledge_base",
    query_text="How do plants make their own food?",
    limit=3
)

print("\nResults:")
for result in results:
    print(f"Score: {result.score:.4f} | {result.document}")
```

Output:
```
Added 6 documents to Qdrant

Results:
Score: 0.8912 | Photosynthesis is the process by which plants convert sunlight into food
Score: 0.4231 | The mitochondria is the powerhouse of the cell
Score: 0.3892 | DNA carries the genetic information of living organisms
```

Notice how clean this is. You call `client.add()` with raw text and `client.query()` with raw text. Qdrant uses FastEmbed internally to handle all the embedding. This is the power of the native integration.

---

## 4.12 — Hybrid Search: Combining Keyword and Semantic

**The problem with pure semantic search:**

Semantic search is great for meaning — but sometimes fails on exact matches.

For example, if someone searches for "GPT-4o" — the semantic search might find documents about "large language models" in general, which is kind of right but misses documents that specifically contain "GPT-4o". A keyword search would find the exact match.

**The solution → Hybrid Search.**

Hybrid search combines:
- **BM25 (keyword-based)** — exact word matching, good for specific terms, names, codes
- **Semantic (vector-based)** — meaning-based, good for natural language questions

The two scores are merged using a technique called **Reciprocal Rank Fusion (RRF)** to give a final ranking.

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, SparseVectorParams, SparseIndexParams

# Qdrant supports hybrid search natively
# For a simplified example using just the concept:

# Most real RAG frameworks handle hybrid search for you
# (LangChain, LlamaIndex both have hybrid search built in)

# The pattern is:
# 1. Get top-K results from BM25 keyword search
# 2. Get top-K results from semantic vector search
# 3. Merge using RRF: score = sum(1 / (rank + 60)) for each result across both lists
# 4. Return the merged ranked list

# You will implement this fully in the RAG chapter using LangChain
print("Hybrid search concept noted — full implementation in Chapter 5 with RAG.")
```

For now, understand the concept. In Chapter 5 you will implement it as part of a full RAG pipeline using LangChain, which handles hybrid search for you.

---

## 4.13 — Putting It All Together: Semantic Search API

Here is a complete semantic search system using FastEmbed + Chroma:

```python
import chromadb
from fastembed import TextEmbedding

class SemanticSearchEngine:
    def __init__(self, collection_name: str, db_path: str = "./search_db"):
        self.embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
        self.chroma_client = chromadb.PersistentClient(path=db_path)
        self.collection = self.chroma_client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"}
        )
    
    def add_documents(self, documents: list[str], metadatas: list[dict] = None):
        """Add documents to the search index."""
        embeddings = [emb.tolist() for emb in self.embedding_model.embed(documents)]
        ids = [f"doc_{self.collection.count() + i}" for i in range(len(documents))]
        
        self.collection.add(
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas or [{} for _ in documents],
            ids=ids
        )
        print(f"Added {len(documents)} documents. Total: {self.collection.count()}")
    
    def search(self, query: str, top_k: int = 5, filters: dict = None) -> list[dict]:
        """Search for semantically similar documents."""
        query_embedding = list(self.embedding_model.embed([query]))[0].tolist()
        
        search_params = {
            "query_embeddings": [query_embedding],
            "n_results": top_k
        }
        if filters:
            search_params["where"] = filters
        
        results = self.collection.query(**search_params)
        
        output = []
        for doc, distance, metadata in zip(
            results["documents"][0],
            results["distances"][0],
            results["metadatas"][0]
        ):
            output.append({
                "text": doc,
                "score": round(1 - distance, 4),
                "metadata": metadata
            })
        
        return output
    
    def document_count(self) -> int:
        return self.collection.count()


# Use the search engine
engine = SemanticSearchEngine("company_docs")

# Add some documents with metadata
engine.add_documents(
    documents=[
        "The return policy allows returns within 30 days of purchase",
        "Refunds are processed within 5-7 business days",
        "To initiate a return, contact our support team with your order ID",
        "Shipping is free for orders above Rs 500",
        "Express delivery takes 1-2 business days and costs Rs 99",
        "Standard delivery takes 5-7 business days and is free above Rs 500",
        "Our customer support is available Monday to Saturday, 9am to 6pm",
        "You can reach support via email at support@company.com or call 1800-XXX-XXXX"
    ],
    metadatas=[
        {"topic": "returns"}, {"topic": "returns"}, {"topic": "returns"},
        {"topic": "shipping"}, {"topic": "shipping"}, {"topic": "shipping"},
        {"topic": "support"}, {"topic": "support"}
    ]
)

# Search
print("\n--- Search: 'How do I send back a product?' ---")
results = engine.search("How do I send back a product?", top_k=3)
for r in results:
    print(f"[{r['score']}] [{r['metadata']['topic']}] {r['text']}")

print("\n--- Search: 'delivery time' (shipping only) ---")
results = engine.search("delivery time", top_k=3, filters={"topic": "shipping"})
for r in results:
    print(f"[{r['score']}] {r['text']}")
```

This is a production-ready semantic search class. Store it — you will extend it into a full RAG system in Chapter 5.

---

## 4.14 — Your Project for This Chapter

Build a **Personal Knowledge Search Engine.**

1. Take 20–30 text snippets from any topic you are interested in (news articles, Wikipedia paragraphs, notes you have written)
2. Store them in Chroma using FastEmbed
3. Add meaningful metadata (category, date, source)
4. Build a search function that takes a query and returns the top 5 results with scores
5. Try these types of queries and observe the results:
   - A query with the same words as a document (should score very high)
   - A query with completely different words but same meaning (should still score high)
   - A completely unrelated query (should score very low)
   - A query with metadata filter

The goal is to *feel* how semantic search behaves differently from keyword search.

---

## Chapter 4 Summary

- Normal keyword search matches words. Semantic search matches meaning.
- Embeddings convert text into a list of numbers (vector) that preserves meaning.
- Similar meanings → mathematically similar vectors.
- FastEmbed lets you generate embeddings locally, free, no API key needed.
- Cosine similarity measures how similar two vectors are (1.0 = identical, 0.0 = unrelated).
- Vector databases store vectors and search them extremely fast using HNSW index.
- Chroma is the easiest local vector database for learning.
- Qdrant integrates natively with FastEmbed — clean, powerful, production-ready.
- Metadata filtering lets you search within specific subsets of your data.
- Hybrid search combines keyword + semantic for best results.

---

## What Is Coming Next

**Chapter 5 — RAG: Retrieval-Augmented Generation**

Everything you have learned so far — LLMs (Chapters 1–3) and embeddings + vector search (Chapter 4) — now comes together. RAG is the technique of giving an LLM access to your own documents at query time so it can answer questions based on your data, not just its training. This is the chapter the entire course has been building toward.

---

*End of Chapter 4*
