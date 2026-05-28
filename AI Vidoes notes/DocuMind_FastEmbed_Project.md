# DocuMind — Smart Document Q&A System
### A Complete Project Using FastEmbed

---

## What You Are Building

Imagine you have 10 PDF documents — a company handbook, product manuals, policy documents. You want to ask questions in plain English and get accurate answers from those documents instantly.

That is DocuMind.

You load your documents once. Then you ask questions like:
- "What is the leave policy?"
- "How do I return a product?"
- "What are the system requirements for the software?"

The system finds the relevant parts of your documents and answers precisely — not by guessing, but by reading the actual content.

**What makes this project special:**
- Uses **FastEmbed** for embeddings — runs locally, completely free, no API key for embeddings
- Works with **any PDF or text file** you give it
- Has a **command-line interface** (ask questions interactively)
- Has a **FastAPI backend** (so any app can call it)
- Shows **exactly which document and page** each answer came from

---

## How It Works (Big Picture)

Before writing any code, understand the flow. There are two phases:

**Phase 1 — Loading (you do this once):**
```
Your PDF files
     ↓
Extract text from each page
     ↓
Split text into small chunks (like cutting a book into paragraphs)
     ↓
FastEmbed converts each chunk into numbers (vectors)
     ↓
Save everything in a local database (Chroma)
```

**Phase 2 — Asking (every time you have a question):**
```
Your question
     ↓
FastEmbed converts your question into numbers too
     ↓
Find chunks whose numbers are closest to your question's numbers
     ↓
Send those chunks + your question to OpenAI
     ↓
OpenAI reads the chunks and answers your question
     ↓
You get the answer + which documents it came from
```

That is it. FastEmbed does the "converting text to numbers" part — and it does it on your machine, no internet needed.

---

## Folder Structure

```
documind/
│
├── main.py              ← The main program (CLI interface)
├── api.py               ← FastAPI backend (optional — for web apps)
├── core/
│   ├── __init__.py
│   ├── loader.py        ← Loads PDFs and text files
│   ├── chunker.py       ← Splits text into chunks
│   ├── embedder.py      ← FastEmbed wrapper
│   ├── store.py         ← Chroma vector database wrapper
│   └── answerer.py      ← Calls OpenAI to generate answers
├── sample_docs/         ← Put your test documents here
│   └── sample_policy.txt
├── .env                 ← Your API keys (never commit this)
├── requirements.txt
└── README.md
```

---

## Step 1 — Setup

### Create the project folder

```bash
mkdir documind
cd documind
mkdir core sample_docs
touch core/__init__.py
```

### Create virtual environment

```bash
python -m venv venv

# Mac/Linux:
source venv/bin/activate

# Windows:
venv\Scripts\activate
```

### Install dependencies

```bash
pip install fastembed chromadb pypdf openai python-dotenv fastapi uvicorn python-multipart
```

### Create `.env` file

```
OPENAI_API_KEY=sk-your-openai-key-here
```

### Create `requirements.txt`

```
fastembed==0.3.6
chromadb==0.5.3
pypdf==4.3.1
openai==1.35.7
python-dotenv==1.0.1
fastapi==0.111.0
uvicorn==0.30.1
python-multipart==0.0.9
```

---

## Step 2 — The Loader (`core/loader.py`)

This file reads your documents and extracts clean text.

