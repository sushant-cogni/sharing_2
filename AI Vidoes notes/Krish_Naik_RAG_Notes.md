# 🔍 RAG (Retrieval Augmented Generation) — Complete Notes + All Code
> Krish Naik's RAG Crash Course — Every concept, every step, every line of code, nothing skipped.

---

## 📌 Table of Contents
1. [What is RAG? — Definition](#1-what-is-rag--definition)
2. [Two Major Problems RAG Solves](#2-two-major-problems-rag-solves)
3. [The Full RAG Architecture — Two Pipelines](#3-the-full-rag-architecture--two-pipelines)
4. [Project Setup — Folder + Dependencies](#4-project-setup--folder--dependencies)
5. [Document Structure in LangChain](#5-document-structure-in-langchain)
6. [Text Loader — Reading .txt Files](#6-text-loader--reading-txt-files)
7. [Directory Loader — Reading All Files in a Folder](#7-directory-loader--reading-all-files-in-a-folder)
8. [PDF Loader — PyMuPDF (Recommended)](#8-pdf-loader--pymupdf-recommended)
9. [process_all_pdfs() — Full PDF Loading Function](#9-process_all_pdfs--full-pdf-loading-function)
10. [Chunking — RecursiveCharacterTextSplitter](#10-chunking--recursivecharactertextsplitter)
11. [EmbeddingManager Class — Text to Vectors](#11-embeddingmanager-class--text-to-vectors)
12. [VectorStoreManager Class — ChromaDB](#12-vectorstoremanager-class--chromadb)
13. [Complete Data Injection Pipeline — All Steps Together](#13-complete-data-injection-pipeline--all-steps-together)
14. [RAGRetriever Class — Query the Vector Store](#14-ragretriever-class--query-the-vector-store)
15. [Setup LLM — Groq](#15-setup-llm--groq)
16. [rag_simple() — Basic RAG Pipeline](#16-rag_simple--basic-rag-pipeline)
17. [rag_advanced() — Enhanced RAG Pipeline](#17-rag_advanced--enhanced-rag-pipeline)
18. [Modular Code Structure — src/ Folder](#18-modular-code-structure--src-folder)
19. [src/data_loader.py — Full Code](#19-srcdataloaderpy--full-code)
20. [src/embedding.py — Full Code](#20-srcembeddingpy--full-code)
21. [src/vector_store.py (FAISS) — Full Code](#21-srcvector_storepy-faiss--full-code)
22. [src/search.py — Full Code](#22-srcsearchpy--full-code)
23. [app.py — Main Entry Point](#23-apppy--main-entry-point)
24. [Complete Summary — RAG in One Flow](#24-complete-summary--rag-in-one-flow)

---

## 1. What is RAG? — Definition

> **RAG (Retrieval Augmented Generation)** is the process of optimizing the output of a Large Language Model so that it **references an authoritative knowledge base outside of its training data** before generating a response.

Breaking the definition down:
- LLMs are trained on vast volumes of data and use billions of parameters to generate output for tasks like question answering, translation, and completing sentences.
- RAG **extends** the already powerful capabilities of an LLM to a **specific domain** or an **organizational internal knowledge base** — all **without the need to retrain the model**.
- It is a **cost-effective** approach to improve LLM output so that it is relevant, accurate, and useful in various contexts.

**Full Form:**
```
R = Retrieval   → Retrieve relevant context from a knowledge base
A = Augmented   → Augment (enrich) the LLM prompt with that context
G = Generation  → Generate the final answer using the LLM
```

---

## 2. Two Major Problems RAG Solves

### Standard Generative AI Flow (No RAG)

```
User Query → [Prompt] → [LLM] → Output
```

The LLM has been trained on billions of data points. Give it a query, get an answer. Simple — but with two big problems.

---

### Problem 1 — Hallucination (Outdated Knowledge)

**Scenario:**
- Today is **31st August**
- Your LLM (say, GPT-5) was trained on data **only till 1st August**
- You ask about an event that happened between **1st – 31st August**

**What happens?**
The LLM has **no knowledge** of those 30 days. But it **does not want to look like a fool**, so it generates a confident-sounding but **completely made-up answer**. This is called **hallucination**.

> 💡 Hallucination = LLM generating wrong answers confidently because it doesn't have the actual knowledge.

---

### Problem 2 — Private/Internal Data Not Available

**Scenario:**
- You are running a **startup**
- You have private internal data: **HR policies, finance policies, internal documents**
- This data is **not on the internet** → not in the LLM's training data
- You want to build a **chatbot** that answers questions about your company's data

**Option 1: Fine-tune the model**
- Possible, but **very expensive** and **very tedious**
- LLMs have billions of parameters — tweaking them takes a lot of time and money
- Your policies keep updating → you **cannot fine-tune every day**

**Option 2: RAG ← Correct approach**
- No fine-tuning needed
- Just inject your private data into a **vector database**
- LLM retrieves relevant chunks from it at query time

---

## 3. The Full RAG Architecture — Two Pipelines

```
┌──────────────────────────────────────────────────────────────────────┐
│                       DATA INJECTION PIPELINE                         │
│                                                                        │
│  [Your Data]  →  [Parse into Document]  →  [Chunk]  →  [Embed]  →  [Vector DB]
│  (PDF / HTML /                                                         │
│   Excel / SQL /                                                        │
│   CSV / TXT)                                                           │
└──────────────────────────────────────────────────────────────────────┘
                                 ↓
                         [Vector Database]
                                 ↓
┌──────────────────────────────────────────────────────────────────────┐
│                      QUERY RETRIEVAL PIPELINE                         │
│                                                                        │
│  [User Query]  →  [Apply Same Embedding]  →  [Hit Vector DB]          │
│                                                    ↓                  │
│                                           [Get Context]               │
│                                                    ↓                  │
│                              [Context + Prompt]  →  [LLM]             │
│                                 (Augmentation)          ↓             │
│                                                     [Output]          │
│                                                   (Generation)        │
└──────────────────────────────────────────────────────────────────────┘
```

### Data Injection Pipeline — Step by Step

1. **Data Injection** — Read files of any format (PDF, HTML, Excel, SQL, CSV, TXT)
2. **Data Parsing** — Parse content and convert into **Document structure** (most critical step)
3. **Chunking** — Split documents into smaller pieces (reason: every LLM/embedding model has a fixed context size — you can't pass a 100-page PDF directly)
4. **Embedding** — Convert each chunk's text into a vector (numerical representation)
5. **Vector Store** — Save all vectors into a vector DB (ChromaDB, FAISS, Pinecone, etc.)

### Query Retrieval Pipeline — Step by Step

1. **User Query** — User asks a question
2. **Convert Query to Vector** — Apply **same embedding model** used during injection
3. **Similarity Search** — Hit vector DB, compare query vector against stored vectors
4. **Get Context** — Retrieve top-K most similar chunks
5. **Augmentation** — Combine context + prompt → send to LLM
6. **Generation** — LLM generates final, accurate answer

> 💡 **Real-world example:** Perplexity.ai is a RAG application. It connects to web search (retriever), summarizes results using LLM, and gives you cited answers.

> 💡 **90% of use cases** currently being worked on in all companies are specifically related to RAG.

---

## 4. Project Setup — Folder + Dependencies

### Folder Structure

```
yt-rag/
├── data/
│   ├── text_files/
│   │   ├── python_intro.txt
│   │   └── machine_learning.txt
│   └── PDF/
│       ├── attention.pdf       (15 pages)
│       ├── embeddings.pdf      (27 pages)
│       ├── object_detection.pdf(21 pages)
│       └── proposal.pdf        (1 page)
├── notebook/
│   ├── document_structure.ipynb
│   └── pdf_loader.ipynb
├── src/
│   ├── __init__.py
│   ├── data_loader.py
│   ├── embedding.py
│   ├── vector_store.py
│   └── search.py
├── app.py
├── requirements.txt
└── .env
```

### requirements.txt

```
langchain
langchain-core
langchain-community
langchain-groq
pypdf
pymupdf
sentence-transformers
chromadb
faiss-cpu
python-dotenv
ipykernel
numpy
scikit-learn
```

### Setup Commands (using uv)

```bash
# Step 1: Initialize project workspace
uv init yt-rag
cd yt-rag

# Step 2: Create virtual environment with Python 3.13.2
uv venv --python 3.13.2

# Step 3: Activate environment
source .venv/bin/activate       # Linux / Mac
.venv\Scripts\activate          # Windows

# Step 4: Install all dependencies from requirements.txt
uv add -r requirements.txt

# Step 5: Install PDF reading libraries
uv add pypdf pymupdf

# Step 6: Add Jupyter kernel (for notebooks)
uv add ipykernel
```

---

## 5. Document Structure in LangChain

### What is a Document?

A **Document** is a special LangChain data structure that stores:
1. **`page_content`** — the actual text content of the file
2. **`metadata`** — additional information about the file (source name, page number, author, date, etc.)

> 💡 Every LangChain loader (PDF, CSV, TXT, Web) outputs data in this exact Document structure. This is the standard interface for the entire RAG pipeline.

### Why is Document Structure Critical?

- After chunking, every chunk is a Document
- Embedding is applied on `page_content`
- When storing in Vector DB, `metadata` is saved alongside the vector
- During retrieval, you can **filter by metadata** — e.g., "search only documents by author: Krish Naik" or "search only from page 3 onwards"

### Two Core Components

```
Document
├── page_content → "The actual text content from the file..."
└── metadata     → {
                      "source": "example.txt",
                      "num_pages": 1,
                      "author": "Krish Nayak",
                      "date_created": "2025-01-01"
                   }
```

### Code — Create a Document Manually

```python
from langchain_core.documents import Document

# Create a document manually
doc = Document(
    page_content="This is the main text content I am using to create rag",
    metadata={
        "source": "example.txt",
        "num_pages": 1,
        "author": "Krish Nayak",
        "date_created": "2025-01-01"
    }
)

# Print the document
print(doc)
# Output:
# page_content='This is the main text content I am using to create rag'
# metadata={'source': 'example.txt', 'num_pages': 1, 'author': 'Krish Nayak', 'date_created': '2025-01-01'}

# Access individual parts
print(doc.page_content)
# → This is the main text content I am using to create rag

print(doc.metadata)
# → {'source': 'example.txt', 'num_pages': 1, 'author': 'Krish Nayak', 'date_created': '2025-01-01'}
```

---

## 6. Text Loader — Reading .txt Files

### Create Sample Text Files First

```python
import os

# Create the directory (exist_ok=True means don't throw error if already exists)
os.makedirs("../data/text_files", exist_ok=True)

# Sample content for each file
sample_text = {
    "python_intro.txt": "Python is a high-level programming language known for its simplicity and versatility...",
    "machine_learning.txt": "Machine learning is a subset of AI that enables computers to learn from data without being explicitly programmed..."
}

# Write files to disk
for file_name, content in sample_text.items():
    file_path = f"../data/text_files/{file_name}"
    with open(file_path, 'w') as f:
        f.write(content)
```

### Read with TextLoader

```python
# Both import paths work — use whichever doesn't give a deprecation warning
from langchain.document_loaders import TextLoader
# OR
from langchain_community.document_loaders import TextLoader

# Initialize loader
loader = TextLoader(
    "../data/text_files/python_intro.txt",
    encoding="utf-8"
)

# Load the document
document = loader.load()

# Print result
print(document)
# → [Document(page_content='Python is a high-level...', metadata={'source': '../data/text_files/python_intro.txt'})]

# Check type of the first element
print(type(document[0]))
# → <class 'langchain_core.documents.base.Document'>
```

> ✅ Notice: TextLoader automatically gives output in **Document structure** with `page_content` and `metadata`. The `source` key in metadata is set automatically to the file path.

---

## 7. Directory Loader — Reading All Files in a Folder

```python
from langchain_community.document_loaders import DirectoryLoader, TextLoader

# Load all .txt files from a folder
directory_loader = DirectoryLoader(
    path="../data/text_files",    # folder path
    glob="*.txt",                  # pattern to match files (*.txt = all txt files)
    loader_cls=TextLoader,         # which loader class to use per file
    loader_kwargs={"encoding": "utf-8"},
    show_progress=False            # set True to see progress bar (needs tqdm installed)
)

# Load all matching files
documents = directory_loader.load()

print(documents)
# → Returns a list with 2 Document objects (one per .txt file)
# → [Document(...python_intro...), Document(...machine_learning...)]
```

> 💡 If you get an error about `tqdm`, either `pip install tqdm` or set `show_progress=False`.

---

## 8. PDF Loader — PyMuPDF (Recommended)

LangChain provides two PDF loaders:
- `PyPDFLoader` — basic, less metadata
- `PyMuPDFLoader` — **better**, extracts richer metadata automatically

```python
from langchain_community.document_loaders import DirectoryLoader, PyMuPDFLoader

# Load all PDFs from directory
pdf_loader = DirectoryLoader(
    path="../data/PDF",
    glob="*.pdf",
    loader_cls=PyMuPDFLoader,
    show_progress=False
)

# Load all PDF files
pdf_documents = pdf_loader.load()

# Print first document
print(pdf_documents[0])
# → page_content='...' 
# → metadata={
#     'source': '../data/PDF/attention.pdf',
#     'file_path': '../data/PDF/attention.pdf',
#     'page': 0,
#     'total_pages': 15,
#     'format': 'PDF 1.4',
#     'author': '...',
#     'creation_date': '...',
#     'modification_date': '...'
#    }

# Confirm Document type
print(type(pdf_documents[0]))
# → <class 'langchain_core.documents.base.Document'>
```

> ✅ PyMuPDFLoader automatically fills metadata with: `source`, `file_path`, `page`, `total_pages`, `format`, `author`, `creation_date`, `modification_date` — no manual work needed!

---

## 9. process_all_pdfs() — Full PDF Loading Function

This function reads all PDFs from a directory, adds custom metadata, and returns a list of Documents.

```python
from pathlib import Path
from langchain_community.document_loaders import PyMuPDFLoader

def process_all_pdfs(pdf_directory: str):
    """
    Read all PDFs from a directory.
    Adds custom metadata: source_file, file_type.
    Returns list of LangChain Document objects.
    """
    pdf_dir_path = Path(pdf_directory)
    
    # Find all PDF files recursively (** = search subdirectories too)
    pdf_files = list(pdf_dir_path.glob("**/*.pdf"))
    print(f"Found {len(pdf_files)} PDF files")
    
    all_documents = []
    
    for pdf_file in pdf_files:
        print(f"Processing: {pdf_file.name}")
        
        # Load PDF using PyMuPDF
        loader = PyMuPDFLoader(str(pdf_file))
        documents = loader.load()
        
        # Add custom metadata to every page/document
        for doc in documents:
            doc.metadata["source_file"] = pdf_file.name
            doc.metadata["file_type"] = "PDF"
        
        # Extend master list with this PDF's documents
        all_documents.extend(documents)
    
    return all_documents

# Call the function
all_pdf_docs = process_all_pdfs("../data/PDF")

# Output:
# Found 4 PDF files
# Processing: attention.pdf       → 15 pages
# Processing: embeddings.pdf      → 27 pages
# Processing: object_detection.pdf→ 21 pages
# Processing: proposal.pdf        → 1 page

print(f"Total pages loaded: {len(all_pdf_docs)}")
# → Total pages loaded: 64

# Inspect a document
print(all_pdf_docs[0])
# → page_content='...'
# → metadata={'source': '...', 'page': 0, 'total_pages': 15,
#              'author': '...', 'source_file': 'attention.pdf', 'file_type': 'PDF'}
```

---

## 10. Chunking — RecursiveCharacterTextSplitter

### Why Chunk?

Every embedding model and LLM has a **fixed context size**. If you pass a 100-page PDF directly to an embedding model it will reject it (too many tokens). So we split into smaller pieces that fit within the context window.

**Chunk overlap:** When you split text, sentences can get cut mid-way. Overlap ensures some text from the end of chunk N is also at the start of chunk N+1 — so no meaning is lost at boundaries.

### Code

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

def split_documents(documents, chunk_size=1000, chunk_overlap=200):
    """
    Split a list of Documents into smaller chunks.
    
    chunk_size    = max characters per chunk (default 1000)
    chunk_overlap = chars shared between adjacent chunks (default 200)
    separators    = tried in order: space → newline → double-newline
                    (double newline = paragraph separator)
    """
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=[" ", "\n", "\n\n"]
        # Note: "\n\n" is a double newline = paragraph break
        # The splitter tries these from LEFT to RIGHT until chunks are small enough
    )
    
    chunks = text_splitter.split_documents(documents)
    
    print(f"Split {len(documents)} documents into {len(chunks)} chunks")
    
    # Preview first few chunks
    for i, chunk in enumerate(chunks[:3]):
        print(f"\nChunk {i+1}:")
        print(f"  Content: {chunk.page_content[:200]}")
        print(f"  Metadata: {chunk.metadata}")
    
    return chunks

# Apply chunking
chunks = split_documents(all_pdf_docs, chunk_size=1000, chunk_overlap=200)
# → Split 64 documents into 359 chunks
```

> 💡 **Krish's Question to Answer:** What separator is `"\n\n"`? It is a **double newline** — which represents a **paragraph break**. This is one of the separators used in `RecursiveCharacterTextSplitter`.

---

## 11. EmbeddingManager Class — Text to Vectors

### Required Imports

```python
import numpy as np
from sentence_transformers import SentenceTransformer
import chromadb
import uuid
from typing import List, Dict, Any
from sklearn.metrics.pairwise import cosine_similarity
```

### What is Embedding?

Embedding = converting text into a numerical vector that captures **semantic meaning**. Similar meanings → vectors are close. Different meanings → vectors are far apart. This enables **similarity search**.

### Embedding Options

| Model | Provider | Dimensions | Cost |
|---|---|---|---|
| `all-MiniLM-L6-v2` | HuggingFace | 384 | Free / Open Source |
| `text-embedding-3-small` | OpenAI | 1536 | Paid |
| `text-embedding-3-large` | OpenAI | 3072 | Paid |
| Gemini embedding models | Google | varies | Paid |

### EmbeddingManager Class

```python
class EmbeddingManager:
    """Handles document embedding generation using sentence-transformers."""
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """
        Initialize the EmbeddingManager.
        
        Args:
            model_name: HuggingFace model name.
                        'all-MiniLM-L6-v2' produces 384-dimensional vectors.
        """
        self.model_name = model_name
        self.model = None        # model starts as None
        self._load_model()       # immediately load the model
    
    def _load_model(self):
        """
        Protected function to load the sentence transformer model.
        
        Underscore prefix (_) = protected method.
        Only accessible within this class.
        """
        self.model = SentenceTransformer(self.model_name)
        embedding_dim = self.model.get_sentence_embedding_dimension()
        print(f"Model '{self.model_name}' loaded successfully")
        print(f"Embedding dimension: {embedding_dim}")
        # → Embedding dimension: 384
    
    def generate_embeddings(self, texts: List[str]) -> np.ndarray:
        """
        Generate embeddings for a list of text strings.
        
        Args:
            texts: List of strings to embed
            
        Returns:
            numpy array of shape (len(texts), 384)
        """
        embeddings = self.model.encode(texts, show_progress_bar=True)
        return embeddings

# Initialize the embedding manager
embedding_manager = EmbeddingManager()
# → Model 'all-MiniLM-L6-v2' loaded successfully
# → Embedding dimension: 384

# Test it
test_texts = ["Hello world", "Machine learning is amazing"]
test_embeddings = embedding_manager.generate_embeddings(test_texts)
print(test_embeddings.shape)
# → (2, 384)
```

---

## 12. VectorStoreManager Class — ChromaDB

### What is a Vector Store?

A **vector database** stores text alongside its embedding vector. Key capabilities:
- **Similarity search** — find documents closest to a query vector
- **Persistent storage** — save to disk so you don't rebuild every run
- **Metadata filtering** — search only within specific authors, pages, dates, etc.

### Available Vector Stores

| Tool | Type | Notes |
|---|---|---|
| ChromaDB | Open source | Easy local setup, persistent |
| FAISS | Open source (Meta) | Very fast, great for CPU |
| Pinecone | Cloud / Paid | Production scale |
| Weaviate | Open source | Production ready |
| Qdrant | Open source | Fast and scalable |

### VectorStoreManager Class (ChromaDB)

```python
class VectorStoreManager:
    """Manages ChromaDB vector store for document storage and retrieval."""
    
    def __init__(
        self,
        collection_name: str = "pdf_documents",
        persistent_directory: str = "./data/vector_store"
    ):
        """
        Args:
            collection_name:       Name of the ChromaDB collection
            persistent_directory:  Local directory to persist the vector store on disk
        """
        self.collection_name = collection_name
        self.persistent_directory = persistent_directory
        self.client = None        # ChromaDB client
        self.collection = None    # collection inside the client
        self._initialize_store()  # run initialization immediately
    
    def _initialize_store(self):
        """Initialize ChromaDB client and create/get collection."""
        import os
        
        # Create directory if it doesn't exist
        os.makedirs(self.persistent_directory, exist_ok=True)
        
        # PersistentClient = saves everything to disk at given path
        self.client = chromadb.PersistentClient(
            path=self.persistent_directory
        )
        
        # get_or_create_collection: if collection exists, load it; else create new
        self.collection = self.client.get_or_create_collection(
            name=self.collection_name,
            metadata={"description": "RAG document collection"}
        )
        
        print(f"Collection: {self.collection_name}")
        print(f"Existing documents in collection: {self.collection.count()}")
    
    def add_documents(self, documents: List, embeddings: np.ndarray):
        """
        Add documents and their embeddings to the vector store.
        
        Args:
            documents:   List of LangChain Document objects (the chunks)
            embeddings:  numpy array of shape (num_docs, 384)
        """
        if len(documents) != len(embeddings):
            raise ValueError("Number of documents must equal number of embeddings")
        
        # Prepare data in the format ChromaDB expects
        ids = []
        embedding_list = []
        metadata_list = []
        document_texts = []
        
        for doc, embedding in zip(documents, embeddings):
            # Generate unique ID for each record
            doc_id = str(uuid.uuid4())
            ids.append(doc_id)
            
            # Copy existing metadata and add extra info
            metadata = doc.metadata.copy()
            metadata["content_length"] = len(doc.page_content)
            metadata_list.append(metadata)
            
            # Get the actual text
            document_texts.append(doc.page_content)
            
            # ChromaDB requires list format (not numpy array)
            embedding_list.append(embedding.tolist())
        
        # Add everything to the ChromaDB collection
        self.collection.add(
            ids=ids,
            embeddings=embedding_list,
            metadatas=metadata_list,
            documents=document_texts
        )
        
        print(f"Total documents in collection: {self.collection.count()}")

# Initialize vector store
vector_store = VectorStoreManager(
    collection_name="pdf_documents",
    persistent_directory="./data/vector_store"
)
# → Collection: pdf_documents
# → Existing documents in collection: 0
```

---

## 13. Complete Data Injection Pipeline — All Steps Together

```python
# ─────────────────────────────────────────────────────────────────────
# STEP 1: Load all PDF documents from directory
# ─────────────────────────────────────────────────────────────────────
all_pdf_docs = process_all_pdfs("../data/PDF")
print(f"Loaded {len(all_pdf_docs)} pages")
# → Found 4 PDF files → Loaded 64 pages

# ─────────────────────────────────────────────────────────────────────
# STEP 2: Split all documents into chunks
# ─────────────────────────────────────────────────────────────────────
chunks = split_documents(all_pdf_docs, chunk_size=1000, chunk_overlap=200)
print(f"Created {len(chunks)} chunks")
# → Split 64 documents into 359 chunks

# ─────────────────────────────────────────────────────────────────────
# STEP 3: Extract text content from each chunk (as a list of strings)
# ─────────────────────────────────────────────────────────────────────
texts = [doc.page_content for doc in chunks]

# ─────────────────────────────────────────────────────────────────────
# STEP 4: Generate embeddings for all chunks
# ─────────────────────────────────────────────────────────────────────
embeddings = embedding_manager.generate_embeddings(texts)
print(f"Embeddings shape: {embeddings.shape}")
# → (359, 384)  ← 359 chunks, each with 384-dimensional vector

# ─────────────────────────────────────────────────────────────────────
# STEP 5: Store everything in Vector DB (persistent on disk)
# ─────────────────────────────────────────────────────────────────────
vector_store.add_documents(chunks, embeddings)
# → Total documents in collection: 359

print("✅ Data Injection Pipeline Complete!")
```

After this runs once, everything is saved in `./data/vector_store/` on disk. You can reload it anytime without re-running the entire pipeline.

---

## 14. RAGRetriever Class — Query the Vector Store

### How Retrieval Works

```
User Query (plain text)
        ↓
Apply SAME embedding model → Query Vector (shape: 1 × 384)
        ↓
Hit Vector DB with query vector
        ↓
Similarity search (compare query vector against all stored vectors)
        ↓
Return Top-K most similar chunks as CONTEXT
```

> ⚠️ **Critical:** You **must use the same embedding model** for both data injection AND query retrieval. If you used `all-MiniLM-L6-v2` to embed documents, you must use the same model to embed the query. Different models = different vector spaces = similarity search won't work.

### RAGRetriever Class

```python
class RAGRetriever:
    """Handles query-based retrieval from the vector store."""
    
    def __init__(self, vector_store: VectorStoreManager, embedding_manager: EmbeddingManager):
        """
        Args:
            vector_store:       Initialized VectorStoreManager
            embedding_manager:  Initialized EmbeddingManager (SAME model used for injection!)
        """
        self.vector_store = vector_store
        self.embedding_manager = embedding_manager
    
    def retrieve(
        self,
        query: str,
        top_k: int = 5,
        threshold: float = 0.0
    ) -> List[Dict]:
        """
        Retrieve relevant documents for a given query.
        
        Args:
            query:     User's search query (plain text string)
            top_k:     Number of top results to return
            threshold: Minimum similarity score to include (0.0 = include all)
            
        Returns:
            List of dicts: each has 'id', 'content', 'metadata', 'similarity_score'
        """
        # STEP 1: Convert query text → vector (same embedding model used during injection)
        query_embedding = self.embedding_manager.generate_embeddings([query])
        print(f"Query embedding shape: {query_embedding.shape}")
        # → (1, 384)
        
        # STEP 2: Query the ChromaDB vector store
        results = self.vector_store.collection.query(
            query_embeddings=query_embedding.tolist(),   # ChromaDB needs list, not numpy
            n_results=top_k,
            include=["documents", "metadatas", "distances", "ids"]
        )
        
        # STEP 3: Process results and calculate similarity scores
        retrieve_docs = []
        
        for doc_id, document, metadata, distance in zip(
            results["ids"][0],
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0]
        ):
            # ChromaDB returns L2 distance (lower = more similar)
            # Convert to similarity: 1 - distance (higher = more similar)
            similarity_score = 1 - distance
            
            # Only include if above threshold
            if similarity_score >= threshold:
                retrieve_docs.append({
                    "id": doc_id,
                    "content": document,
                    "metadata": metadata,
                    "similarity_score": similarity_score
                })
        
        return retrieve_docs

# Initialize the retriever
rag_retriever = RAGRetriever(
    vector_store=vector_store,
    embedding_manager=embedding_manager
)

# Test retrieval
results = rag_retriever.retrieve("What is attention is all you need?", top_k=3)

# Display results
for i, result in enumerate(results):
    print(f"\n--- Result {i+1} ---")
    print(f"Content: {result['content'][:200]}...")
    print(f"Source: {result['metadata'].get('source_file', 'unknown')}")
    print(f"Similarity Score: {result['similarity_score']:.3f}")

# Example output:
# --- Result 1 ---
# Content: The attention function can be described as mapping a query and a set of key-value pairs...
# Source: attention.pdf
# Similarity Score: 0.847
```

---

## 15. Setup LLM — Groq

```python
# requirements: langchain-groq, python-dotenv
from langchain_groq import ChatGroq
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# .env file should contain:
# GROQ_API_KEY=your_groq_api_key_here

# Initialize Groq LLM
llm = ChatGroq(
    groq_api_key=os.getenv("GROQ_API_KEY"),
    model_name="gemma2-9b-it",   # Groq's fast inference model
    temperature=0.1,              # low = more factual, deterministic
    max_tokens=1024               # maximum number of tokens to generate
)

print("LLM initialized!")
```

> 💡 Groq is used because it offers **free tier** access with very fast inference. You can substitute any LLM (OpenAI, Claude, Gemini) with the same pattern.

---

## 16. rag_simple() — Basic RAG Pipeline

```python
def rag_simple(
    query: str,
    retriever: RAGRetriever,
    llm,
    top_k: int = 3
) -> str:
    """
    Simple RAG: retrieve context → build prompt → generate answer.
    
    Args:
        query:     User's question
        retriever: Initialized RAGRetriever
        llm:       Initialized LLM (Groq, OpenAI, etc.)
        top_k:     Number of context chunks to retrieve
        
    Returns:
        LLM-generated answer as string
    """
    # STEP 1: RETRIEVAL — get top-k relevant chunks from vector DB
    results = retriever.retrieve(query, top_k=top_k)
    
    # STEP 2: Combine all retrieved chunks into one context string
    if results:
        context = "\n\n".join([doc["content"] for doc in results])
    else:
        context = ""
    
    # STEP 3: Handle case where no relevant context was found
    if not context:
        return "No relevant context found to answer the question."
    
    # STEP 4: AUGMENTATION — build a prompt with context + query
    prompt = f"""Use the following context to answer the question concisely.

Context:
{context}

Question: {query}

Answer:"""
    
    # STEP 5: GENERATION — call LLM with the augmented prompt
    response = llm.invoke(prompt.format(context=context, query=query))
    
    return response.content

# Test the simple RAG pipeline
answer = rag_simple(
    query="What is attention mechanism?",
    retriever=rag_retriever,
    llm=llm,
    top_k=3
)
print(answer)
# → "Attention mechanism is a function that maps a query and a set of key-value pairs..."
```

---

## 17. rag_advanced() — Enhanced RAG Pipeline

This enhanced version returns:
- The **answer** from LLM
- The **sources** (which files/pages were used)
- A **confidence score** (average similarity of retrieved chunks)
- Optionally, the full **context** that was given to LLM

```python
def rag_advanced(
    query: str,
    retriever: RAGRetriever,
    llm,
    top_k: int = 5,
    minimum_score: float = 0.3,
    return_context: bool = False
) -> Dict:
    """
    Enhanced RAG pipeline: retrieve → augment → generate → return with sources + confidence.
    
    Args:
        query:          User's question
        retriever:      Initialized RAGRetriever
        llm:            Initialized LLM
        top_k:          Number of chunks to retrieve
        minimum_score:  Minimum similarity score threshold
        return_context: Whether to include full context in return dict
        
    Returns:
        Dict with keys: 'answer', 'sources', 'confidence', 'context' (optional)
    """
    # STEP 1: Retrieve relevant chunks
    results = retriever.retrieve(query, top_k=top_k)
    
    # Handle empty results
    if not results:
        return {
            "answer": "No relevant context found to answer the question.",
            "sources": [],
            "confidence": 0.0,
            "context": ""
        }
    
    # STEP 2: Build context string + collect source information
    context_parts = []
    sources = []
    
    for doc in results:
        # Only use first 300 chars of each chunk for context preview
        context_parts.append(doc["content"][:300])
        
        # Collect source details
        sources.append({
            "source_file":    doc["metadata"].get("source_file", "unknown"),
            "page_number":    doc["metadata"].get("page", "N/A"),
            "similarity_score": round(doc["similarity_score"], 3),
            "content_preview": doc["content"][:200]
        })
    
    context = "\n\n".join(context_parts)
    
    # STEP 3: Calculate confidence (average similarity score of all results)
    confidence = sum(doc["similarity_score"] for doc in results) / len(results)
    
    # STEP 4: Build enhanced prompt
    prompt = f"""You are a helpful AI assistant. Use ONLY the provided context to answer the question.
If the answer cannot be found in the context, say "I don't have enough information to answer this."

Context:
{context}

Question: {query}

Provide a clear, concise answer based on the context above:"""
    
    # STEP 5: Generate answer
    response = llm.invoke(prompt)
    
    # Build result dict
    result = {
        "answer": response.content,
        "sources": sources,
        "confidence": round(confidence, 3)
    }
    
    if return_context:
        result["context"] = context
    
    return result

# Test enhanced RAG — Question 1
result = rag_advanced(
    query="What is attention mechanism?",
    retriever=rag_retriever,
    llm=llm,
    top_k=5,
    minimum_score=0.3,
    return_context=True
)

print("ANSWER:")
print(result["answer"])

print("\nSOURCES:")
for i, source in enumerate(result["sources"]):
    print(f"  [{i+1}] {source['source_file']} — Page {source['page_number']}")
    print(f"       Score: {source['similarity_score']}")
    print(f"       Preview: {source['content_preview'][:100]}...")

print(f"\nCONFIDENCE: {result['confidence']}")

# Test enhanced RAG — Question 2
result2 = rag_advanced(
    query="What is hard negative mining techniques?",
    retriever=rag_retriever,
    llm=llm,
    top_k=5,
    minimum_score=0.3,
    return_context=False
)

print(result2["answer"])
# → Answer about hard negative mining from embeddings.pdf
# Sources point to: embedding.pdf, page 4
```

---

## 18. Modular Code Structure — src/ Folder

Now we refactor everything into a clean, reusable, production-ready structure.

```
src/
├── __init__.py        ← empty file (marks src as a Python package)
├── data_loader.py     ← load documents from disk
├── embedding.py       ← chunk documents + generate embeddings
├── vector_store.py    ← FAISS-based vector DB (save/load/query)
└── search.py          ← combine vector store + LLM for final answer
```

Each file handles exactly one responsibility. The pipeline in `app.py` calls them in order.

---

## 19. src/data_loader.py — Full Code

```python
# src/data_loader.py

from pathlib import Path
from typing import List
from langchain_community.document_loaders import PyMuPDFLoader

def load_all_documents(data_directory: str) -> List:
    """
    Loads all supported files from the data directory.
    Converts every file into LangChain Document data structure.
    
    Currently supports: PDF, TXT
    Assignment: Add CSV, SQL, JSON loaders
    
    Args:
        data_directory: Path to the folder containing data files
        
    Returns:
        List of LangChain Document objects
    """
    data_path = Path(data_directory)
    documents = []
    
    # ─── LOAD PDF FILES ───────────────────────────────────────────────
    pdf_files = list(data_path.glob("**/*.pdf"))
    print(f"Found {len(pdf_files)} PDF files")
    
    for pdf in pdf_files:
        loader = PyMuPDFLoader(str(pdf))
        docs = loader.load()
        
        # Add custom metadata to each page
        for doc in docs:
            doc.metadata["source_file"] = pdf.name
            doc.metadata["file_type"] = "PDF"
        
        documents.extend(docs)
    
    # ─── LOAD TXT FILES ───────────────────────────────────────────────
    txt_files = list(data_path.glob("**/*.txt"))
    print(f"Found {len(txt_files)} TXT files")
    
    from langchain_community.document_loaders import TextLoader
    for txt in txt_files:
        try:
            loader = TextLoader(str(txt), encoding="utf-8")
            docs = loader.load()
            
            for doc in docs:
                doc.metadata["source_file"] = txt.name
                doc.metadata["file_type"] = "TXT"
            
            documents.extend(docs)
        except Exception as e:
            print(f"Error loading {txt.name}: {e}")
    
    # ─── ASSIGNMENT: Add CSV loader ───────────────────────────────────
    # csv_files = list(data_path.glob("**/*.csv"))
    # from langchain_community.document_loaders import CSVLoader
    # for csv_file in csv_files:
    #     loader = CSVLoader(str(csv_file))
    #     docs = loader.load()
    #     documents.extend(docs)
    
    # ─── ASSIGNMENT: Add any other loader from LangChain docs ─────────
    # e.g., WebBaseLoader, S3FileLoader, JSONLoader, etc.
    
    print(f"Total documents loaded: {len(documents)}")
    return documents
```

---

## 20. src/embedding.py — Full Code

```python
# src/embedding.py

import numpy as np
from sentence_transformers import SentenceTransformer
from langchain.text_splitter import RecursiveCharacterTextSplitter
from typing import List

class EmbeddingPipeline:
    """
    Handles two tasks:
    1. chunk_documents() — splits documents into smaller chunks
    2. embed_chunks()    — converts chunk text into vectors
    """
    
    def __init__(
        self,
        model_name: str = "all-MiniLM-L6-v2",
        chunk_size: int = 1000,
        chunk_overlap: int = 200
    ):
        """
        Args:
            model_name:     HuggingFace sentence-transformers model name
            chunk_size:     Max characters per chunk
            chunk_overlap:  Overlapping characters between adjacent chunks
        """
        self.model_name = model_name
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        
        print(f"Loading embedding model: {model_name}")
        self.model = SentenceTransformer(model_name)
        print(f"Embedding dimension: {self.model.get_sentence_embedding_dimension()}")
    
    def chunk_documents(self, documents: List) -> List:
        """
        Split a list of LangChain Documents into smaller chunks.
        
        Args:
            documents: List of Document objects (full pages)
            
        Returns:
            List of smaller Document objects (chunks)
        """
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            separators=["\n\n", "\n", " ", ""]
            # tries these separators in order until chunks are small enough
            # "\n\n" = paragraph break (most preferred split point)
            # "\n"   = line break
            # " "    = word boundary
            # ""     = character level (last resort)
        )
        
        chunks = text_splitter.split_documents(documents)
        print(f"Split {len(documents)} documents into {len(chunks)} chunks")
        return chunks
    
    def embed_chunks(self, chunks: List) -> np.ndarray:
        """
        Generate embeddings for all chunks.
        
        Args:
            chunks: List of Document objects (the chunks from chunk_documents)
            
        Returns:
            numpy array of shape (num_chunks, embedding_dimension)
            e.g., (359, 384)
        """
        # Extract text content from each chunk
        texts = [doc.page_content for doc in chunks]
        
        # Encode using sentence-transformer model
        embeddings = self.model.encode(texts, show_progress_bar=True)
        
        print(f"Generated embeddings shape: {embeddings.shape}")
        return embeddings
```

---

## 21. src/vector_store.py (FAISS) — Full Code

```python
# src/vector_store.py

import os
import pickle
import numpy as np
import faiss
from pathlib import Path
from typing import List, Dict
from sentence_transformers import SentenceTransformer
from src.embedding import EmbeddingPipeline

class FAISSVectorStore:
    """
    FAISS-based persistent vector store.
    
    Responsibilities:
    - build_from_documents(): chunk + embed + index + save to disk
    - load():                 load existing index from disk
    - query():                search for top-k similar documents
    - _save():                internal method to persist index + metadata
    """
    
    def __init__(
        self,
        store_path: str = "faiss_store",
        model_name: str = "all-MiniLM-L6-v2",
        chunk_size: int = 1000,
        chunk_overlap: int = 200
    ):
        """
        Args:
            store_path:    Directory to save/load the FAISS index and metadata
            model_name:    Embedding model (must match what was used during build)
            chunk_size:    Characters per chunk
            chunk_overlap: Overlap between chunks
        """
        self.store_path = store_path
        self.files_path = Path(store_path)
        self.index_path = self.files_path / "faiss.index"
        self.metadata_path = self.files_path / "metadata.pickle"
        
        self.index = None        # FAISS index object (set after build or load)
        self.metadata = []       # list of dicts: content + metadata per chunk
        
        # Load embedding model
        print(f"Loading embedding model: {model_name}")
        self.embedding_model = SentenceTransformer(model_name)
        
        # Initialize embedding pipeline (for chunking + embedding new docs)
        self.embedding_pipeline = EmbeddingPipeline(model_name, chunk_size, chunk_overlap)
        
        # Create store directory if it doesn't exist
        os.makedirs(store_path, exist_ok=True)
    
    def build_from_documents(self, documents: List):
        """
        Full pipeline: chunk documents → generate embeddings → build FAISS index → save to disk.
        
        Call this ONCE when you have new documents.
        After this, use load() for subsequent runs.
        
        Args:
            documents: List of LangChain Document objects (from data_loader)
        """
        print("Building vector store from documents...")
        
        # Step 1: Chunk documents
        chunks = self.embedding_pipeline.chunk_documents(documents)
        
        # Step 2: Generate embeddings for all chunks
        embeddings = self.embedding_pipeline.embed_chunks(chunks)
        
        # Step 3: Store metadata for each chunk
        # We need to retrieve content + metadata at query time
        self.metadata = []
        for i, chunk in enumerate(chunks):
            self.metadata.append({
                "content": chunk.page_content,
                "metadata": chunk.metadata,
                "chunk_index": i
            })
        
        # Step 4: Build FAISS index
        embedding_dim = embeddings.shape[1]   # e.g., 384
        
        # IndexFlatL2 = brute-force L2 (Euclidean) distance search
        # Simple but accurate. For very large datasets consider IndexIVFFlat
        self.index = faiss.IndexFlatL2(embedding_dim)
        self.index.add(embeddings.astype(np.float32))  # FAISS needs float32
        
        # Step 5: Save index + metadata to disk
        self._save()
        
        print(f"Vector store built with {self.index.ntotal} vectors")
    
    def _save(self):
        """
        Save FAISS index and metadata to disk (internal method).
        
        Creates two files:
        - faiss_store/faiss.index       (the FAISS binary index)
        - faiss_store/metadata.pickle   (content + metadata for each chunk)
        """
        faiss.write_index(self.index, str(self.index_path))
        
        with open(self.metadata_path, 'wb') as f:
            pickle.dump(self.metadata, f)
        
        print(f"Saved: {self.index_path}")
        print(f"Saved: {self.metadata_path}")
    
    def load(self):
        """
        Load existing FAISS index and metadata from disk.
        Use this on subsequent runs instead of rebuild_from_documents().
        """
        if not self.index_path.exists():
            raise FileNotFoundError(
                f"No saved index found at {self.index_path}. "
                f"Run build_from_documents() first."
            )
        
        # Load FAISS index
        self.index = faiss.read_index(str(self.index_path))
        
        # Load metadata
        with open(self.metadata_path, 'rb') as f:
            self.metadata = pickle.load(f)
        
        print(f"Loaded FAISS index: {self.index.ntotal} vectors")
    
    def query(self, query_text: str, top_k: int = 5) -> List[Dict]:
        """
        Search for the most similar documents to the query.
        
        Args:
            query_text: Plain text query from the user
            top_k:      Number of results to return
            
        Returns:
            List of dicts: {'content', 'metadata', 'score'}
        """
        if self.index is None:
            raise ValueError(
                "Index not loaded. Call build_from_documents() or load() first."
            )
        
        # Convert query text to vector (SAME model used during build!)
        query_embedding = self.embedding_model.encode(
            [query_text],
            convert_to_tensor=False
        ).astype(np.float32)   # FAISS needs float32
        
        # Search FAISS index: returns (distances, indices)
        distances, indices = self.index.search(query_embedding, top_k)
        
        # Build results list
        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx < len(self.metadata):   # safety check for valid index
                # Convert L2 distance to similarity score
                # L2 distance: lower = more similar
                # similarity = 1 / (1 + distance): higher = more similar
                similarity = 1 / (1 + dist)
                
                results.append({
                    "content":  self.metadata[idx]["content"],
                    "metadata": self.metadata[idx]["metadata"],
                    "score":    round(float(similarity), 4)
                })
        
        return results
```

---

## 22. src/search.py — Full Code

```python
# src/search.py

import os
from typing import Dict
from langchain_groq import ChatGroq
from dotenv import load_dotenv

load_dotenv()

def search_and_summarize(
    query: str,
    store,          # FAISSVectorStore instance
    top_k: int = 5
) -> Dict:
    """
    Full RAG pipeline: retrieve from vector store + generate answer with LLM.
    
    Args:
        query:  User's question
        store:  Initialized and loaded FAISSVectorStore
        top_k:  Number of chunks to retrieve
        
    Returns:
        Dict with keys: 'answer', 'sources', 'context'
    """
    # Step 1: Initialize LLM
    llm = ChatGroq(
        groq_api_key=os.getenv("GROQ_API_KEY"),
        model_name="gemma2-9b-it",
        temperature=0.1,
        max_tokens=1024
    )
    
    # Step 2: Retrieve relevant chunks from vector store
    results = store.query(query, top_k=top_k)
    
    if not results:
        return {
            "answer": "No relevant information found in the knowledge base.",
            "sources": [],
            "context": ""
        }
    
    # Step 3: Build context from retrieved chunks
    context = "\n\n".join([r["content"] for r in results])
    sources = [r["metadata"].get("source_file", "unknown") for r in results]
    
    # Step 4: Build prompt (Augmentation)
    prompt = f"""Use the following context to answer the question clearly and concisely.
If the answer is not in the context, say "I don't have enough information."

Context:
{context}

Question: {query}

Answer:"""
    
    # Step 5: Generate answer (Generation)
    response = llm.invoke(prompt)
    
    return {
        "answer":  response.content,
        "sources": list(set(sources)),   # unique sources only
        "context": context
    }
```

---

## 23. app.py — Main Entry Point

```python
# app.py

from src.data_loader import load_all_documents
from src.vector_store import FAISSVectorStore
from src.search import search_and_summarize
from pathlib import Path

def main():
    """Main RAG application: load/build vector store, then run query loop."""
    
    store_path = "faiss_store"   # where to save/load the FAISS index
    data_dir   = "data"          # where your PDF/TXT files live
    
    # Step 1: Initialize FAISS vector store
    store = FAISSVectorStore(
        store_path=store_path,
        model_name="all-MiniLM-L6-v2",
        chunk_size=1000,
        chunk_overlap=200
    )
    
    # Step 2: Build or load vector store
    # If index already exists on disk → load it (fast)
    # If not (first run) → build from scratch (slow, one-time)
    if Path(f"{store_path}/faiss.index").exists():
        print("Loading existing vector store from disk...")
        store.load()
    else:
        print("Building new vector store (first run)...")
        # Load all documents from data directory
        documents = load_all_documents(data_dir)
        # Chunk + embed + index + save
        store.build_from_documents(documents)
    
    # Step 3: Interactive query loop
    print("\n" + "="*60)
    print("✅ RAG System Ready! Ask any question about your documents.")
    print("   Type 'exit' to quit.")
    print("="*60 + "\n")
    
    while True:
        query = input("Your question: ").strip()
        
        if query.lower() == "exit":
            print("Goodbye!")
            break
        
        if not query:
            continue
        
        # Run full RAG pipeline
        result = search_and_summarize(query, store)
        
        print(f"\n📝 ANSWER:\n{result['answer']}")
        print(f"\n📚 SOURCES: {', '.join(result['sources'])}")
        print("\n" + "-"*60 + "\n")

if __name__ == "__main__":
    main()
```

### Run the Application

```bash
python app.py
```

**First run output (builds index):**
```
Loading embedding model: all-MiniLM-L6-v2
Embedding dimension: 384
Building new vector store (first run)...
Found 4 PDF files
Total documents loaded: 64
Split 64 documents into 359 chunks
Batches: 100%|████████████| 12/12 [00:08<00:00]
Generated embeddings shape: (359, 384)
Saved: faiss_store/faiss.index
Saved: faiss_store/metadata.pickle
Vector store built with 359 vectors

====================================================
✅ RAG System Ready! Ask any question about your documents.
   Type 'exit' to quit.
====================================================

Your question: What is attention mechanism?

📝 ANSWER:
The attention mechanism maps a query and a set of key-value pairs to an output.
The output is computed as a weighted sum of the values, where the weight assigned
to each value is computed by a compatibility function...

📚 SOURCES: attention.pdf
```

**Second run output (loads from disk — much faster):**
```
Loading existing vector store from disk...
Loaded FAISS index: 359 vectors

====================================================
✅ RAG System Ready! Ask any question.
```

---

## 24. Complete Summary — RAG in One Flow

```
YOUR PRIVATE DATA (PDF, TXT, CSV, SQL...)
               ↓
   ┌───────────────────────────────────────────────┐
   │          DATA INJECTION PIPELINE               │
   │                                                │
   │  data_loader.py → load_all_documents()         │
   │  · Read all files (PDF, TXT, etc.)             │
   │  · Convert each to Document objects            │
   │  · Add custom metadata (source_file, type)     │
   │                                                │
   │  embedding.py → EmbeddingPipeline              │
   │  · chunk_documents(): split into 1000-char     │
   │    pieces with 200-char overlap                │
   │  · embed_chunks(): all-MiniLM-L6-v2 model      │
   │    → each chunk = 384-dimensional vector       │
   │                                                │
   │  vector_store.py → FAISSVectorStore            │
   │  · build FAISS index with all vectors          │
   │  · save faiss.index + metadata.pickle to disk  │
   └───────────────────────────────────────────────┘
               ↓
        Vector Database (on disk)
               ↓
   ┌───────────────────────────────────────────────┐
   │         QUERY RETRIEVAL PIPELINE               │
   │                                                │
   │  User asks: "What is hard negative mining?"   │
   │               ↓                               │
   │  Same all-MiniLM-L6-v2 model                  │
   │  → Query text → 384-dimensional vector        │
   │               ↓                               │
   │  FAISS similarity search                       │
   │  → Top-5 most similar chunks returned         │
   │               ↓                               │
   │  AUGMENTATION (search.py)                     │
   │  · Join chunks into context string            │
   │  · Build prompt: context + query → LLM        │
   │               ↓                               │
   │  GENERATION (Groq LLM: gemma2-9b-it)          │
   │  · LLM reads context + question               │
   │  · Returns accurate, grounded answer          │
   └───────────────────────────────────────────────┘
```

---

## Quick Reference — Key Terms

| Term | Simple Meaning |
|---|---|
| **RAG** | LLM + external knowledge base = accurate, grounded answers |
| **Hallucination** | LLM confidently making up wrong answers |
| **Fine-tuning** | Updating LLM weights for new data — expensive, RAG avoids this |
| **Document** | LangChain structure: `page_content` + `metadata` |
| **TextLoader** | LangChain loader for `.txt` files → returns Documents |
| **PyMuPDFLoader** | Best PDF loader — auto-fills rich metadata (author, pages, etc.) |
| **DirectoryLoader** | Load all files matching a pattern from a folder |
| **Chunking** | Splitting long docs into smaller pieces that fit in context window |
| **chunk_size** | Max characters per chunk (default 1000) |
| **chunk_overlap** | Characters shared between adjacent chunks (default 200) |
| **RecursiveCharacterTextSplitter** | Most popular chunker — tries `\n\n`, `\n`, ` `, `` in order |
| **`"\n\n"` separator** | Double newline = paragraph break |
| **Embedding** | Text → vector (list of numbers capturing semantic meaning) |
| **all-MiniLM-L6-v2** | Free HuggingFace model → 384-dimensional vectors |
| **Vector DB** | Database storing text + vectors, supports similarity search |
| **ChromaDB** | Easy open-source vector DB with local persistence |
| **FAISS** | Meta's fast vector search library — `faiss.IndexFlatL2` |
| **Similarity Search** | Find stored vectors closest to query vector |
| **Cosine Similarity** | Angle-based similarity: 1 = identical, 0 = unrelated |
| **L2 Distance** | Euclidean distance: lower = more similar (used by FAISS) |
| **Persistent Store** | Vector DB saved to disk (not lost when app restarts) |
| **Metadata Filtering** | During search, filter by author/page/date etc. |
| **Augmentation** | Adding retrieved context to the LLM prompt |
| **Context Window** | Max tokens LLM can process at once (why we chunk) |
| **Groq** | Fast LLM inference API (free tier available) |
| **`uuid.uuid4()`** | Generate a unique ID string for each record in vector DB |
| **`embedding.tolist()`** | Convert numpy array to Python list (required by ChromaDB) |
| **`np.float32` cast** | Required by FAISS — it only works with 32-bit floats |

---

*Krish Naik RAG Crash Course — Complete notes. Pipeline: Document structure → TextLoader / DirectoryLoader / PyMuPDFLoader → process_all_pdfs() → split_documents() with RecursiveCharacterTextSplitter → EmbeddingManager (all-MiniLM-L6-v2, 384 dims) → VectorStoreManager (ChromaDB) → Complete data injection → RAGRetriever class → rag_simple() → rag_advanced() → Modular code: data_loader.py / embedding.py / vector_store.py (FAISS) / search.py / app.py. All code included, nothing skipped.*
