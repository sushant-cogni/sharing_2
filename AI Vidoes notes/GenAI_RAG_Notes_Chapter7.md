# GenAI & RAG — Full Course Notes
## Chapter 7: LangChain — Building LLM Applications

---

> Until now you have been building everything from scratch — raw API calls, custom chunkers, custom retrievers, custom pipelines. That taught you exactly how everything works under the hood, which was the point. Now meet LangChain — a framework that gives you ready-made, well-tested versions of all of that. You will build the same RAG system in far less code, and then use LangChain as the foundation for agents in Chapter 8.

---

## 7.1 — What is LangChain and Why Does It Exist

When you build LLM applications from scratch, you keep writing the same things over and over:

- Code to call the LLM API
- Code to manage conversation history
- Code to load and chunk documents
- Code to embed and store in a vector DB
- Code to retrieve and build prompts
- Code to chain multiple steps together

Every developer building an LLM app wrote their own version of all of this. LangChain was created to standardize it — one library with well-tested building blocks for all common LLM application patterns.

**What LangChain gives you:**

- **Model wrappers** — one consistent interface for OpenAI, Anthropic, Google, local models
- **Prompt templates** — reusable, parameterized prompts
- **Chains** — connect multiple steps into a pipeline
- **Document loaders** — load PDFs, web pages, CSV, Notion, and 100+ sources
- **Text splitters** — ready-made chunking strategies
- **Retrievers** — vector search, BM25, hybrid — all built in
- **Memory** — conversation memory across turns
- **Agents** — LLM-powered decision making with tools
- **LangSmith** — debugging and tracing every step visually

**LangChain vs building from scratch:**

The code you wrote in Chapters 3–6 works perfectly. LangChain does not replace that understanding — it replaces the repetitive plumbing. The concepts are identical. The code is just shorter and more maintainable.

---

## 7.2 — Setup

```bash
pip install langchain langchain-openai langchain-anthropic langchain-community
pip install langchain-chroma chromadb fastembed pypdf
pip install langsmith  # For tracing
```

Add to your `.env`:
```
OPENAI_API_KEY=sk-your-key
ANTHROPIC_API_KEY=sk-ant-your-key
LANGCHAIN_API_KEY=ls-your-key        # Get from smith.langchain.com (free)
LANGCHAIN_TRACING_V2=true            # Enables automatic tracing
LANGCHAIN_PROJECT=my-rag-project     # Project name in LangSmith dashboard
```

---

## 7.3 — Core Building Block 1: Chat Models

LangChain wraps LLM APIs so you can switch between them with one line change.

```python
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage
from dotenv import load_dotenv

load_dotenv()

# OpenAI
llm_openai = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)

# Anthropic Claude — exact same interface
llm_claude = ChatAnthropic(model="claude-sonnet-4-5", temperature=0.7)

# Call them the same way regardless of provider
messages = [
    SystemMessage(content="You are a helpful assistant. Be concise."),
    HumanMessage(content="What is the capital of France?")
]

# Using OpenAI
response = llm_openai.invoke(messages)
print(response.content)
# Output: Paris

# Switch to Claude — same code, same output format
response = llm_claude.invoke(messages)
print(response.content)
# Output: Paris
```

**Why this matters:** In the raw API approach, switching from OpenAI to Claude required changing the client, the message format, and the response parsing. With LangChain, you just swap one line.

---

## 7.4 — Core Building Block 2: Prompt Templates

Instead of building strings manually, LangChain gives you typed, reusable prompt templates.

```python
from langchain_core.prompts import ChatPromptTemplate, PromptTemplate
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv

load_dotenv()
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# Simple prompt template with variables
template = ChatPromptTemplate.from_messages([
    ("system", "You are an expert in {domain}. Answer clearly and concisely."),
    ("human", "{question}")
])

# Fill in the variables
filled_prompt = template.invoke({
    "domain": "machine learning",
    "question": "What is overfitting?"
})

print(filled_prompt)
# Shows the formatted messages with variables replaced

# Pass directly to the model
response = llm.invoke(filled_prompt)
print(response.content)
```