```python
# core/loader.py

import os
from pypdf import PdfReader
from pathlib import Path


def load_pdf(file_path: str) -> list[dict]:
    """
    Read a PDF file and return a list of pages.
    Each page is a dict with 'text', 'page_number', and 'source'.

    Why return page by page?
    Because we want to tell the user WHICH PAGE the answer came from.
    "See: Company Handbook, Page 12" is much more useful than just the answer.
    """
    reader = PdfReader(file_path)
    pages = []

    for page_num, page in enumerate(reader.pages):
        text = page.extract_text()

        # Skip blank pages — they add noise without value
        if not text or len(text.strip()) < 50:
            continue

        pages.append({
            "text": text.strip(),
            "page_number": page_num + 1,       # Human-readable (starts at 1)
            "source": Path(file_path).name,     # Just the filename, not full path
            "file_path": file_path
        })

    print(f"  Loaded {len(pages)} pages from '{Path(file_path).name}'")
    return pages


def load_text_file(file_path: str) -> list[dict]:
    """
    Read a plain text file (.txt, .md).
    Since there are no page numbers, we treat every 500 characters as one "page".
    This keeps things consistent with PDFs.
    """
    with open(file_path, "r", encoding="utf-8") as f:
        full_text = f.read()

    # Split into fake "pages" for consistency
    chunk_size = 1500
    pages = []

    for i in range(0, len(full_text), chunk_size):
        segment = full_text[i:i + chunk_size].strip()
        if len(segment) < 50:
            continue

        pages.append({
            "text": segment,
            "page_number": (i // chunk_size) + 1,
            "source": Path(file_path).name,
            "file_path": file_path
        })

    print(f"  Loaded {len(pages)} segments from '{Path(file_path).name}'")
    return pages


def load_document(file_path: str) -> list[dict]:
    """
    Automatically detect file type and load accordingly.
    Supported: .pdf, .txt, .md
    """
    file_path = str(file_path)

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    extension = Path(file_path).suffix.lower()

    if extension == ".pdf":
        return load_pdf(file_path)
    elif extension in [".txt", ".md"]:
        return load_text_file(file_path)
    else:
        raise ValueError(f"Unsupported file type: {extension}. Use .pdf, .txt, or .md")


def load_folder(folder_path: str) -> list[dict]:
    """
    Load ALL supported documents from a folder.
    Useful when you want to index an entire folder of documents at once.
    """
    folder = Path(folder_path)

    if not folder.exists():
        raise FileNotFoundError(f"Folder not found: {folder_path}")

    supported_extensions = [".pdf", ".txt", ".md"]
    all_pages = []

    files = [f for f in folder.iterdir() if f.suffix.lower() in supported_extensions]

    if not files:
        print(f"No supported files found in '{folder_path}'")
        return []

    print(f"\nLoading {len(files)} file(s) from '{folder_path}':")

    for file in sorted(files):
        try:
            pages = load_document(str(file))
            all_pages.extend(pages)
        except Exception as e:
            print(f"  Warning: Could not load '{file.name}': {e}")

    print(f"\nTotal pages/segments loaded: {len(all_pages)}")
    return all_pages
```

---

## Step 3 — The Chunker (`core/chunker.py`)

This file splits each page into smaller pieces.

**Why split further if we already have pages?**

A page of a PDF can have 300–500 words. That is too large for precise retrieval. We want to find the exact paragraph that answers the question — not the whole page.

Think of it like this: if someone asks "What is the notice period?", you want to retrieve the one paragraph that mentions notice period — not the entire HR policy page.

```python
# core/chunker.py

def split_into_chunks(text: str, chunk_size: int = 400, overlap: int = 60) -> list[str]:
    """
    Split a long text into smaller overlapping chunks.

    chunk_size: How many characters per chunk.
                400 characters ≈ 60–80 words ≈ 3–5 sentences.
                This is the sweet spot for most documents.

    overlap:    How many characters to repeat between consecutive chunks.
                Why overlap? Because important information often sits
                at the boundary between two chunks. Overlapping ensures
                we don't lose that information.

    Example with chunk_size=10, overlap=3:
    Text: "ABCDEFGHIJKLMNOPQRST"
    Chunk 1: "ABCDEFGHIJ"
    Chunk 2: "HIJKLMNOPQ"  ← starts 3 chars back (overlap=3)
    Chunk 3: "OPQRST"
    """
    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]

        # Clean up the chunk
        chunk = chunk.strip()

        # Only add chunks that have meaningful content
        if len(chunk) > 30:
            chunks.append(chunk)

        # Move forward — but go back by overlap amount
        start += chunk_size - overlap

    return chunks


def chunk_pages(pages: list[dict], chunk_size: int = 400, overlap: int = 60) -> list[dict]:
    """
    Take all pages from the loader and split each into chunks.

    Each chunk keeps metadata from its parent page:
    - Which file it came from
    - Which page number it was on
    - Its position among chunks on that page

    This metadata is crucial. When we retrieve a chunk later,
    we can tell the user exactly where to look for the full context.
    """
    all_chunks = []

    for page in pages:
        page_chunks = split_into_chunks(page["text"], chunk_size, overlap)

        for chunk_idx, chunk_text in enumerate(page_chunks):
            all_chunks.append({
                "text": chunk_text,
                "source": page["source"],
                "page_number": page["page_number"],
                "chunk_index": chunk_idx,
                # Create a readable ID for this chunk
                "chunk_id": f"{page['source']}_page{page['page_number']}_chunk{chunk_idx}"
            })

    return all_chunks


def print_chunk_stats(chunks: list[dict]):
    """Print a summary of the chunks created. Useful for debugging."""
    if not chunks:
        print("No chunks created.")
        return

    sources = {}
    for chunk in chunks:
        src = chunk["source"]
        sources[src] = sources.get(src, 0) + 1

    print(f"\nChunk Statistics:")
    print(f"  Total chunks: {len(chunks)}")
    print(f"  Average chunk length: {sum(len(c['text']) for c in chunks) // len(chunks)} chars")
    print(f"\n  Per document:")
    for source, count in sorted(sources.items()):
        print(f"    {source}: {count} chunks")
```

---

## Step 4 — The Embedder (`core/embedder.py`)

This is the **heart of the project** — where FastEmbed does its work.

