# GenAI & RAG — Full Course Notes
## Chapter 5: RAG — Retrieval-Augmented Generation

---

> This is the chapter everything has been building toward. You now know how LLMs work, how to prompt them, how to call their APIs, and how embeddings and vector search work. RAG is what happens when you combine all of it into one system. Read this fully — this is the core skill of the entire course.

---

## 5.1 — The Problem RAG Solves

Let us revisit why RAG exists by looking at four real problems with LLMs.

---

**Problem 1: LLMs do not know your private data**

An LLM was trained on public internet data. It knows about Wikipedia, news, books, code on GitHub — but it knows nothing about:
- Your company's internal documents
- Your product's documentation
- Your customer's past conversations
- Any PDF, report, or file sitting on your computer

If you ask "What is our refund policy?" — the LLM has no idea because it never saw your policy document.

---

**Problem 2: LLMs have a knowledge cutoff**

Training an LLM is expensive and slow. It happens once, not continuously. So the model's knowledge is frozen at a certain date. Ask it about something that happened recently and it either says "I don't know" or worse — it makes something up.

---

**Problem 3: LLMs hallucinate**

When the model does not have clear information about something, it still generates the most likely-sounding response. That response may be completely wrong. And it says it confidently.

---

**Problem 4: You cannot fit everything into the context window**

Even if you tried to paste all your company documents into the prompt — a large company might have millions of pages of documents. No context window is large enough.

---

**The solution to all four problems → RAG**

Instead of asking the LLM to remember everything, you:

1. Store all your documents in a vector database (Chapter 4 taught you this)
2. When a user asks a question, search the vector database for the most relevant parts
3. Take those relevant parts and include them in the prompt
4. Ask the LLM to answer the question based only on those parts

Now:
- The LLM has access to your private data ✅
- The knowledge can be updated at any time (just update the vector DB) ✅
- The LLM is anchored to real retrieved text, so hallucination decreases ✅
- You only send relevant parts — not all documents — so context window is manageable ✅

This is RAG. Retrieval-Augmented Generation. You retrieve relevant context, then generate an answer.

---

## 5.2 — The RAG Pipeline (Full Picture)

A RAG system has two separate pipelines that run at different times.

---

### Pipeline 1: Ingestion (runs once, or when documents are updated)

This is how your documents get into the system.

```
Raw Documents (PDFs, Word files, web pages, text files)
        ↓
    Load & Parse  (extract clean text)
        ↓
      Chunk  (split into smaller pieces)
        ↓
      Embed  (convert each chunk to a vector using FastEmbed)
        ↓
      Store  (save chunks + vectors + metadata in vector DB)
```

---

### Pipeline 2: Query (runs every time a user asks a question)

This is what happens when a user asks something.

```
User Question
        ↓
      Embed  (convert question to a vector)
        ↓
    Retrieve  (find the most similar chunks in vector DB)
        ↓
  Augment Prompt  (combine question + retrieved chunks)
        ↓
    Generate  (send augmented prompt to LLM)
        ↓
    Answer  (LLM answers based on retrieved context)
```

These two pipelines together form a complete RAG system. Let us now build each part.

---

## 5.3 — Step 1: Loading and Parsing Documents

Before you can embed anything, you need clean text. Documents come in many formats. You need libraries to extract text from them.

**Install required libraries:**

```bash
pip install pypdf python-docx beautifulsoup4 requests fastembed openai python-dotenv
```

---

### Loading PDFs

```python
from pypdf import PdfReader

def load_pdf(file_path: str) -> str:
    """Extract all text from a PDF file."""
    reader = PdfReader(file_path)
    
    full_text = ""
    for page_num, page in enumerate(reader.pages):
        text = page.extract_text()
        if text:  # Some pages may be empty or image-only
            full_text += f"\n--- Page {page_num + 1} ---\n"
            full_text += text
    
    return full_text

# Usage
text = load_pdf("company_policy.pdf")
print(f"Extracted {len(text)} characters from PDF")
```

---

### Loading Word Documents

```python
from docx import Document

def load_docx(file_path: str) -> str:
    """Extract all text from a Word document."""
    doc = Document(file_path)
    
    paragraphs = []
    for paragraph in doc.paragraphs:
        if paragraph.text.strip():  # Skip empty paragraphs
            paragraphs.append(paragraph.text)
    
    return "\n".join(paragraphs)

text = load_docx("report.docx")
```

---

### Loading a Web Page