**Multi-turn conversation template:**

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

# MessagesPlaceholder lets you insert dynamic message history
chat_template = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant named {assistant_name}."),
    MessagesPlaceholder(variable_name="history"),  # Conversation history goes here
    ("human", "{input}")
])

# Later you will fill 'history' with actual message objects
# This is used with memory — covered in section 7.6
```

---

## 7.5 — Core Building Block 3: LCEL (LangChain Expression Language)

This is how LangChain connects components together. It uses the `|` (pipe) operator — the output of one step flows into the next, just like a Unix pipeline.

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv

load_dotenv()

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)
parser = StrOutputParser()  # Extracts the text string from the LLM response object

# Build a chain using the pipe operator
chain = (
    ChatPromptTemplate.from_messages([
        ("system", "You are a helpful assistant."),
        ("human", "{input}")
    ])
    | llm
    | parser  # Converts LLM response object → plain string
)

# Invoke the chain
result = chain.invoke({"input": "Explain RAG in one sentence."})
print(result)
# Output: RAG combines document retrieval with language generation to answer
# questions based on specific knowledge sources rather than just training data.
```

**The pipe `|` reads left to right:**
- Prompt template fills in variables → produces formatted messages
- `|` passes those messages to the LLM
- LLM generates a response object
- `|` passes that to the parser
- Parser extracts the plain text string

**Chaining multiple LLM calls:**

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI

load_dotenv()
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)
parser = StrOutputParser()

# Step 1: Generate an outline
outline_chain = (
    ChatPromptTemplate.from_template(
        "Create a 5-point outline for a blog post about: {topic}"
    )
    | llm
    | parser
)

# Step 2: Write the post from the outline
post_chain = (
    ChatPromptTemplate.from_template(
        "Write a detailed blog post using this outline:\n{outline}"
    )
    | llm
    | parser
)

# Chain them together — output of step 1 feeds step 2
full_chain = (
    {"outline": outline_chain, "topic": lambda x: x["topic"]}
    | post_chain
)

# But simpler: run sequentially
topic = "How RAG makes LLMs more accurate"

outline = outline_chain.invoke({"topic": topic})
print("OUTLINE:\n", outline)

post = post_chain.invoke({"outline": outline})
print("\nBLOG POST:\n", post[:500])
```

**Streaming with LCEL:**

```python
# Any chain can stream — just use .stream() instead of .invoke()
for chunk in chain.stream({"input": "Explain embeddings simply."}):
    print(chunk, end="", flush=True)
print()
```

---

## 7.6 — Core Building Block 4: Memory

LangChain provides ready-made memory systems so your chatbot can remember the conversation.

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.messages import HumanMessage, AIMessage
from dotenv import load_dotenv

load_dotenv()

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)
parser = StrOutputParser()

# Build the chain with a history placeholder
chain = (
    ChatPromptTemplate.from_messages([
        ("system", "You are a helpful assistant. Be concise."),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{input}")
    ])
    | llm
    | parser
)

# Manage history manually — simple and transparent
class ConversationManager:
    def __init__(self, chain):
        self.chain = chain
        self.history = []
    
    def chat(self, user_input: str) -> str:
        # Run chain with current history
        response = self.chain.invoke({
            "input": user_input,
            "history": self.history
        })
        
        # Update history
        self.history.append(HumanMessage(content=user_input))
        self.history.append(AIMessage(content=response))
        
        return response
    
    def clear(self):
        self.history = []


bot = ConversationManager(chain)

print(bot.chat("My name is Arjun and I live in Pune."))
print(bot.chat("I am learning about RAG systems."))
print(bot.chat("What did I tell you about myself?"))
# Output: You mentioned your name is Arjun, you live in Pune,
# and you are learning about RAG systems.
```

**Conversation summary memory** — for long conversations:

When the conversation gets very long, keeping the full history wastes tokens. Instead, periodically summarize older messages.