```python
# core/embedder.py

from fastembed import TextEmbedding
import numpy as np


class FastEmbedder:
    """
    Wrapper around FastEmbed for easy use throughout the project.

    Why FastEmbed?
    - Runs completely on your machine (no API calls for embedding)
    - Free — no cost per embedding, unlike OpenAI's embedding API
    - Fast — optimized for CPU, does not need a GPU
    - Good quality — BAAI/bge-small-en-v1.5 is one of the best small models

    When you create this class, it downloads the model the first time (~90MB).
    After that, it uses the cached version — no download needed again.
    """

    def __init__(self, model_name: str = "BAAI/bge-small-en-v1.5"):
        print(f"Loading FastEmbed model: {model_name}")
        print("(First time: downloads ~90MB. After that, instant.)")
        self.model = TextEmbedding(model_name=model_name)
        self.model_name = model_name
        self.dimensions = 384   # BAAI/bge-small-en-v1.5 produces 384-dim vectors
        print(f"Model ready. Each text → {self.dimensions} numbers.")

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        """
        Convert a list of texts into a list of vectors.

        FastEmbed works in batches — give it 100 texts at once
        and it processes them efficiently.

        Each text becomes a list of 384 numbers.
        These numbers capture the meaning of the text.
        Similar texts → similar numbers.
        """
        if not texts:
            return []

        # embed() returns a generator — we convert to list
        embeddings = list(self.model.embed(texts))

        # Convert numpy arrays to plain Python lists
        # (Chroma and other tools prefer plain lists over numpy arrays)
        return [emb.tolist() for emb in embeddings]

    def embed_single(self, text: str) -> list[float]:
        """
        Embed a single text. Used for embedding user queries.
        Returns a single list of 384 numbers.
        """
        result = list(self.model.embed([text]))
        return result[0].tolist()

    def embed_chunks(self, chunks: list[dict]) -> list[dict]:
        """
        Add embeddings to a list of chunk dictionaries.

        Takes chunks like:
            [{"text": "...", "source": "...", ...}, ...]

        Returns the same chunks but with an "embedding" key added:
            [{"text": "...", "source": "...", "embedding": [0.1, 0.3, ...], ...}, ...]

        We process in batches of 100 for efficiency.
        """
        if not chunks:
            return []

        print(f"\nEmbedding {len(chunks)} chunks with FastEmbed...")
        print("(This runs locally on your machine — no API cost)")

        batch_size = 100
        embedded_chunks = []

        for i in range(0, len(chunks), batch_size):
            batch = chunks[i:i + batch_size]
            texts = [c["text"] for c in batch]

            # Get embeddings for this batch
            embeddings = self.embed_texts(texts)

            # Add embeddings back to chunks
            for chunk, embedding in zip(batch, embeddings):
                chunk_with_embedding = chunk.copy()
                chunk_with_embedding["embedding"] = embedding
                embedded_chunks.append(chunk_with_embedding)

            # Show progress
            processed = min(i + batch_size, len(chunks))
            print(f"  Progress: {processed}/{len(chunks)} chunks embedded", end="\r")

        print(f"\n  Done. {len(embedded_chunks)} chunks embedded.")
        return embedded_chunks

    def cosine_similarity(self, vec1: list[float], vec2: list[float]) -> float:
        """
        Calculate how similar two vectors are.
        Returns a number between 0 and 1.
        1.0 = identical meaning
        0.0 = completely different meaning
        """
        v1 = np.array(vec1)
        v2 = np.array(vec2)
        return float(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)))
```

---

## Step 5 — The Store (`core/store.py`)

This file manages the Chroma vector database — saving and searching chunks.