```python
import requests
from bs4 import BeautifulSoup

def load_webpage(url: str) -> str:
    """Extract readable text from a web page."""
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    
    soup = BeautifulSoup(response.text, "html.parser")
    
    # Remove navigation, scripts, styles — keep only readable content
    for tag in soup(["script", "style", "nav", "footer", "header"]):
        tag.decompose()
    
    text = soup.get_text(separator="\n")
    
    # Clean up extra whitespace
    lines = [line.strip() for line in text.splitlines()]
    clean_text = "\n".join(line for line in lines if line)
    
    return clean_text

text = load_webpage("https://en.wikipedia.org/wiki/Artificial_intelligence")
print(f"Extracted {len(text)} characters from webpage")
```

---

### Loading Plain Text

```python
def load_text_file(file_path: str) -> str:
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()
```

---

## 5.4 — Step 2: Chunking

**Why do you need to chunk?**

The problem: you cannot embed an entire 100-page PDF as one vector. Here is why:

1. Embedding models have a token limit — you cannot pass too much text at once
2. Even if you could, one vector for 100 pages would be too generic. It would match everything and nothing specifically.
3. When you retrieve, you want to retrieve a small relevant piece — not the whole document

**The solution:** Split the document into smaller chunks before embedding. Each chunk gets its own vector. When you search, you retrieve the specific chunk that is relevant — not the whole document.

**How big should a chunk be?**

This is one of the most important decisions in RAG. There is no single right answer — it depends on your data. General guidelines:

- Too small (< 100 tokens) → loses context, sentences get cut awkwardly
- Too large (> 1000 tokens) → too much noise in one chunk, less precise retrieval
- Sweet spot for most use cases → **200 to 500 tokens** with some overlap

---

### Method 1: Fixed-Size Chunking with Overlap

Split text into chunks of N characters, with an overlap between consecutive chunks.

**Why overlap?** Information at the boundary of one chunk and the next should not be lost. Overlap ensures continuity.

```python
def chunk_text_fixed(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    """
    Split text into fixed-size chunks with overlap.
    chunk_size: number of characters per chunk
    overlap: how many characters to repeat between consecutive chunks
    """
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        
        if chunk.strip():  # Only add non-empty chunks
            chunks.append(chunk.strip())
        
        # Move forward by (chunk_size - overlap)
        start += chunk_size - overlap
    
    return chunks

# Example
sample_text = """
Artificial intelligence (AI) is intelligence demonstrated by machines. 
Unlike natural intelligence displayed by animals including humans, 
machine intelligence aims to build systems that can perform tasks 
that typically require human intelligence. These tasks include 
learning, reasoning, problem-solving, perception, and language understanding.

The field of AI research was founded at a workshop held on the campus 
of Dartmouth College in 1956. Since then, the field has gone through 
many cycles of optimism, followed by disappointment and the loss of funding, 
followed by new approaches and success. This is sometimes called an AI winter.
"""

chunks = chunk_text_fixed(sample_text, chunk_size=200, overlap=30)
print(f"Created {len(chunks)} chunks")
for i, chunk in enumerate(chunks):
    print(f"\nChunk {i+1} ({len(chunk)} chars):\n{chunk}")
```

---

### Method 2: Recursive Character Chunking (Better)

The problem with fixed-size chunking: it splits text blindly — it may cut a sentence in the middle.

Better approach: try to split at natural boundaries — paragraphs first, then sentences, then words, then characters. Only go to the smaller split if the larger one produces chunks that are too big.

```python
def chunk_text_recursive(
    text: str,
    chunk_size: int = 500,
    overlap: int = 50,
    separators: list[str] = None
) -> list[str]:
    """
    Split text recursively, trying natural boundaries first.
    separators: list of strings to try splitting on, in priority order
    """
    if separators is None:
        separators = ["\n\n", "\n", ". ", " ", ""]
    
    # Try each separator in order
    for separator in separators:
        if separator:
            splits = text.split(separator)
        else:
            splits = list(text)  # Character by character as last resort
        
        # If this separator gave us useful splits, proceed
        if len(splits) > 1:
            chunks = []
            current_chunk = ""
            
            for split in splits:
                test_chunk = current_chunk + (separator if current_chunk else "") + split
                
                if len(test_chunk) <= chunk_size:
                    current_chunk = test_chunk
                else:
                    if current_chunk:
                        chunks.append(current_chunk.strip())
                    
                    # If a single piece is larger than chunk_size, recurse
                    if len(split) > chunk_size:
                        sub_chunks = chunk_text_recursive(
                            split, chunk_size, overlap, separators[separators.index(separator)+1:]
                        )
                        chunks.extend(sub_chunks)
                        current_chunk = ""
                    else:
                        # Start new chunk with overlap from previous
                        if chunks:
                            overlap_text = chunks[-1][-overlap:] if overlap > 0 else ""
                            current_chunk = overlap_text + split
                        else:
                            current_chunk = split
            
            if current_chunk.strip():
                chunks.append(current_chunk.strip())
            
            return [c for c in chunks if c.strip()]
    
    return [text]


# Test it
long_text = """
Machine learning is a subset of artificial intelligence. It gives systems the ability 
to automatically learn and improve from experience without being explicitly programmed.

Deep learning is a subset of machine learning. It uses neural networks with many layers 
to learn representations of data. Deep learning has been responsible for many recent 
breakthroughs in AI, including image recognition and natural language processing.

Natural language processing (NLP) is a field of AI that gives machines the ability to 
read, understand, and derive meaning from human languages. It combines computational 
linguistics with statistical and machine learning models.
"""

chunks = chunk_text_recursive(long_text, chunk_size=300, overlap=50)
print(f"Created {len(chunks)} chunks")
for i, chunk in enumerate(chunks):
    print(f"\n--- Chunk {i+1} ---\n{chunk}")
```