```python
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

class SummaryMemoryManager:
    def __init__(self, max_messages: int = 10):
        """
        max_messages: when history exceeds this, summarize older messages.
        """
        self.history = []
        self.summary = ""
        self.max_messages = max_messages
        self.llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    
    def _summarize(self):
        """Summarize the current history into a paragraph."""
        history_text = "\n".join([
            f"{'User' if isinstance(m, HumanMessage) else 'Assistant'}: {m.content}"
            for m in self.history
        ])
        
        summary_prompt = f"""Summarize this conversation concisely, 
keeping all important facts mentioned by the user:

{history_text}

Summary:"""
        
        response = self.llm.invoke([HumanMessage(content=summary_prompt)])
        return response.content
    
    def add(self, user_msg: str, ai_msg: str):
        self.history.append(HumanMessage(content=user_msg))
        self.history.append(AIMessage(content=ai_msg))
        
        # Summarize and compress when history gets too long
        if len(self.history) > self.max_messages:
            self.summary = self._summarize()
            self.history = []  # Clear after summarizing
    
    def get_context(self) -> list:
        """Return messages to include in the next API call."""
        messages = []
        
        if self.summary:
            messages.append(SystemMessage(
                content=f"Summary of earlier conversation: {self.summary}"
            ))
        
        messages.extend(self.history)
        return messages
```

---

## 7.7 — Document Loaders

LangChain has loaders for 100+ document types. All return the same `Document` object format — making them interchangeable.

```python
from langchain_community.document_loaders import (
    PyPDFLoader,
    WebBaseLoader,
    TextLoader,
    CSVLoader
)

# Load PDF — each page becomes a Document object
pdf_loader = PyPDFLoader("company_policy.pdf")
pdf_docs = pdf_loader.load()
print(f"Loaded {len(pdf_docs)} pages from PDF")
print(f"First page preview: {pdf_docs[0].page_content[:200]}")
print(f"Metadata: {pdf_docs[0].metadata}")
# metadata includes: source, page number

# Load a web page
web_loader = WebBaseLoader("https://en.wikipedia.org/wiki/Retrieval-augmented_generation")
web_docs = web_loader.load()
print(f"\nLoaded {len(web_docs)} document(s) from web")

# Load plain text
text_loader = TextLoader("notes.txt")
text_docs = text_loader.load()

# Load CSV
csv_loader = CSVLoader("products.csv")
csv_docs = csv_loader.load()
# Each row becomes a separate Document
```

**Every Document object has:**
- `page_content` → the actual text
- `metadata` → dict with source, page, url, etc.

This uniform format means every loader works with every splitter and retriever.

---

## 7.8 — Text Splitters

LangChain has ready-made chunking strategies. The most useful one is `RecursiveCharacterTextSplitter` — which is exactly what you built manually in Chapter 5, but battle-tested.

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader

# Load documents
loader = PyPDFLoader("company_policy.pdf")
docs = loader.load()

# Split into chunks
splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,         # Characters per chunk
    chunk_overlap=50,       # Overlap between chunks
    separators=["\n\n", "\n", ". ", " ", ""]  # Try these in order
)

chunks = splitter.split_documents(docs)

print(f"Original pages: {len(docs)}")
print(f"After splitting: {len(chunks)} chunks")
print(f"\nSample chunk:")
print(chunks[0].page_content)
print(f"Metadata: {chunks[0].metadata}")
# Metadata carries over from the original document — source, page, etc.
```

**Semantic text splitter** — splits at meaning boundaries, not character count:

```python
from langchain_experimental.text_splitter import SemanticChunker
from langchain_openai import OpenAIEmbeddings

# This uses embeddings to find natural breakpoints in the text
# Splits where the meaning changes significantly
semantic_splitter = SemanticChunker(
    OpenAIEmbeddings(),
    breakpoint_threshold_type="percentile",
    breakpoint_threshold_amount=95
)

semantic_chunks = semantic_splitter.split_documents(docs)
print(f"Semantic chunks: {len(semantic_chunks)}")
# Produces fewer, more coherent chunks than fixed-size splitting
```

---

## 7.9 — Vector Stores in LangChain

LangChain wraps Chroma, Qdrant, Pinecone, and others with a consistent interface.

```python
from langchain_chroma import Chroma
from langchain_community.embeddings import FastEmbedEmbeddings
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