```python
# core/store.py

import chromadb
from pathlib import Path


class DocumentStore:
    """
    Manages the Chroma vector database.

    Chroma is a local vector database — it stores your document chunks
    along with their embeddings. When you search, it finds the
    chunks whose embeddings are closest to your query embedding.

    The data persists on disk — so you only need to ingest documents once.
    Next time you start the app, everything is already there.
    """

    def __init__(self, db_path: str = "./documind_db"):
        """
        Connect to (or create) the Chroma database.
        db_path: folder where the database files are stored.
        """
        Path(db_path).mkdir(exist_ok=True)
        self.client = chromadb.PersistentClient(path=db_path)
        self.collection = self.client.get_or_create_collection(
            name="documents",
            metadata={"hnsw:space": "cosine"}  # Use cosine similarity for search
        )
        print(f"Database connected. Currently storing {self.collection.count()} chunks.")

    def add_chunks(self, embedded_chunks: list[dict]) -> int:
        """
        Save embedded chunks into the database.

        Each chunk needs:
        - A unique ID
        - The text content
        - The embedding (list of numbers)
        - Metadata (source file, page number, etc.)

        Returns the number of chunks added.
        """
        if not embedded_chunks:
            print("No chunks to add.")
            return 0

        # Chroma handles large inserts better in batches of 500
        batch_size = 500
        total_added = 0

        for i in range(0, len(embedded_chunks), batch_size):
            batch = embedded_chunks[i:i + batch_size]

            ids = [c["chunk_id"] for c in batch]
            texts = [c["text"] for c in batch]
            embeddings = [c["embedding"] for c in batch]
            metadatas = [
                {
                    "source": c["source"],
                    "page_number": c["page_number"],
                    "chunk_index": c["chunk_index"]
                }
                for c in batch
            ]

            # add() stores everything in the database
            self.collection.add(
                ids=ids,
                documents=texts,
                embeddings=embeddings,
                metadatas=metadatas
            )

            total_added += len(batch)

        print(f"Saved {total_added} chunks to database.")
        print(f"Database now has {self.collection.count()} total chunks.")
        return total_added

    def search(
        self,
        query_embedding: list[float],
        top_k: int = 5,
        source_filter: str = None
    ) -> list[dict]:
        """
        Find the most relevant chunks for a query.

        query_embedding: the vector for the user's question
        top_k: how many chunks to return (5 is usually enough)
        source_filter: if set, only search in a specific document

        Returns a list of dicts, each with:
        - text: the chunk content
        - source: which file it came from
        - page_number: which page
        - score: how relevant (0 to 1, higher is better)
        """
        search_params = {
            "query_embeddings": [query_embedding],
            "n_results": min(top_k, self.collection.count()),
            "include": ["documents", "metadatas", "distances"]
        }

        # Optional: filter by source document
        if source_filter:
            search_params["where"] = {"source": source_filter}

        results = self.collection.query(**search_params)

        # Format results into clean dicts
        found = []
        for text, metadata, distance in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0]
        ):
            # Convert distance to similarity score
            # In cosine space: distance = 1 - similarity
            similarity_score = round(1 - distance, 4)

            found.append({
                "text": text,
                "source": metadata["source"],
                "page_number": metadata["page_number"],
                "chunk_index": metadata["chunk_index"],
                "score": similarity_score
            })

        # Sort by score (highest relevance first)
        found.sort(key=lambda x: x["score"], reverse=True)
        return found

    def get_all_sources(self) -> list[str]:
        """Return a list of all document names currently in the database."""
        if self.collection.count() == 0:
            return []

        results = self.collection.get(include=["metadatas"])
        sources = list(set(m["source"] for m in results["metadatas"]))
        return sorted(sources)

    def delete_source(self, source_name: str) -> int:
        """Remove all chunks from a specific document."""
        results = self.collection.get(
            where={"source": source_name},
            include=["metadatas"]
        )

        if not results["ids"]:
            print(f"No chunks found for '{source_name}'")
            return 0

        self.collection.delete(ids=results["ids"])
        count = len(results["ids"])
        print(f"Deleted {count} chunks from '{source_name}'")
        return count

    def total_chunks(self) -> int:
        return self.collection.count()

    def is_empty(self) -> bool:
        return self.collection.count() == 0
```

---

## Step 6 — The Answerer (`core/answerer.py`)

This file sends the retrieved chunks to OpenAI and gets the answer.