Recursive chunking respects paragraph and sentence boundaries. Your chunks will be cleaner and more meaningful.

---

### Chunking Rule of Thumb

| Your content | Recommended chunk size | Overlap |
|---|---|---|
| Short FAQs, bullet points | 100–200 chars | 20 chars |
| Articles, documentation | 400–600 chars | 50–80 chars |
| Legal documents, reports | 600–800 chars | 100 chars |
| Books, long-form content | 800–1000 chars | 100–150 chars |

Start with 500 chars and 50 overlap. Evaluate and adjust based on your results.

---

## 5.5 — Step 3: Embedding and Storing Chunks

Now you embed each chunk using FastEmbed and store it in your vector database.

```python
import chromadb
from fastembed import TextEmbedding
from pypdf import PdfReader

# Initialize
embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
chroma_client = chromadb.PersistentClient(path="./rag_db")
collection = chroma_client.get_or_create_collection(
    name="documents",
    metadata={"hnsw:space": "cosine"}
)

def ingest_pdf(pdf_path: str, source_name: str):
    """Full ingestion pipeline: PDF → text → chunks → embeddings → store."""
    
    print(f"Loading PDF: {pdf_path}")
    reader = PdfReader(pdf_path)
    
    all_chunks = []
    all_metadatas = []
    
    for page_num, page in enumerate(reader.pages):
        page_text = page.extract_text()
        if not page_text or not page_text.strip():
            continue
        
        # Chunk this page
        page_chunks = chunk_text_recursive(page_text, chunk_size=500, overlap=50)
        
        for chunk_idx, chunk in enumerate(page_chunks):
            all_chunks.append(chunk)
            all_metadatas.append({
                "source": source_name,
                "page": page_num + 1,
                "chunk_index": chunk_idx
            })
    
    print(f"Created {len(all_chunks)} chunks from {len(reader.pages)} pages")
    
    # Embed all chunks using FastEmbed
    print("Generating embeddings with FastEmbed...")
    embeddings = [emb.tolist() for emb in embedding_model.embed(all_chunks)]
    
    # Generate unique IDs
    start_id = collection.count()
    ids = [f"chunk_{start_id + i}" for i in range(len(all_chunks))]
    
    # Store in Chroma
    # Chroma has a limit of 41666 items per add() call — batch if needed
    batch_size = 500
    for i in range(0, len(all_chunks), batch_size):
        collection.add(
            documents=all_chunks[i:i+batch_size],
            embeddings=embeddings[i:i+batch_size],
            metadatas=all_metadatas[i:i+batch_size],
            ids=ids[i:i+batch_size]
        )
    
    print(f"Stored {len(all_chunks)} chunks in vector database.")
    print(f"Total documents in DB: {collection.count()}")

# Usage
# ingest_pdf("my_document.pdf", "Company Policy 2024")
```

---

## 5.6 — Step 4: Retrieval

When a user asks a question, you embed it and search the vector database.

```python
def retrieve_relevant_chunks(query: str, top_k: int = 5, source_filter: str = None) -> list[dict]:
    """Retrieve the most relevant chunks for a query."""
    
    # Embed the query
    query_embedding = list(embedding_model.embed([query]))[0].tolist()
    
    # Build search parameters
    search_params = {
        "query_embeddings": [query_embedding],
        "n_results": top_k
    }
    
    # Optional: filter by source document
    if source_filter:
        search_params["where"] = {"source": source_filter}
    
    results = collection.query(**search_params)
    
    retrieved = []
    for doc, distance, metadata in zip(
        results["documents"][0],
        results["distances"][0],
        results["metadatas"][0]
    ):
        retrieved.append({
            "text": doc,
            "score": round(1 - distance, 4),
            "source": metadata.get("source", "unknown"),
            "page": metadata.get("page", 0)
        })
    
    return retrieved


# Test retrieval (before connecting to LLM)
chunks = retrieve_relevant_chunks("What is the refund policy?", top_k=3)
for chunk in chunks:
    print(f"\nScore: {chunk['score']} | Source: {chunk['source']} | Page: {chunk['page']}")
    print(chunk['text'][:200])
```