# FastEmbed wrapped for LangChain — stays local and free
embeddings = FastEmbedEmbeddings(model_name="BAAI/bge-small-en-v1.5")

# Load and split
loader = PyPDFLoader("company_policy.pdf")
docs = loader.load()

splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
chunks = splitter.split_documents(docs)

# Create Chroma vector store — embeds and stores in one call
vectorstore = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory="./langchain_chroma_db"
)

print(f"Stored {len(chunks)} chunks in Chroma")

# Search
results = vectorstore.similarity_search("What is the refund policy?", k=3)
for doc in results:
    print(f"\n[Page {doc.metadata.get('page', '?')}]")
    print(doc.page_content[:200])

# Search with scores
results_with_scores = vectorstore.similarity_search_with_score(
    "refund policy", k=3
)
for doc, score in results_with_scores:
    print(f"Score: {score:.4f} | {doc.page_content[:100]}")
```

**Loading an existing vector store:**

```python
# Next time — load without re-embedding
vectorstore = Chroma(
    persist_directory="./langchain_chroma_db",
    embedding_function=embeddings
)
```

---

## 7.10 — Retrievers

A retriever is anything that takes a query and returns documents. LangChain has many types.

```python
from langchain_chroma import Chroma
from langchain_community.embeddings import FastEmbedEmbeddings

embeddings = FastEmbedEmbeddings(model_name="BAAI/bge-small-en-v1.5")
vectorstore = Chroma(persist_directory="./langchain_chroma_db", embedding_function=embeddings)

# Basic retriever — top-k semantic search
basic_retriever = vectorstore.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 5}
)

# MMR retriever — diverse results (avoids returning 5 nearly identical chunks)
mmr_retriever = vectorstore.as_retriever(
    search_type="mmr",           # Maximum Marginal Relevance
    search_kwargs={"k": 5, "fetch_k": 20}  # Fetch 20, return diverse 5
)

# Threshold retriever — only return chunks above a similarity score
threshold_retriever = vectorstore.as_retriever(
    search_type="similarity_score_threshold",
    search_kwargs={"score_threshold": 0.5, "k": 5}
)

# Use any retriever the same way
docs = basic_retriever.invoke("What is the refund policy?")
for doc in docs:
    print(doc.page_content[:100])
```

**Multi-query retriever** — automatically generates multiple query variations and combines results:

```python
from langchain.retrievers import MultiQueryRetriever
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv

load_dotenv()

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# This retriever asks the LLM to rephrase the query in 3 different ways
# Then retrieves for all 3 and combines — better recall
multi_query_retriever = MultiQueryRetriever.from_llm(
    retriever=basic_retriever,
    llm=llm
)

docs = multi_query_retriever.invoke("how do I send something back?")
print(f"Retrieved {len(docs)} docs using multi-query")
```

---

## 7.11 — Building a RAG Chain with LangChain

Now put it all together — document loading, splitting, embedding, retrieving, and generating — in a clean LangChain pipeline.

```python
from langchain_chroma import Chroma
from langchain_community.embeddings import FastEmbedEmbeddings
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from dotenv import load_dotenv

load_dotenv()

# ── SETUP ──────────────────────────────────────────────

embeddings = FastEmbedEmbeddings(model_name="BAAI/bge-small-en-v1.5")
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
parser = StrOutputParser()

# ── INGESTION ──────────────────────────────────────────

def build_vectorstore(sources: list[dict]) -> Chroma:
    """
    Build vector store from multiple sources.
    Each source: {"type": "pdf"/"text"/"web", "path": "..."}
    """
    all_chunks = []
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    
    for source in sources:
        if source["type"] == "pdf":
            loader = PyPDFLoader(source["path"])
        elif source["type"] == "text":
            loader = TextLoader(source["path"])
        else:
            continue
        
        docs = loader.load()
        chunks = splitter.split_documents(docs)
        all_chunks.extend(chunks)
        print(f"Loaded {len(chunks)} chunks from {source['path']}")
    
    print(f"\nBuilding vector store with {len(all_chunks)} total chunks...")
    
    vectorstore = Chroma.from_documents(
        documents=all_chunks,
        embedding=embeddings,
        persist_directory="./rag_vectorstore"
    )
    
    return vectorstore