```python
# core/answerer.py

from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()


class Answerer:
    """
    Uses OpenAI to generate answers from retrieved document chunks.

    The flow:
    1. Take the user's question
    2. Take the retrieved chunks (the relevant parts of your documents)
    3. Build a prompt that says: "Here are the relevant document parts.
       Answer the question based ONLY on these."
    4. Get the answer from OpenAI
    5. Return the answer + which sources were used
    """

    def __init__(self, model: str = "gpt-4o-mini"):
        self.client = OpenAI()
        self.model = model

    def build_context(self, chunks: list[dict]) -> str:
        """
        Format the retrieved chunks into a readable context string.

        Each chunk is labeled with its source and page number.
        This way the LLM knows where each piece of information comes from
        and can include that in its answer.
        """
        context_parts = []

        for i, chunk in enumerate(chunks, 1):
            context_parts.append(
                f"[Document {i}: {chunk['source']}, Page {chunk['page_number']}]\n"
                f"{chunk['text']}"
            )

        return "\n\n".join(context_parts)

    def answer(self, question: str, chunks: list[dict], stream: bool = True) -> dict:
        """
        Generate an answer from the question and retrieved chunks.

        question: the user's question
        chunks: retrieved document chunks from the vector store
        stream: if True, print tokens as they arrive (like ChatGPT)

        Returns:
        {
            "answer": "The full answer text",
            "sources": [{"source": "file.pdf", "page": 3}, ...]
        }
        """
        if not chunks:
            return {
                "answer": "I could not find relevant information in your documents to answer this question.",
                "sources": []
            }

        context = self.build_context(chunks)

        # The prompt tells the model exactly what to do
        # Temperature 0 = consistent, factual answers (no creativity)
        system_prompt = """You are a precise document assistant. 

Your job:
- Answer questions based ONLY on the document context provided
- If the answer is in the documents, give it clearly and concisely
- Always mention which document and page your answer comes from
- If the answer is NOT in the documents, say exactly: "This information is not available in the loaded documents."
- Never make up information. Never use outside knowledge.
- Be concise. Do not pad your answer with unnecessary words."""

        user_prompt = f"""Documents:
{context}

Question: {question}

Answer:"""

        if stream:
            # Stream mode — tokens print as they arrive
            print("\nAnswer: ", end="", flush=True)
            full_answer = ""

            stream_response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0,
                max_tokens=600,
                stream=True
            )

            for chunk in stream_response:
                token = chunk.choices[0].delta.content
                if token:
                    print(token, end="", flush=True)
                    full_answer += token

            print()  # New line after answer

        else:
            # Non-stream mode — wait for complete response
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0,
                max_tokens=600
            )
            full_answer = response.choices[0].message.content

        # Extract unique sources used
        sources = []
        seen = set()
        for chunk in chunks:
            key = f"{chunk['source']}_p{chunk['page_number']}"
            if key not in seen:
                sources.append({
                    "source": chunk["source"],
                    "page": chunk["page_number"],
                    "relevance_score": chunk["score"]
                })
                seen.add(key)

        return {
            "answer": full_answer,
            "sources": sources
        }

    def is_question_answerable(self, question: str, chunks: list[dict]) -> bool:
        """
        Quick check: do the retrieved chunks actually contain
        information relevant to the question?

        Uses a fast LLM call to grade relevance.
        Returns True if the chunks seem relevant, False otherwise.
        """
        if not chunks:
            return False

        # Use top 2 chunks for this check — we just need a quick relevance signal
        sample_context = "\n\n".join([c["text"] for c in chunks[:2]])

        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{
                "role": "user",
                "content": f"""Does this context contain information relevant to the question?
Context: {sample_context[:500]}
Question: {question}
Reply ONLY 'yes' or 'no'."""
            }],
            temperature=0,
            max_tokens=5
        )

        return response.choices[0].message.content.strip().lower() == "yes"
```

---

## Step 7 — The Main Program (`main.py`)

This ties everything together into a clean command-line tool.