---

## 5.7 — Step 5: Generation (Putting It Together)

Now you take the retrieved chunks and pass them to the LLM to generate an answer.

```python
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
openai_client = OpenAI()

def build_rag_prompt(query: str, retrieved_chunks: list[dict]) -> str:
    """Build the prompt that combines query + retrieved context."""
    
    # Format the retrieved chunks into readable context
    context_parts = []
    for i, chunk in enumerate(retrieved_chunks, 1):
        context_parts.append(
            f"[Source {i}: {chunk['source']}, Page {chunk['page']}]\n{chunk['text']}"
        )
    
    context = "\n\n".join(context_parts)
    
    prompt = f"""You are a helpful assistant. Answer the question based ONLY on the context provided below.

If the answer is not found in the context, say "I could not find information about this in the provided documents." Do not make up an answer.

CONTEXT:
{context}

QUESTION:
{query}

ANSWER:"""
    
    return prompt


def rag_query(query: str, top_k: int = 5) -> dict:
    """Full RAG pipeline: retrieve + generate."""
    
    # Step 1: Retrieve relevant chunks
    retrieved_chunks = retrieve_relevant_chunks(query, top_k=top_k)
    
    if not retrieved_chunks:
        return {
            "answer": "No relevant documents found in the database.",
            "sources": []
        }
    
    # Step 2: Build the augmented prompt
    prompt = build_rag_prompt(query, retrieved_chunks)
    
    # Step 3: Generate answer using LLM
    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant that answers questions based on provided documents. Be accurate and cite sources when possible."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0,       # Temperature 0 for factual answers — we want consistency
        max_tokens=500
    )
    
    answer = response.choices[0].message.content
    
    # Return answer + sources for citation
    sources = [
        {"source": c["source"], "page": c["page"], "score": c["score"]}
        for c in retrieved_chunks
    ]
    
    return {
        "answer": answer,
        "sources": sources,
        "chunks_used": len(retrieved_chunks)
    }


# Test the full pipeline
result = rag_query("What is the refund policy for damaged items?")

print("ANSWER:")
print(result["answer"])
print("\nSOURCES USED:")
for s in result["sources"]:
    print(f"  → {s['source']}, Page {s['page']} (relevance: {s['score']})")
```

This is a complete, working RAG system. Let us now improve it.

---

## 5.8 — Improving RAG: The Problems and Solutions

The basic RAG above works. But there are several common failure modes. Let us go through each one.

---

### Problem 1: Retrieved chunks are not relevant enough

Sometimes the top-K chunks retrieved are not actually useful for answering the question.

**Solution: Add a relevance threshold**

Do not use chunks that score below a certain threshold.

```python
def retrieve_with_threshold(query: str, top_k: int = 5, min_score: float = 0.5) -> list[dict]:
    """Only return chunks above the minimum relevance score."""
    chunks = retrieve_relevant_chunks(query, top_k=top_k)
    
    # Filter out low-relevance chunks
    relevant_chunks = [c for c in chunks if c["score"] >= min_score]
    
    if not relevant_chunks:
        print("Warning: No chunks met the relevance threshold.")
    
    return relevant_chunks
```

Typical thresholds:
- 0.7+ → very strict, only highly relevant chunks
- 0.5–0.7 → moderate, good balance
- Below 0.5 → likely noise, better to return "not found"

---

### Problem 2: The answer depends on a chunk from page 5, but you only retrieved page 2

**Solution: Parent-Child Chunking**

The idea: you chunk at two levels.
- **Small chunks** (200 chars) for precise retrieval — finding the exact relevant spot
- **Large chunks** (the whole section or page) for context — sending to the LLM

When you retrieve a small chunk, you actually send its "parent" (the full section it came from) to the LLM. This gives the LLM more context while keeping retrieval precise.

