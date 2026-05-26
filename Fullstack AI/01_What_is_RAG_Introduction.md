# 📘 Notes — What is RAG (Introduction)

> **Topic:** Retrieval Augmented Generation (RAG) — One Stop Tutorial
> **Goal of this lesson:** Understand what RAG is, why it's popular, the full RAG pipeline, and the most common RAG architectures used in industry.

---

## 1. What is RAG?

**RAG = Retrieval Augmented Generation**

The name sounds complicated, but the idea is very simple. RAG is one of the **most practical real-world applications of AI today**. You'll find RAG being used almost everywhere:

- Customer support
- Medical
- Legal
- Finance
- Compliance
- Research

### Real-life example given by the instructor
The instructor recently got a blood test done. The app showing the report gave her:
- An **AI-generated summary** of her report
- **FAQs based on her personal data**
- **Personal suggestions**

Normal tools like **ChatGPT, Gemini, Claude** *cannot* do this — because they don't have access to her personal blood test data.

But many enterprise apps today **can** do this — because of **RAG**.

---

## 2. Understanding RAG with Two Students (Easy Analogy)

### 🧑‍🎓 Case 1 — Student 1 (Closed Book Exam)
- Has many books today.
- Will study, memorize, and learn as much as possible.
- Tomorrow's exam = **closed book** → must answer only from memory.

👉 This is exactly how **normal LLMs (ChatGPT, Gemini, Claude)** work.

- LLMs are trained on a huge dataset (their "studying").
- After training is done, when a user asks a question, the model **generates an answer based only on what it has learned**.
- 🔑 **Keyword: GENERATION**

### 🧑‍🎓 Case 2 — Student 2 (Open Book Exam)
- Same studying, same memorization.
- But tomorrow's exam = **open book** → can refer to the book during the exam.
- Can verify facts, check up-to-date info, look things up in real-time.
- ✅ Result: This student will likely perform better.

👉 This is exactly how **RAG** works.

---

## 3. So What Exactly is RAG?

RAG is **NOT a single technology** — it is a **technique**.

We use this technique to **improve the accuracy and quality** of answers given by LLMs.

### How does it work?
- We allow the LLM to access a **real-time, up-to-date database**.
- This database contains relevant data.
- Model can look up this data in real time and produce relevant answers.

### Result: Answers become…
- ✅ More accurate
- ✅ More up-to-date
- ✅ More **context-aware**

### What does "context-aware" mean? (Flight example)
Suppose you booked a flight and it got delayed.

- Ask **ChatGPT/Gemini** → "Why is my flight delayed?"
  → They have NO clue which flight you booked, your PNR, or its status. You'll get a generic answer.

- Ask the **airline's RAG-based chatbot** (logged in) → It already knows:
  - Who you are
  - Which flight you booked
  - Arrival time, destination, PNR
  - Current status

  → You get a **specific, useful answer**.

That's why RAG is so popular.

---

## 4. Benefits of RAG (Why It's Used)

LLMs have natural weaknesses. RAG helps overcome them.

### ✅ Benefit 1 — Reduces Hallucination
- LLMs sometimes get **overconfident** and make up facts when they don't know something. This is called **hallucination**.
- RAG makes responses **grounded in real data** → fewer made-up facts.

### ✅ Benefit 2 — Keeps Knowledge Up-to-Date
- Every LLM has a **knowledge cutoff date** (the date until which its training data goes).
- Example: GPT-5's knowledge cutoff is **30th September 2024** → it doesn't know about events after that.
- RAG can give the model access to **current events / new info** without retraining.

### ✅ Benefit 3 — Cost Effective
- Without RAG, to give a model new data, you'd have to:
  - **Re-train** the model, OR
  - **Fine-tune** it
  - Both are very **expensive**.
- RAG avoids both. We just give the model access to data — done.

### ✅ Benefit 4 — Maintains Data Privacy
- Big companies don't want to expose their **internal/sensitive data** for training.
- With RAG, they don't have to.
- The model **doesn't access the entire database at once** — only the small relevant part needed for that query.
- So sensitive data is never fully exposed.