```python
# main.py

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

from core.loader import load_document, load_folder
from core.chunker import chunk_pages, print_chunk_stats
from core.embedder import FastEmbedder
from core.store import DocumentStore
from core.answerer import Answerer

load_dotenv()


class DocuMind:
    """
    The main DocuMind system.
    Ties together loading, chunking, embedding, storing, and answering.
    """

    def __init__(self, db_path: str = "./documind_db"):
        print("\n" + "="*50)
        print("DocuMind — Smart Document Q&A")
        print("="*50)

        # Initialize all components
        self.embedder = FastEmbedder(model_name="BAAI/bge-small-en-v1.5")
        self.store = DocumentStore(db_path=db_path)
        self.answerer = Answerer(model="gpt-4o-mini")

    def ingest(self, path: str, chunk_size: int = 400, overlap: int = 60):
        """
        Load a document (or folder of documents) into the system.

        Steps:
        1. Load the file(s) → extract text per page
        2. Split pages into smaller chunks
        3. Embed each chunk with FastEmbed (runs locally)
        4. Save everything to the database
        """
        path = Path(path)

        if not path.exists():
            print(f"Error: '{path}' does not exist.")
            return

        print(f"\nIngesting: {path}")
        print("-" * 40)

        # Step 1: Load
        if path.is_dir():
            pages = load_folder(str(path))
        else:
            pages = load_document(str(path))

        if not pages:
            print("No content found to ingest.")
            return

        # Step 2: Chunk
        chunks = chunk_pages(pages, chunk_size=chunk_size, overlap=overlap)
        print_chunk_stats(chunks)

        # Step 3: Embed (FastEmbed — runs locally, free)
        embedded_chunks = self.embedder.embed_chunks(chunks)

        # Step 4: Store
        added = self.store.add_chunks(embedded_chunks)

        print(f"\nIngestion complete. {added} chunks ready for search.")

    def ask(self, question: str, top_k: int = 5, source_filter: str = None) -> dict:
        """
        Answer a question using the loaded documents.

        Steps:
        1. Check that we have documents
        2. Embed the question (FastEmbed — runs locally)
        3. Find the most relevant chunks
        4. Filter out low-relevance chunks
        5. Ask OpenAI to answer using those chunks
        6. Return answer + sources
        """
        if self.store.is_empty():
            print("\nNo documents loaded yet. Use ingest() first.")
            return {"answer": "No documents loaded.", "sources": []}

        # Embed the question (runs locally with FastEmbed)
        query_embedding = self.embedder.embed_single(question)

        # Find relevant chunks
        chunks = self.store.search(
            query_embedding=query_embedding,
            top_k=top_k,
            source_filter=source_filter
        )

        if not chunks:
            return {
                "answer": "No relevant information found.",
                "sources": []
            }

        # Filter out chunks that are not relevant enough
        # A score below 0.4 means the chunk is probably not related to the question
        relevant_chunks = [c for c in chunks if c["score"] >= 0.4]

        if not relevant_chunks:
            return {
                "answer": "I could not find information relevant enough to answer this question.",
                "sources": []
            }

        # Generate answer
        result = self.answerer.answer(question, relevant_chunks, stream=True)

        return result

    def list_documents(self):
        """Show all documents currently loaded in the system."""
        sources = self.store.get_all_sources()

        if not sources:
            print("\nNo documents loaded yet.")
            return

        print(f"\nLoaded Documents ({len(sources)}):")
        for i, source in enumerate(sources, 1):
            print(f"  {i}. {source}")

    def remove_document(self, source_name: str):
        """Remove a document from the system."""
        self.store.delete_source(source_name)

    def stats(self):
        """Show system statistics."""
        sources = self.store.get_all_sources()
        print(f"\nSystem Statistics:")
        print(f"  Total chunks in database: {self.store.total_chunks()}")
        print(f"  Total documents: {len(sources)}")
        print(f"  Embedding model: {self.embedder.model_name}")
        print(f"  Vector dimensions: {self.embedder.dimensions}")


def interactive_mode(system: DocuMind):
    """
    Run DocuMind in interactive mode.
    The user can ask questions one after another.
    """
    print("\n" + "="*50)
    print("Interactive Mode")
    print("="*50)
    print("Commands:")
    print("  Type any question → get answer from your documents")
    print("  'docs'           → list loaded documents")
    print("  'stats'          → show system statistics")
    print("  'quit'           → exit")
    print("-" * 50)

    if system.store.is_empty():
        print("\nWarning: No documents loaded. Load documents first.")
        print("Example: python main.py ingest sample_docs/")
        print()

    while True:
        try:
            user_input = input("\nYou: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\n\nGoodbye!")
            break

        if not user_input:
            continue

        # Handle special commands
        if user_input.lower() in ["quit", "exit", "q"]:
            print("\nGoodbye!")
            break

        elif user_input.lower() == "docs":
            system.list_documents()

        elif user_input.lower() == "stats":
            system.stats()

        else:
            # It is a question — answer it
            print(f"\nSearching {system.store.total_chunks()} chunks...")

            result = system.ask(user_input)

            # Show sources
            if result["sources"]:
                print("\nSources used:")
                for s in result["sources"]:
                    score_bar = "█" * int(s["relevance_score"] * 10)
                    print(f"  → {s['source']}, Page {s['page']} "
                          f"(relevance: {s['relevance_score']:.2f} {score_bar})")


def main():
    """
    Main entry point.

    Usage:
        python main.py ingest path/to/document.pdf
        python main.py ingest path/to/folder/
        python main.py ask "What is the leave policy?"
        python main.py interactive
        python main.py docs
        python main.py stats
    """
    system = DocuMind()

    if len(sys.argv) < 2:
        # No arguments — start interactive mode
        interactive_mode(system)
        return

    command = sys.argv[1].lower()

    if command == "ingest":
        if len(sys.argv) < 3:
            print("Usage: python main.py ingest <file_or_folder_path>")
            return
        system.ingest(sys.argv[2])

    elif command == "ask":
        if len(sys.argv) < 3:
            print("Usage: python main.py ask \"Your question here\"")
            return
        question = " ".join(sys.argv[2:])
        result = system.ask(question)
        if result["sources"]:
            print("\nSources:")
            for s in result["sources"]:
                print(f"  → {s['source']}, Page {s['page']} "
                      f"(score: {s['relevance_score']:.2f})")

    elif command == "interactive":
        interactive_mode(system)

    elif command == "docs":
        system.list_documents()

    elif command == "stats":
        system.stats()

    else:
        print(f"Unknown command: {command}")
        print("Available commands: ingest, ask, interactive, docs, stats")


if __name__ == "__main__":
    main()
```

---

## Step 8 — The API (`api.py`)

A FastAPI backend so any web or mobile app can use DocuMind.