```python
def ingest_with_parent_child(text: str, source: str):
    """Ingest with two levels: small child chunks for retrieval, large parent for context."""
    
    # Level 1: Large parent chunks (whole sections)
    parent_chunks = chunk_text_recursive(text, chunk_size=1500, overlap=100)
    
    # Level 2: Small child chunks from each parent
    child_collection = chroma_client.get_or_create_collection("children")
    parent_collection = chroma_client.get_or_create_collection("parents")
    
    for parent_idx, parent_chunk in enumerate(parent_chunks):
        parent_id = f"parent_{source}_{parent_idx}"
        
        # Store the parent
        parent_emb = list(embedding_model.embed([parent_chunk]))[0].tolist()
        parent_collection.add(
            documents=[parent_chunk],
            embeddings=[parent_emb],
            metadatas=[{"source": source}],
            ids=[parent_id]
        )
        
        # Create child chunks from this parent
        child_chunks = chunk_text_recursive(parent_chunk, chunk_size=200, overlap=30)
        
        for child_idx, child_chunk in enumerate(child_chunks):
            child_id = f"child_{source}_{parent_idx}_{child_idx}"
            child_emb = list(embedding_model.embed([child_chunk]))[0].tolist()
            
            child_collection.add(
                documents=[child_chunk],
                embeddings=[child_emb],
                metadatas={
                    "source": source,
                    "parent_id": parent_id   # Link back to parent
                },
                ids=[child_id]
            )

def retrieve_parent_child(query: str, top_k: int = 3) -> list[str]:
    """Retrieve small chunks, but return their parent chunks to the LLM."""
    child_collection = chroma_client.get_collection("children")
    parent_collection = chroma_client.get_collection("parents")
    
    # Retrieve small children (precise)
    query_emb = list(embedding_model.embed([query]))[0].tolist()
    results = child_collection.query(query_embeddings=[query_emb], n_results=top_k)
    
    # Get unique parent IDs
    parent_ids = list(set(
        meta["parent_id"]
        for meta in results["metadatas"][0]
    ))
    
    # Fetch parent chunks (full context)
    parents = parent_collection.get(ids=parent_ids)
    
    return parents["documents"]
```

---

### Problem 3: LLM uses retrieved context but also adds hallucinated information

**Solution: Strict grounding prompt**

In your system prompt, be very explicit:

```python
STRICT_SYSTEM_PROMPT = """You are a document assistant. Your ONLY job is to answer questions 
based on the document context provided to you.

STRICT RULES:
1. Answer ONLY from the provided context. Do not use any outside knowledge.
2. If the context does not contain enough information to answer, say exactly: 
   "The provided documents do not contain information about this."
3. Always mention which source your answer came from.
4. Never guess or infer beyond what is clearly stated.
5. Use direct quotes from the context when possible."""
```

Temperature = 0 also helps here — less creative = less likely to wander outside the context.

---

### Problem 4: Query is too short or vague for good retrieval

A short query like "refund?" may not embed well enough to find the right chunks.

**Solution: Query Expansion / Rewriting**

Before searching, use an LLM to rewrite the query into a more detailed, search-friendly version.

```python
def expand_query(original_query: str) -> str:
    """Use LLM to rewrite a short query into a better search query."""
    
    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": "You rewrite short user queries into detailed search queries for document retrieval. Return only the rewritten query, nothing else."
            },
            {
                "role": "user",
                "content": f"Rewrite this query to be more detailed for document search: '{original_query}'"
            }
        ],
        temperature=0,
        max_tokens=100
    )
    
    return response.choices[0].message.content.strip()

# Example
original = "refund?"
expanded = expand_query(original)
print(f"Original: {original}")
print(f"Expanded: {expanded}")
# Expanded: What is the refund policy and how can I request a refund for a purchase?
```

---

### Problem 5: The same question is asked many times, wasting API calls and money

**Solution: Simple Response Cache**

```python
import hashlib

response_cache = {}

def cached_rag_query(query: str) -> dict:
    """Cache responses to avoid duplicate LLM calls."""
    
    # Create a hash of the query as cache key
    query_hash = hashlib.md5(query.lower().strip().encode()).hexdigest()
    
    if query_hash in response_cache:
        print("(Cache hit — returning cached response)")
        return response_cache[query_hash]
    
    # Not in cache — run the full RAG pipeline
    result = rag_query(query)
    
    # Cache the result
    response_cache[query_hash] = result
    
    return result
```

In production, you would use Redis instead of a dictionary, so the cache persists across server restarts.

---

## 5.9 — The Lost-in-the-Middle Problem

Research has shown that LLMs pay more attention to content at the beginning and end of the context — and tend to "lose" information in the middle.

If you retrieve 10 chunks and the most relevant one ends up in the middle of your prompt, the LLM may partially ignore it.

**Solution: Put the most relevant chunks first and last.**