---

## 5. The RAG Pipeline (How RAG Actually Works)

The RAG pipeline has **2 main components**:

1. **Ingestion Pipeline** — preparing the "open book"
2. **Retrieval Pipeline** — using the "open book" during the exam

The names sound scary, but the concept is simple.

---

### 🔹 Part A — The Ingestion Pipeline

This is how we prepare the data the model will use.

#### Step 1: Get all the data
The data can be anything:
- PDFs
- Documents
- Excel files
- An entire website
- A company's internal database

#### Step 2: Split data into chunks
- We don't process all data at once.
- We break it into **small pieces called chunks**.

#### Step 3: Convert chunks into embeddings
- Models cannot understand text — they only understand **numbers**.
- So we convert each chunk into numbers using an **embedding model / embedding API**.
- These numbers form a **vector** → so we call it a **vector embedding**.
- Each chunk gets its own embedding.

#### Step 4: Store embeddings in a Vector Database
- A **vector database** is a special kind of database.
- It stores vector embeddings.

##### 🔍 Why a Vector Database (and not a normal one like MongoDB / MySQL)?

| Normal Database | Vector Database |
|---|---|
| Does **keyword-based search** | Does **semantic search** (meaning-based) |
| Searching "heart attack symptoms" → returns only docs containing those exact keywords | Searching "heart attack symptoms" → also returns docs about "cardiac arrest" because the **meaning** is similar |

This is why vector databases are special — they understand **meaning**, not just exact words.

✅ **End result of ingestion:** A "knowledge base" filled with chunks + their embeddings.

---

### 🔹 Part B — The Retrieval Pipeline

This is what happens when a user actually asks a question.

#### Step 1: User creates a query
- User asks something.
- We convert this query into an embedding using the **same embedding API** used during ingestion.

#### Step 2: Retrieval
- Using the query embedding, we search the vector database for **matching chunks**.
- We use **semantic similarity search**.
- Example: query "heart attack symptoms" → retrieves "cardiac arrest" related chunks too.
- These extracted chunks = our **context**.

#### Step 3: Augmentation
- Instead of sending only the query to the LLM, we send a **complete prompt** = Original query + Context (retrieved chunks).
- This step of *adding context to the prompt* is called **augmentation**.

#### Step 4: Generation
- The LLM finally generates the answer using the augmented prompt.
- Answer is returned to the user.

### 💡 So now the name makes sense:
**RAG = Retrieval-Augmented Generation**

- **Generation** → because the LLM generates the answer.
- **Retrieval-Augmented** → because before generating, we retrieve context and augment the prompt with it.

---

## 6. Technical Implementation — 3 Things That Matter Most

When we actually build a RAG pipeline, three choices matter a lot:

1. **Chunking strategy**
2. **Embedding model**
3. **Vector database**

---

### 🧩 Chunking Strategies

#### 1. Fixed-Size Chunking
- Split text into fixed-size pieces (e.g., new chunk every 500 tokens).
- ✅ Simple to implement.
- ❌ Drawback: can break a sentence in the middle → context gets cut off.

#### 2. Hierarchical Chunking
- Create chunks based on **sections / paragraphs / sentences**.
- More complex to implement.
- ✅ Very popular in **production-level systems**.

#### 3. Semantic Chunking
- Create chunks based on **meaning**.
- A new chunk starts whenever a **new topic** appears.
- Slower to compute.
- ✅ Produces **high-quality** chunks.

#### Popular libraries for chunking:
- **LangChain**
- **LlamaIndex**
- **Haystack**

---

### 🔢 Popular Embedding Models

- **OpenAI** → `text-embedding-3`
- **Gemini** → Gemini Embeddings
- **Hugging Face** → Sentence Transformers

---

### 🗄️ Popular Vector Databases

- **Chroma DB**
- **FAISS**
- **Pinecone**
- **Elasticsearch**
- …and many more