# ── RAG CHAIN ──────────────────────────────────────────

RAG_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are a helpful assistant that answers questions based on provided documents.

RULES:
- Answer ONLY from the context below
- If the answer is not in the context, say "I could not find this in the documents"
- Always be concise and accurate
- Mention the source when possible

CONTEXT:
{context}"""),
    ("human", "{question}")
])

def format_docs(docs) -> str:
    """Format retrieved docs into a single context string."""
    parts = []
    for i, doc in enumerate(docs, 1):
        source = doc.metadata.get("source", "unknown")
        page = doc.metadata.get("page", "")
        page_str = f", page {page}" if page else ""
        parts.append(f"[Source {i}: {source}{page_str}]\n{doc.page_content}")
    return "\n\n".join(parts)


def build_rag_chain(vectorstore: Chroma):
    """Build the RAG chain using LCEL."""
    retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 5}
    )
    
    rag_chain = (
        {
            # Retrieve docs for the question, format them as context
            "context": retriever | format_docs,
            # Pass question through unchanged
            "question": RunnablePassthrough()
        }
        | RAG_PROMPT
        | llm
        | parser
    )
    
    return rag_chain, retriever


# ── USE IT ─────────────────────────────────────────────

# For testing without PDFs, create a sample text file
import os
os.makedirs("./sample_docs", exist_ok=True)
with open("./sample_docs/policies.txt", "w") as f:
    f.write("""
Return Policy:
Customers may return items within 30 days of purchase.
Items must be in original condition and packaging.
To initiate a return, email support@company.com with your order number.
Refunds are processed in 5-7 business days.
Electronics have a 15-day return window only.
Damaged items are not eligible for returns.

Shipping Policy:
Standard shipping is free for orders above Rs 500.
Express shipping costs Rs 99 and takes 1-2 business days.
Standard shipping takes 5-7 business days.
International shipping is available to 25 countries.

Subscription Policy:
Subscriptions can be cancelled at any time from account settings.
Access continues until the end of the current billing period after cancellation.
No refunds are given for partial subscription months.
""")

# Build
vectorstore = build_vectorstore([
    {"type": "text", "path": "./sample_docs/policies.txt"}
])

rag_chain, retriever = build_rag_chain(vectorstore)

# Ask questions
questions = [
    "What is the return window for electronics?",
    "How much does express shipping cost?",
    "Can I get a refund if I cancel my subscription mid-month?"
]

for q in questions:
    print(f"\nQ: {q}")
    answer = rag_chain.invoke(q)
    print(f"A: {answer}")
```

---

## 7.12 — Conversational RAG with Memory

Basic RAG answers each question independently. Conversational RAG remembers the conversation — so follow-up questions work naturally.

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI
from langchain_chroma import Chroma
from langchain_community.embeddings import FastEmbedEmbeddings
from dotenv import load_dotenv

load_dotenv()

embeddings = FastEmbedEmbeddings(model_name="BAAI/bge-small-en-v1.5")
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
parser = StrOutputParser()

# Load existing vector store
vectorstore = Chroma(
    persist_directory="./rag_vectorstore",
    embedding_function=embeddings
)
retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

# Step 1: Rephrase follow-up questions using history
# "What about electronics?" → "What is the return window for electronics?"
REPHRASE_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """Given the conversation history and a follow-up question,
rephrase the follow-up into a standalone question that can be understood without the history.
Return ONLY the rephrased question, nothing else.
If the question is already standalone, return it unchanged."""),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{input}")
])

# Step 2: Answer using retrieved context
ANSWER_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """Answer the question using ONLY the context provided.
If not found in context, say so.