```python
def arrange_chunks_for_llm(chunks: list[dict]) -> list[dict]:
    """
    Reorder chunks to avoid lost-in-the-middle problem.
    Put highest-scoring chunks at the start and end.
    """
    if len(chunks) <= 2:
        return chunks
    
    # Sort by score descending
    sorted_chunks = sorted(chunks, key=lambda x: x["score"], reverse=True)
    
    # Best chunk first, second best last, rest in middle
    best = sorted_chunks[0]
    second_best = sorted_chunks[1]
    middle = sorted_chunks[2:]
    
    return [best] + middle + [second_best]
```

---

## 5.10 — Streaming RAG Responses

Users should see the answer appear word by word — not wait for the whole thing.

```python
def rag_query_streaming(query: str, top_k: int = 5):
    """RAG with streaming output."""
    
    # Retrieve
    retrieved_chunks = retrieve_with_threshold(query, top_k=top_k, min_score=0.45)
    
    if not retrieved_chunks:
        print("No relevant information found in the documents.")
        return
    
    # Arrange to avoid lost-in-the-middle
    arranged_chunks = arrange_chunks_for_llm(retrieved_chunks)
    
    # Build prompt
    prompt = build_rag_prompt(query, arranged_chunks)
    
    # Stream
    print("Answer: ", end="", flush=True)
    
    stream = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": STRICT_SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        temperature=0,
        max_tokens=600,
        stream=True
    )
    
    for chunk in stream:
        if chunk.choices[0].delta.content:
            print(chunk.choices[0].delta.content, end="", flush=True)
    
    print()  # New line
    
    # Show sources
    print("\nSources:")
    seen_sources = set()
    for c in arranged_chunks:
        key = f"{c['source']} (Page {c['page']})"
        if key not in seen_sources:
            print(f"  → {key}")
            seen_sources.add(key)
```

---

## 5.11 — RAG Evaluation: How Do You Know If It Is Working?

**The problem:** You built a RAG system. But how do you measure if it is actually giving good answers?

You need to evaluate two things separately:

**1. Retrieval quality** — Is the system retrieving the right chunks?
**2. Generation quality** — Is the LLM answering correctly based on what was retrieved?

---

### Evaluating Retrieval

Create a test set of questions where you know which document/chunk contains the answer.

```python
test_questions = [
    {
        "question": "What is the refund period?",
        "expected_source": "Company Policy 2024",
        "expected_keywords": ["30 days", "refund"]
    },
    {
        "question": "How long does shipping take?",
        "expected_source": "Company Policy 2024",
        "expected_keywords": ["5-7 business days", "delivery"]
    }
]

def evaluate_retrieval(test_cases: list[dict]) -> dict:
    """Check if retrieval finds the right source."""
    
    correct = 0
    
    for test in test_cases:
        chunks = retrieve_relevant_chunks(test["question"], top_k=5)
        
        # Check if expected source appears in top results
        retrieved_sources = [c["source"] for c in chunks]
        found = test["expected_source"] in retrieved_sources
        
        if found:
            correct += 1
        else:
            print(f"MISS: '{test['question']}'")
            print(f"  Expected source: {test['expected_source']}")
            print(f"  Got: {retrieved_sources}")
    
    accuracy = correct / len(test_cases)
    print(f"\nRetrieval accuracy: {correct}/{len(test_cases)} = {accuracy:.1%}")
    return {"accuracy": accuracy}

evaluate_retrieval(test_questions)
```

---

### Evaluating Generation (LLM-as-Judge)

Use an LLM to score the quality of another LLM's answers. This is called the "LLM-as-judge" pattern.

```python
def evaluate_answer(question: str, context: str, answer: str) -> dict:
    """Use GPT to score the quality of a RAG answer."""
    
    eval_prompt = f"""You are evaluating the quality of an AI assistant's answer.

QUESTION: {question}

CONTEXT PROVIDED TO AI:
{context}

AI'S ANSWER:
{answer}

Rate the answer on these criteria (score 1-5 each):
1. Faithfulness: Is the answer based only on the provided context? (1=made up info, 5=fully grounded)
2. Relevance: Does the answer actually address the question? (1=off-topic, 5=directly answers)
3. Completeness: Does it include all relevant information from context? (1=missing key info, 5=complete)

Return a JSON object with keys: faithfulness, relevance, completeness, overall_comment
Return ONLY the JSON, nothing else."""
    
    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": eval_prompt}],
        temperature=0
    )
    
    import json
    try:
        scores = json.loads(response.choices[0].message.content)
        return scores
    except json.JSONDecodeError:
        return {"error": "Could not parse evaluation scores"}


# Use it
result = rag_query("What is the return policy?")
evaluation = evaluate_answer(
    question="What is the return policy?",
    context="\n".join([c["text"] for c in result.get("sources", [])]),
    answer=result["answer"]
)

print("Evaluation scores:")
print(f"  Faithfulness: {evaluation.get('faithfulness')}/5")
print(f"  Relevance: {evaluation.get('relevance')}/5")
print(f"  Completeness: {evaluation.get('completeness')}/5")
print(f"  Comment: {evaluation.get('overall_comment')}")
```