```python
# api.py

from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import shutil
import os
import time
import uvicorn
from dotenv import load_dotenv

from main import DocuMind

load_dotenv()

app = FastAPI(
    title="DocuMind API",
    description="Smart Document Q&A powered by FastEmbed",
    version="1.0.0"
)

# Allow frontend apps to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DocuMind once when the server starts
system = DocuMind()


# ── REQUEST / RESPONSE MODELS ─────────────────────────

class QuestionRequest(BaseModel):
    question: str
    top_k: int = 5
    source_filter: Optional[str] = None

class Source(BaseModel):
    source: str
    page: int
    relevance_score: float

class AnswerResponse(BaseModel):
    question: str
    answer: str
    sources: list[Source]
    latency_ms: float


# ── ENDPOINTS ─────────────────────────────────────────

@app.get("/")
def root():
    return {
        "name": "DocuMind API",
        "status": "running",
        "total_chunks": system.store.total_chunks(),
        "documents": system.store.get_all_sources()
    }


@app.get("/health")
def health():
    """Health check — used by load balancers and monitoring."""
    return {
        "status": "healthy",
        "chunks_loaded": system.store.total_chunks(),
        "documents_loaded": len(system.store.get_all_sources())
    }


@app.post("/ask", response_model=AnswerResponse)
def ask_question(request: QuestionRequest):
    """
    Ask a question. DocuMind searches your documents and returns an answer.

    Example request:
    {
        "question": "What is the return policy?",
        "top_k": 5
    }
    """
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    if system.store.is_empty():
        raise HTTPException(
            status_code=400,
            detail="No documents loaded. Upload documents first using POST /upload"
        )

    start = time.time()

    result = system.ask(
        question=request.question,
        top_k=request.top_k,
        source_filter=request.source_filter
    )

    latency = round((time.time() - start) * 1000, 2)

    return AnswerResponse(
        question=request.question,
        answer=result["answer"],
        sources=[Source(**s) for s in result["sources"]],
        latency_ms=latency
    )


@app.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None
):
    """
    Upload a PDF or text file to ingest into the system.
    Ingestion runs in the background — endpoint returns immediately.
    """
    allowed_extensions = [".pdf", ".txt", ".md"]
    file_ext = os.path.splitext(file.filename)[1].lower()

    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"File type not supported. Allowed: {allowed_extensions}"
        )

    # Save the uploaded file temporarily
    tmp_path = f"/tmp/{file.filename}"
    with open(tmp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Ingest in the background (non-blocking)
    def ingest_task():
        try:
            system.ingest(tmp_path)
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

    background_tasks.add_task(ingest_task)

    return {
        "message": f"'{file.filename}' received and ingestion started.",
        "status": "ingesting",
        "note": "Ask questions after a few seconds — ingestion runs in background."
    }


@app.post("/ingest/text")
def ingest_text(source_name: str, text: str):
    """Ingest plain text directly (no file upload needed)."""
    if not text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    # Write to temp file and ingest
    tmp_path = f"/tmp/{source_name}.txt"
    with open(tmp_path, "w", encoding="utf-8") as f:
        f.write(text)

    try:
        system.ingest(tmp_path)
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

    return {
        "message": f"Text ingested as '{source_name}'",
        "total_chunks": system.store.total_chunks()
    }


@app.get("/documents")
def list_documents():
    """List all documents currently loaded in the system."""
    sources = system.store.get_all_sources()
    return {
        "total_documents": len(sources),
        "documents": sources
    }


@app.delete("/documents/{source_name}")
def delete_document(source_name: str):
    """Remove a document from the system."""
    removed = system.store.delete_source(source_name)
    if removed == 0:
        raise HTTPException(status_code=404, detail=f"Document '{source_name}' not found.")
    return {
        "message": f"Removed '{source_name}' ({removed} chunks deleted)",
        "total_chunks_remaining": system.store.total_chunks()
    }


@app.get("/stats")
def get_stats():
    """Get system statistics."""
    return {
        "total_chunks": system.store.total_chunks(),
        "total_documents": len(system.store.get_all_sources()),
        "embedding_model": system.embedder.model_name,
        "vector_dimensions": system.embedder.dimensions,
        "llm_model": system.answerer.model
    }


if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
```

---

## Step 9 — Sample Document

Create a test document to try the system.

```bash
# Create sample_docs/sample_policy.txt with this content:
```

```
# TechFlow Company Policies

## Leave Policy
Employees are entitled to 18 days of paid leave per year.
Leave must be applied for at least 3 days in advance using the HR portal.
Sick leave is separate — up to 10 days per year with a medical certificate.
Unused leave can be carried forward — maximum 10 days per year.

## Return Policy
Customers can return products within 30 days of purchase.
Electronics have a reduced return window of 15 days only.
Items must be in original condition and original packaging.
To initiate a return, email returns@techflow.com with your order number.
Refunds are processed within 5 to 7 business days after receiving the item.
Damaged or opened items are not eligible for returns.

## Work From Home Policy
Employees may work from home up to 2 days per week.
WFH days must be pre-approved by the direct manager.
Core hours of 10am to 4pm must be maintained on WFH days.
WFH is not permitted on Mondays and Fridays.

## Expense Reimbursement
Business expenses must be submitted within 30 days of being incurred.
Receipts are required for all expenses above Rs 500.
Meals can be claimed up to Rs 800 per day during business travel.
Hotel accommodation is capped at Rs 5000 per night in metro cities.
Reimbursements are processed in the monthly salary cycle.

## Internet and Device Policy
Company laptops must not be used for personal projects.
Installing unauthorized software is not permitted.
All company data must be stored in approved cloud storage only.
Employees are responsible for keeping their devices updated and secure.
```