---

## 7. Top 7 RAG Architectures Used in Industry

### 1️⃣ Naive / Standard RAG
- The basic version we just discussed.
- User query → embedding → retrieve top chunks → augment → generate.
- **Complexity:** Low
- **Best for:** FAQs on a website, simple support chatbots with clean documentation.

---

### 2️⃣ Hybrid RAG
- Standard RAG uses **only vector (semantic) search** → great for meaning, but **weak for exact matches** (IDs, names, industry-specific terms).
- Hybrid RAG combines:
  - **Vector search** (meaning) +
  - **Keyword search** (exact match)
- 👉 Best of both worlds.
- **Best for:** Enterprise search, e-commerce search.
- ✅ Very common in real production systems.

---

### 3️⃣ RAG with Memory
- Standard RAG **does not remember** past conversations.
- Example: If a user says "Can you explain more about it?" → standard RAG won't know what "it" refers to.
- RAG with Memory adds a **memory layer** on top of the architecture to keep a running thread of the conversation.
- **Best for:** Support assistants and chatbots.

---

### 4️⃣ Graph RAG
- Standard RAG treats data as **independent chunks** → relationships between entities are lost.
- Graph RAG **preserves relationships** by structuring data as a **knowledge graph**.
  - **Nodes** = different entities in your data
  - **Edges** = relationships between them
- (Same idea as graph databases like **Neo4j**.)
- **Complexity:** High
- **Best for:** Fraud detection, legal, research → i.e., **knowledge-heavy systems** with lots of interrelated terms.

---

### 5️⃣ Agentic RAG
- Some user queries can't be solved by **just one retrieval**.
- Example query: *"Can you explain the price hike of gold in 2025 and compare it with other metals?"*
  - System needs to find: when the price hike happened, why it happened, AND compare with other metals.
  - = Multiple retrievals + maybe extra tools (web search, finance APIs).
- Agentic RAG handles **multi-step queries** with **multiple retrievals** and **tool access**.
- The system has some level of **autonomy** to complete the task.

---

### 6️⃣ Multimodal RAG
- Standard RAG works only on **text**.
- Multimodal RAG works on **text + images + videos + audio**.
- **Best for:**
  - Medical industry (X-rays + reports)
  - Surveillance and security

---

### 7️⃣ Self RAG (Self-Reflective RAG)
- Doesn't produce the final answer in one shot.
- It first creates a **draft response**, then:
  - Analyzes its own draft
  - Critiques it
  - Checks: "Is this good enough? Do I need to retrieve more info?"
- Then improves the response before sending it.
- **Best for:** Research-heavy industries and industries with **strong regulations**.

---

## 8. Important Note from the Instructor

> In real production systems, instead of using a single architecture, **multiple architectures are often combined** to improve performance.

---

## 🎯 Quick Recap (For Revision)

| Concept | What it means |
|---|---|
| **LLM** | A model trained on data — generates answers from memory only |
| **RAG** | Technique to give LLMs access to real-time data → better answers |
| **Hallucination** | When an LLM makes up facts |
| **Knowledge cutoff** | The date until which the LLM's training data goes |
| **Chunking** | Breaking data into small pieces |
| **Embedding** | Converting text into numbers (vectors) |
| **Vector DB** | Special DB that supports meaning-based (semantic) search |
| **Augmentation** | Adding retrieved context to the user's query before sending to the LLM |
| **Ingestion Pipeline** | Preparing the knowledge base (the "open book") |
| **Retrieval Pipeline** | Using the knowledge base to answer queries |

---

## 📌 Key Takeaways

1. **RAG = Open-book exam for LLMs.**
2. RAG is a **technique**, not a single technology.
3. **Pipeline = Ingestion + Retrieval.**
4. Vector DBs enable **semantic (meaning-based) search**, unlike normal DBs.
5. RAG → reduces hallucination, keeps data fresh, is cost-effective, and protects privacy.
6. Many architectures exist; the right one depends on the **use case**.