---

## 5.12 — Complete RAG System (All Together)

Here is the full, clean RAG system combining everything:

```python
import chromadb
import hashlib
from fastembed import TextEmbedding
from openai import OpenAI
from pypdf import PdfReader
from dotenv import load_dotenv

load_dotenv()

class RAGSystem:
    def __init__(self, db_path: str = "./rag_db"):
        self.embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
        self.openai_client = OpenAI()
        self.chroma_client = chromadb.PersistentClient(path=db_path)
        self.collection = self.chroma_client.get_or_create_collection(
            name="rag_documents",
            metadata={"hnsw:space": "cosine"}
        )
        self.cache = {}
    
    # ── INGESTION ──────────────────────────────────────
    
    def ingest_pdf(self, pdf_path: str, source_name: str):
        reader = PdfReader(pdf_path)
        all_chunks, all_metas = [], []
        
        for page_num, page in enumerate(reader.pages):
            text = page.extract_text()
            if not text or not text.strip():
                continue
            
            chunks = self._chunk_text(text, chunk_size=500, overlap=50)
            for i, chunk in enumerate(chunks):
                all_chunks.append(chunk)
                all_metas.append({"source": source_name, "page": page_num + 1})
        
        self._store_chunks(all_chunks, all_metas)
        print(f"Ingested '{source_name}': {len(all_chunks)} chunks stored.")
    
    def ingest_text(self, text: str, source_name: str):
        chunks = self._chunk_text(text, chunk_size=500, overlap=50)
        metas = [{"source": source_name, "page": 0} for _ in chunks]
        self._store_chunks(chunks, metas)
        print(f"Ingested '{source_name}': {len(chunks)} chunks stored.")
    
    def _chunk_text(self, text: str, chunk_size: int, overlap: int) -> list[str]:
        chunks, start = [], 0
        while start < len(text):
            chunk = text[start:start + chunk_size].strip()
            if chunk:
                chunks.append(chunk)
            start += chunk_size - overlap
        return chunks
    
    def _store_chunks(self, chunks: list[str], metas: list[dict]):
        if not chunks:
            return
        embeddings = [emb.tolist() for emb in self.embedding_model.embed(chunks)]
        start_id = self.collection.count()
        ids = [f"chunk_{start_id + i}" for i in range(len(chunks))]
        batch_size = 500
        for i in range(0, len(chunks), batch_size):
            self.collection.add(
                documents=chunks[i:i+batch_size],
                embeddings=embeddings[i:i+batch_size],
                metadatas=metas[i:i+batch_size],
                ids=ids[i:i+batch_size]
            )
    
    # ── RETRIEVAL ──────────────────────────────────────
    
    def retrieve(self, query: str, top_k: int = 5, min_score: float = 0.45) -> list[dict]:
        query_emb = list(self.embedding_model.embed([query]))[0].tolist()
        results = self.collection.query(query_embeddings=[query_emb], n_results=top_k)
        
        chunks = []
        for doc, distance, meta in zip(
            results["documents"][0],
            results["distances"][0],
            results["metadatas"][0]
        ):
            score = round(1 - distance, 4)
            if score >= min_score:
                chunks.append({"text": doc, "score": score, **meta})
        
        return chunks
    
    # ── GENERATION ────────────────────────────────────
    
    def ask(self, question: str, top_k: int = 5, stream: bool = True) -> str:
        # Cache check
        cache_key = hashlib.md5(question.lower().strip().encode()).hexdigest()
        if cache_key in self.cache:
            print("(Cached response)")
            return self.cache[cache_key]
        
        # Retrieve
        chunks = self.retrieve(question, top_k=top_k)
        if not chunks:
            return "I could not find relevant information in the documents."
        
        # Build context
        context = "\n\n".join([
            f"[{c['source']}, Page {c['page']}]\n{c['text']}"
            for c in chunks
        ])
        
        prompt = f"""Answer the question using ONLY the context below.
If the answer is not in the context, say "This information is not available in the documents."

CONTEXT:
{context}

QUESTION: {question}

ANSWER:"""
        
        # Generate
        if stream:
            print("Answer: ", end="", flush=True)
            full_answer = ""
            response_stream = self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0,
                max_tokens=600,
                stream=True
            )
            for chunk in response_stream:
                if chunk.choices[0].delta.content:
                    text = chunk.choices[0].delta.content
                    print(text, end="", flush=True)
                    full_answer += text
            print()
        else:
            response = self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0,
                max_tokens=600
            )
            full_answer = response.choices[0].message.content
        
        # Print sources
        print("\nSources:")
        seen = set()
        for c in chunks:
            key = f"{c['source']}, Page {c['page']}"
            if key not in seen:
                print(f"  → {key} (score: {c['score']})")
                seen.add(key)
        
        # Cache and return
        self.cache[cache_key] = full_answer
        return full_answer
    
    def document_count(self) -> int:
        return self.collection.count()


# ── USE IT ────────────────────────────────────────────

rag = RAGSystem()

# Ingest documents
# rag.ingest_pdf("company_handbook.pdf", "Company Handbook 2024")
# rag.ingest_pdf("product_docs.pdf", "Product Documentation")

# For testing without a PDF:
rag.ingest_text("""
Our return policy allows customers to return any product within 30 days of purchase.
To initiate a return, contact support@company.com with your order number.
Refunds are processed within 5-7 business days after we receive the item.
Items must be in original condition. Damaged items are not eligible for refund.
""", "Return Policy")

rag.ingest_text("""
Standard shipping takes 5-7 business days and is free for orders above Rs 500.
Express shipping takes 1-2 business days and costs Rs 99.
International shipping is available to 25 countries. Delivery takes 10-15 business days.
All orders are tracked. You will receive a tracking link via email after dispatch.
""", "Shipping Policy")

print(f"\nTotal chunks in DB: {rag.document_count()}")

# Ask questions
rag.ask("How long do I have to return a product?")
print()
rag.ask("How much does express shipping cost?")
print()
rag.ask("Can I return a damaged item?")
```