CONTEXT:
{context}"""),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{question}")
])

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

# Build the conversational RAG chain
rephrase_chain = REPHRASE_PROMPT | llm | parser

def conversational_rag(input_data: dict) -> str:
    history = input_data.get("history", [])
    user_input = input_data["input"]
    
    # Step 1: Rephrase the question with history context
    standalone_question = rephrase_chain.invoke({
        "history": history,
        "input": user_input
    })
    
    # Step 2: Retrieve based on standalone question
    docs = retriever.invoke(standalone_question)
    context = format_docs(docs)
    
    # Step 3: Generate answer
    answer = (ANSWER_PROMPT | llm | parser).invoke({
        "context": context,
        "history": history,
        "question": standalone_question
    })
    
    return answer


# Use it with conversation history
chat_history = []

def chat(user_input: str) -> str:
    response = conversational_rag({
        "input": user_input,
        "history": chat_history
    })
    
    chat_history.append(HumanMessage(content=user_input))
    chat_history.append(AIMessage(content=response))
    
    return response


print(chat("What is the return policy?"))
print()
print(chat("What about for electronics specifically?"))  # Follow-up — needs history
print()
print(chat("And if I damaged the item?"))               # Another follow-up
```

The rephrase step is the key. Without it, "What about electronics?" would search for "electronics" with no context. With it, the question becomes "What is the return window for electronics?" — a much better retrieval query.

---

## 7.13 — LangSmith: Tracing and Debugging

**The problem:** Something in your RAG pipeline is giving wrong answers. Was it bad retrieval? A bad prompt? The LLM making something up? Without tracing, you cannot tell.

**LangSmith** records every step of every LangChain run — what was retrieved, what the exact prompt looked like, what the LLM returned, how long it took, how many tokens it used.

**Setup (you already added the keys to .env):**

```python
import os
from dotenv import load_dotenv

load_dotenv()

# These environment variables activate LangSmith automatically
# LANGCHAIN_TRACING_V2=true
# LANGCHAIN_API_KEY=ls-your-key
# LANGCHAIN_PROJECT=my-rag-project

# Now every .invoke() call is automatically traced
# No code changes needed
```

**What you see in the LangSmith dashboard:**

For every query you make, LangSmith shows:
- The exact user question that came in
- The rephrased standalone question (if conversational RAG)
- The exact chunks retrieved — you can read them
- The exact prompt that was sent to the LLM
- The LLM's raw response
- Total tokens used and cost
- Total latency per step

**How to add custom tags for easier filtering:**

```python
from langchain_core.runnables.config import RunnableConfig

# Tag specific runs for filtering in the dashboard
config = RunnableConfig(
    tags=["production", "user-query"],
    metadata={"user_id": "user_123", "session_id": "sess_456"}
)

answer = rag_chain.invoke("What is the refund policy?", config=config)
```

Go to smith.langchain.com → your project → click any trace → see every step visually. This is the fastest way to debug why your RAG is giving wrong answers.

---

## 7.14 — Project: Conversational RAG Chatbot

Build a complete conversational RAG chatbot using LangChain.

**Requirements:**

1. Accepts multiple PDFs at startup as command-line arguments
2. Builds a persistent Chroma vector store using FastEmbed
3. Has full conversation memory — follow-up questions work correctly
4. Streams responses token by token
5. Shows which source/page each answer came from
6. Uses LangSmith tracing — every run visible in dashboard

**Complete starter:**

```python
# conversational_rag_chatbot.py
import sys
from langchain_chroma import Chroma
from langchain_community.embeddings import FastEmbedEmbeddings
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.messages import HumanMessage, AIMessage
from dotenv import load_dotenv
import os

load_dotenv()

PERSIST_DIR = "./chatbot_vectorstore"
embeddings = FastEmbedEmbeddings(model_name="BAAI/bge-small-en-v1.5")
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0, streaming=True)
parser = StrOutputParser()
splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)

def load_documents(paths: list[str]):
    """Load and chunk documents from file paths."""
    all_chunks = []
    for path in paths:
        if path.endswith(".pdf"):
            loader = PyPDFLoader(path)
        else:
            loader = TextLoader(path)
        chunks = splitter.split_documents(loader.load())
        all_chunks.extend(chunks)
        print(f"Loaded: {path} ({len(chunks)} chunks)")
    return all_chunks

def get_or_build_vectorstore(paths: list[str]) -> Chroma:
    """Build vector store, or load if already exists."""
    if os.path.exists(PERSIST_DIR) and not paths:
        print("Loading existing vector store...")
        return Chroma(persist_directory=PERSIST_DIR, embedding_function=embeddings)
    
    chunks = load_documents(paths)
    vs = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=PERSIST_DIR
    )
    print(f"Vector store built: {len(chunks)} chunks")
    return vs

def run_chatbot(vectorstore: Chroma):
    retriever = vectorstore.as_retriever(search_kwargs={"k": 4})
    history = []
    
    rephrase = (
        ChatPromptTemplate.from_messages([
            ("system", "Rephrase the follow-up as a standalone question. Return ONLY the question."),
            MessagesPlaceholder("history"),
            ("human", "{input}")
        ]) | llm | parser
    )
    
    answer_chain = (
        ChatPromptTemplate.from_messages([
            ("system", "Answer using ONLY this context:\n\n{context}\n\nIf not found, say so."),
            MessagesPlaceholder("history"),
            ("human", "{question}")
        ]) | llm | parser
    )
    
    print("\nChatbot ready. Ask questions about your documents. Type 'quit' to exit.\n")
    
    while True:
        user_input = input("You: ").strip()
        if not user_input:
            continue
        if user_input.lower() in ["quit", "exit"]:
            break
        
        # Rephrase if there is history
        if history:
            question = rephrase.invoke({"history": history, "input": user_input})
        else:
            question = user_input
        
        # Retrieve
        docs = retriever.invoke(question)
        context = "\n\n".join([
            f"[{d.metadata.get('source','?')}, p.{d.metadata.get('page','?')}]\n{d.page_content}"
            for d in docs
        ])
        
        # Stream answer
        print("Assistant: ", end="", flush=True)
        full_response = ""
        for chunk in answer_chain.stream({"context": context, "history": history, "question": question}):
            print(chunk, end="", flush=True)
            full_response += chunk
        print("\n")
        
        # Update history
        history.append(HumanMessage(content=user_input))
        history.append(AIMessage(content=full_response))


if __name__ == "__main__":
    paths = sys.argv[1:]
    vs = get_or_build_vectorstore(paths)
    run_chatbot(vs)
```

Run it:
```bash
python conversational_rag_chatbot.py document1.pdf notes.txt
```

---

## Chapter 7 Summary

| LangChain Component | What it does | Replaces what you built manually |
|---|---|---|
| `ChatOpenAI` / `ChatAnthropic` | Wraps LLM APIs | `client.chat.completions.create()` |
| `ChatPromptTemplate` | Typed reusable prompts | f-string prompt building |
| LCEL (`\|` operator) | Connects steps in a pipeline | Manual function chaining |
| `PyPDFLoader`, `WebBaseLoader` | Loads documents | `PdfReader`, `requests + bs4` |
| `RecursiveCharacterTextSplitter` | Chunks documents | Your custom chunk function |
| `Chroma` (LangChain) | Vector store with one-line setup | Manual Chroma setup + embed loop |
| `as_retriever()` | Turns vector store into a retriever | Manual query + format function |
| `MultiQueryRetriever` | Multiple query variations | Query expansion code |
| `MessagesPlaceholder` | Inserts dynamic history into prompt | Manual history list insertion |
| LangSmith | Visual traces of every step | Print statements everywhere |

---

## What Is Coming Next

**Chapter 8 — Agentic AI: Building AI Agents**

Now that you know LangChain, you have everything needed to build agents. An agent is an LLM that decides what tools to use, in what order, to complete a task — rather than following a fixed pipeline. Chapter 8 starts from the concept and builds up to real working agents that can search the web, query databases, and run code.

---

*End of Chapter 7*