---

## Step 10 — Run It

### Option A: Command Line

```bash
# Step 1: Ingest your documents
python main.py ingest sample_docs/

# Step 2: Ask a question directly
python main.py ask "What is the leave policy?"

# Step 3: Interactive mode — ask multiple questions
python main.py interactive

# Other commands
python main.py docs    # See loaded documents
python main.py stats   # See system statistics
```

### Option B: API Server

```bash
# Start the API server
python api.py

# Server runs at http://localhost:8000
# API documentation at http://localhost:8000/docs
```

Test the API with curl:

```bash
# Upload a document
curl -X POST "http://localhost:8000/upload" \
  -F "file=@sample_docs/sample_policy.txt"

# Ask a question
curl -X POST "http://localhost:8000/ask" \
  -H "Content-Type: application/json" \
  -d '{"question": "How many leave days do I get per year?"}'

# List documents
curl "http://localhost:8000/documents"

# System stats
curl "http://localhost:8000/stats"
```

---

## What a Session Looks Like

```
==================================================
DocuMind — Smart Document Q&A
==================================================
Loading FastEmbed model: BAAI/bge-small-en-v1.5
Model ready. Each text → 384 numbers.
Database connected. Currently storing 0 chunks.

Ingesting: sample_docs/
  Loaded 4 segments from 'sample_policy.txt'

Chunk Statistics:
  Total chunks: 18
  Average chunk length: 385 chars

Embedding 18 chunks with FastEmbed...
(This runs locally on your machine — no API cost)
  Progress: 18/18 chunks embedded.
  Done. 18 chunks embedded.

Saved 18 chunks to database.
Database now has 18 total chunks.

Ingestion complete. 18 chunks ready for search.

==================================================
Interactive Mode
==================================================
Commands:
  Type any question → get answer from your documents
  'docs'           → list loaded documents
  'stats'          → show system statistics
  'quit'           → exit
--------------------------------------------------

You: How many leave days do employees get?

Searching 18 chunks...

Answer: Employees are entitled to 18 days of paid leave per year,
with sick leave being separate at up to 10 days per year (with a
medical certificate). Unused leave can be carried forward with a
maximum of 10 days per year. (Source: sample_policy.txt, Page 1)

Sources used:
  → sample_policy.txt, Page 1 (relevance: 0.87 ████████)

You: Can I work from home on Fridays?

Searching 18 chunks...

Answer: No. According to the Work From Home Policy in sample_policy.txt,
WFH is not permitted on Mondays and Fridays. WFH days must also be
pre-approved by your direct manager and you can work from home a
maximum of 2 days per week. (Source: sample_policy.txt, Page 2)

Sources used:
  → sample_policy.txt, Page 2 (relevance: 0.82 ████████)

You: quit

Goodbye!
```

---

## What FastEmbed Is Doing Here

Every time something happens with text, FastEmbed is working:

| When | What FastEmbed does |
|---|---|
| During ingestion | Converts each chunk (400 chars of text) into 384 numbers |
| During a question | Converts the question into 384 numbers |
| During search | Chroma compares question's 384 numbers with all chunk 384-number sets |

**The key thing:** FastEmbed runs on your machine. No API call. No cost. No latency from a network round-trip. When you embed 100 chunks, FastEmbed does it all locally in seconds.

---

## Extending the Project

Here are things you can add once the base works:

**1. Add hybrid search (BM25 + semantic)**
Combine keyword search with vector search for better results on exact terms like product codes or names.

**2. Add conversation memory**
Let users ask follow-up questions — "And what about sick leave?" after asking about leave policy.

**3. Add a web UI**
Build a simple HTML/React frontend that calls the API. The `/docs` page at `localhost:8000/docs` already gives you a test interface.

**4. Switch to a better embedding model**
Change `BAAI/bge-small-en-v1.5` to `BAAI/bge-base-en-v1.5` for better quality (uses more memory).

**5. Add multilingual support**
Switch to `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` for Hindi, Tamil, and other languages.

---

## Troubleshooting

**Problem: "No module named fastembed"**
Solution: Make sure your virtual environment is activated and run `pip install fastembed`

**Problem: Model download fails**
Solution: FastEmbed downloads from HuggingFace. Make sure you have internet access the first time.

**Problem: Chroma database locked error**
Solution: Only one process can use the database at a time. Stop the running server before starting another.

**Problem: Answers are wrong or irrelevant**
Solution: Try smaller chunk sizes (300 instead of 400) or increase top_k (from 5 to 8).

**Problem: OpenAI API key error**
Solution: Check your `.env` file has `OPENAI_API_KEY=sk-your-key-here` with no spaces around the `=`.

---

*End of DocuMind Project*