---

## 5.13 — Project: PDF Q&A App

Build this as your Phase 5 project. Everything you need is in this chapter.

**What to build:**

A command-line application where you can:
1. Load one or more PDF files into the system
2. Ask questions about them
3. Get answers with source citations
4. Ask follow-up questions in a loop

**Requirements:**
1. Uses FastEmbed for embeddings (local, free)
2. Uses Chroma for vector storage (local)
3. Uses OpenAI or Anthropic for generation
4. Shows source citations with every answer
5. Has a relevance threshold — do not answer if no relevant chunk found
6. Streams the response

**Starter structure:**

```python
# pdf_qa.py

import sys
from rag_system import RAGSystem  # Save the RAGSystem class above

def main():
    rag = RAGSystem()
    
    # Load PDFs from command line arguments
    if len(sys.argv) > 1:
        for pdf_path in sys.argv[1:]:
            source_name = pdf_path.split("/")[-1].replace(".pdf", "")
            rag.ingest_pdf(pdf_path, source_name)
    else:
        print("Usage: python pdf_qa.py document1.pdf document2.pdf")
        print("Starting with sample data...\n")
        rag.ingest_text("Sample document content here.", "Sample Doc")
    
    print(f"\n✓ Ready. {rag.document_count()} chunks loaded.")
    print("Ask questions about your documents. Type 'quit' to exit.\n")
    
    while True:
        question = input("Your question: ").strip()
        
        if question.lower() in ["quit", "exit"]:
            break
        
        if not question:
            continue
        
        print()
        rag.ask(question)
        print()

if __name__ == "__main__":
    main()
```

Run it:
```bash
python pdf_qa.py my_document.pdf
```

---

## Chapter 5 Summary

| Step | What happens | Tools used |
|---|---|---|
| Load | Extract text from PDF/web/txt | pypdf, requests, bs4 |
| Chunk | Split into 400–600 char pieces | Custom function |
| Embed | Convert each chunk to a vector | FastEmbed (BAAI/bge-small) |
| Store | Save vectors + text + metadata | Chroma |
| Retrieve | Find top-K similar chunks for query | Chroma query |
| Generate | LLM answers using retrieved chunks | OpenAI / Anthropic |

Common improvements:
- Relevance threshold — ignore low-score chunks
- Query expansion — rewrite short queries
- Lost-in-the-middle fix — reorder chunks
- Response caching — avoid duplicate API calls
- LLM-as-judge evaluation — measure answer quality

---

## What Is Coming Next

**Chapter 6 — Advanced RAG and Optimization**

You now have a working RAG system. Chapter 6 takes it further — better indexing strategies, query routing, handling multiple document types, cost and latency optimization, and more robust retrieval techniques. This is where your RAG system goes from good to production-grade.

---

*End of Chapter 5*
