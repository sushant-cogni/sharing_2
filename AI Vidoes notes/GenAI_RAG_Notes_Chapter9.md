# GenAI & RAG — Full Course Notes
## Chapter 9: LangGraph — Stateful Agent Workflows

---

> AgentExecutor from Chapter 8 works well for simple tasks. But real-world AI systems need more — branching logic, parallel steps, human approval before an action, the ability to pause mid-workflow and resume later, and loops that retry on failure. AgentExecutor cannot do any of this cleanly. LangGraph can. This chapter teaches you to think in graphs and build workflows that are actually production-grade.

---

## 9.1 — The Problem with AgentExecutor

Let us be specific about where AgentExecutor breaks down.

**Problem 1: No branching**

AgentExecutor runs one agent in one ReAct loop. It cannot say "if the user is a premium customer, do this path. If they are a free user, do that path." You cannot branch based on conditions.

**Problem 2: No human-in-the-loop**

Sometimes an AI should not take an action without a human approving it first. For example — an agent about to send an email to 10,000 customers, or delete a database record. AgentExecutor has no built-in way to pause and wait for human approval.

**Problem 3: No persistent state**

If your server restarts mid-workflow, AgentExecutor loses everything. No way to resume from where it stopped.

**Problem 4: No parallel execution**

If you want to run two research tasks at the same time and combine the results, AgentExecutor does them one after another.

**Problem 5: Hard to debug**

When a complex 10-step agent fails at step 7, AgentExecutor gives you limited visibility into what went wrong and why.

**LangGraph solves all five of these.** It models your workflow as a graph — nodes are steps, edges are transitions. You get full control over flow, state, branching, and checkpointing.

---

## 9.2 — Core Concepts: Graphs, Nodes, Edges, State

Before code, understand these four concepts.

---

### State

State is a shared data object that every node in the graph can read from and write to. Think of it as a shared notepad that gets passed around between steps.

```
State = {
    "messages": [...],          # Conversation history
    "documents": [...],         # Retrieved documents
    "query": "...",             # Current query
    "answer": "...",            # Generated answer
    "retry_count": 0            # How many times we have retried
}
```

Every node receives the current state, does its work, and returns an updated state.

---

### Nodes

A node is a function. It receives the current state, does something (calls an LLM, runs a tool, formats data), and returns updated state values.

```python
def retrieve_node(state):
    # Read from state
    query = state["query"]
    
    # Do work
    documents = retriever.invoke(query)
    
    # Return updated state
    return {"documents": documents}
```

---

### Edges

Edges connect nodes. They define the flow — after this node runs, which node runs next.

There are two types:

**Normal edge** — always goes from A to B.
```python
graph.add_edge("retrieve", "generate")
# After retrieve always runs generate
```

**Conditional edge** — decides which node to go to based on the current state.
```python
graph.add_conditional_edges(
    "grade_documents",          # From this node
    decide_next_step,           # This function looks at state and returns next node name
    {
        "good": "generate",     # If function returns "good" → go to generate
        "bad": "rewrite_query"  # If function returns "bad" → go to rewrite_query
    }
)
```

---

### Special Nodes: START and END

Every graph has a `START` node (entry point) and an `END` node (exit point).

```python
from langgraph.graph import START, END

graph.add_edge(START, "first_node")   # Graph starts at first_node
graph.add_edge("last_node", END)      # Graph ends after last_node
```

---

## 9.3 — Install LangGraph

```bash
pip install langgraph langchain-openai langchain-anthropic
pip install langgraph-checkpoint-sqlite  # For persistent checkpointing
```

---

## 9.4 — Your First Graph: Simple Q&A

Start with the simplest possible graph — one that just calls an LLM and returns the answer. This teaches the structure before complexity is added.

```python
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, START, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage
import operator
from dotenv import load_dotenv

load_dotenv()

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)

# Step 1: Define the State
# TypedDict makes the state typed — you know what fields exist
class SimpleState(TypedDict):
    messages: Annotated[list, operator.add]  # operator.add means messages accumulate
    # (new messages are added to existing ones, not replaced)

# Step 2: Define nodes (functions)
def call_llm(state: SimpleState) -> dict:
    """Send messages to LLM and get a response."""
    response = llm.invoke(state["messages"])
    return {"messages": [response]}  # Add the response to messages

# Step 3: Build the graph
builder = StateGraph(SimpleState)

# Add nodes
builder.add_node("llm", call_llm)

# Add edges
builder.add_edge(START, "llm")    # Start → LLM
builder.add_edge("llm", END)      # LLM → End

# Compile the graph
graph = builder.compile()

# Step 4: Run the graph
result = graph.invoke({
    "messages": [HumanMessage(content="What is RAG in simple terms?")]
})

print(result["messages"][-1].content)
```

This is the simplest possible graph. One node, two edges. But it shows the full structure.

---

## 9.5 — A Real Graph: RAG Pipeline

Now build a full RAG pipeline as a graph. This is the same RAG you built in Chapter 5 and 7 — but now as a proper graph where each step is a node.

```python
from typing import TypedDict, Annotated, List
from langgraph.graph import StateGraph, START, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage
from langchain_chroma import Chroma
from langchain_community.embeddings import FastEmbedEmbeddings
from langchain_core.documents import Document
import operator
from dotenv import load_dotenv

load_dotenv()

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
embeddings = FastEmbedEmbeddings(model_name="BAAI/bge-small-en-v1.5")
vectorstore = Chroma(
    persist_directory="./rag_vectorstore",
    embedding_function=embeddings
)
retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

# ── STATE ─────────────────────────────────────────────

class RAGState(TypedDict):
    question: str                              # The user's question
    documents: List[Document]                  # Retrieved documents
    generation: str                            # The LLM's answer
    messages: Annotated[list, operator.add]    # Full conversation history

# ── NODES ─────────────────────────────────────────────

def retrieve(state: RAGState) -> dict:
    """Retrieve relevant documents for the question."""
    print("--- NODE: retrieve ---")
    question = state["question"]
    docs = retriever.invoke(question)
    print(f"Retrieved {len(docs)} documents")
    return {"documents": docs}


def generate(state: RAGState) -> dict:
    """Generate an answer from the retrieved documents."""
    print("--- NODE: generate ---")
    question = state["question"]
    docs = state["documents"]
    
    context = "\n\n".join([
        f"[Source: {d.metadata.get('source', 'unknown')}, Page: {d.metadata.get('page', '?')}]\n{d.page_content}"
        for d in docs
    ])
    
    prompt = f"""Answer the question using ONLY the context below.
If the answer is not in the context, say "I could not find this in the documents."

CONTEXT:
{context}

QUESTION: {question}
ANSWER:"""
    
    response = llm.invoke([HumanMessage(content=prompt)])
    print(f"Generated answer: {response.content[:100]}...")
    
    return {
        "generation": response.content,
        "messages": [HumanMessage(content=question), AIMessage(content=response.content)]
    }


# ── BUILD GRAPH ───────────────────────────────────────

builder = StateGraph(RAGState)

builder.add_node("retrieve", retrieve)
builder.add_node("generate", generate)

builder.add_edge(START, "retrieve")
builder.add_edge("retrieve", "generate")
builder.add_edge("generate", END)

rag_graph = builder.compile()

# ── RUN ───────────────────────────────────────────────

result = rag_graph.invoke({
    "question": "What is the return policy for electronics?",
    "documents": [],
    "generation": "",
    "messages": []
})

print("\n" + "="*50)
print("ANSWER:", result["generation"])
```

This is the same RAG but now each step is clearly a separate node. This is the foundation for adding branching, retrying, and human approval next.

---

## 9.6 — Conditional Edges: Branching Logic

Now add the CRAG pattern from Chapter 8 — but properly, using conditional edges.

After retrieving, the graph grades the documents. If they are relevant, it generates. If not, it rewrites the query and retrieves again.

```python
from typing import TypedDict, Annotated, List, Literal
from langgraph.graph import StateGraph, START, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.documents import Document
from langchain_chroma import Chroma
from langchain_community.embeddings import FastEmbedEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import operator
from dotenv import load_dotenv

load_dotenv()

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
parser = StrOutputParser()
embeddings = FastEmbedEmbeddings(model_name="BAAI/bge-small-en-v1.5")
vectorstore = Chroma(persist_directory="./rag_vectorstore", embedding_function=embeddings)
retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

# ── STATE ─────────────────────────────────────────────

class CRAGState(TypedDict):
    question: str
    documents: List[Document]
    generation: str
    retry_count: int              # Track how many times we have retried
    messages: Annotated[list, operator.add]

# ── NODES ─────────────────────────────────────────────

def retrieve(state: CRAGState) -> dict:
    print(f"--- NODE: retrieve (attempt {state.get('retry_count', 0) + 1}) ---")
    docs = retriever.invoke(state["question"])
    return {"documents": docs}


def grade_documents(state: CRAGState) -> dict:
    """Grade whether retrieved documents are relevant."""
    print("--- NODE: grade_documents ---")
    question = state["question"]
    docs = state["documents"]
    
    grade_prompt = ChatPromptTemplate.from_template("""
You are grading document relevance.
Question: {question}
Document: {document}
Is this document relevant to the question? Return ONLY 'yes' or 'no'.
""")
    
    grader = grade_prompt | llm | parser
    
    # Grade each document
    relevant_docs = []
    for doc in docs:
        grade = grader.invoke({
            "question": question,
            "document": doc.page_content
        }).strip().lower()
        
        if grade == "yes":
            relevant_docs.append(doc)
    
    print(f"Relevant docs: {len(relevant_docs)}/{len(docs)}")
    return {"documents": relevant_docs}


def rewrite_query(state: CRAGState) -> dict:
    """Rewrite the query to get better retrieval results."""
    print("--- NODE: rewrite_query ---")
    question = state["question"]
    
    rewrite = (
        ChatPromptTemplate.from_template(
            "Rewrite this search query to find more relevant documents. "
            "Return ONLY the rewritten query.\n\nOriginal: {question}"
        )
        | llm
        | parser
    )
    
    new_question = rewrite.invoke({"question": question}).strip()
    print(f"Rewritten: '{question}' → '{new_question}'")
    
    return {
        "question": new_question,
        "retry_count": state.get("retry_count", 0) + 1
    }


def generate(state: CRAGState) -> dict:
    """Generate answer from relevant documents."""
    print("--- NODE: generate ---")
    docs = state["documents"]
    question = state["question"]
    
    if not docs:
        answer = "I could not find relevant information to answer your question."
        return {"generation": answer, "messages": [AIMessage(content=answer)]}
    
    context = "\n\n".join([d.page_content for d in docs])
    prompt = f"Answer based only on this context:\n{context}\n\nQuestion: {question}\nAnswer:"
    
    response = llm.invoke([HumanMessage(content=prompt)])
    return {
        "generation": response.content,
        "messages": [AIMessage(content=response.content)]
    }


# ── CONDITIONAL LOGIC ─────────────────────────────────

def decide_after_grading(state: CRAGState) -> Literal["generate", "rewrite_query"]:
    """
    Decision function: called after grade_documents.
    Returns the name of the next node to run.
    """
    docs = state["documents"]
    retry_count = state.get("retry_count", 0)
    
    if docs:
        # We have relevant documents — generate the answer
        print("--- DECISION: documents are relevant → generate ---")
        return "generate"
    
    if retry_count >= 2:
        # We have retried too many times — generate anyway (will say "not found")
        print("--- DECISION: max retries reached → generate ---")
        return "generate"
    
    # No relevant documents and we can still retry
    print("--- DECISION: no relevant docs → rewrite_query ---")
    return "rewrite_query"


# ── BUILD GRAPH ───────────────────────────────────────

builder = StateGraph(CRAGState)

builder.add_node("retrieve", retrieve)
builder.add_node("grade_documents", grade_documents)
builder.add_node("rewrite_query", rewrite_query)
builder.add_node("generate", generate)

# Edges
builder.add_edge(START, "retrieve")
builder.add_edge("retrieve", "grade_documents")

# Conditional edge — decision function decides next node
builder.add_conditional_edges(
    "grade_documents",       # After this node
    decide_after_grading,    # Call this function
    {
        "generate": "generate",           # If returns "generate" → go to generate
        "rewrite_query": "rewrite_query"  # If returns "rewrite_query" → go there
    }
)

# After rewriting, try retrieving again
builder.add_edge("rewrite_query", "retrieve")

builder.add_edge("generate", END)

crag_graph = builder.compile()

# ── RUN ───────────────────────────────────────────────

result = crag_graph.invoke({
    "question": "What is the cancellation policy?",
    "documents": [],
    "generation": "",
    "retry_count": 0,
    "messages": []
})

print("\nFINAL ANSWER:", result["generation"])
```

Notice the loop: `retrieve → grade → (if bad) → rewrite → retrieve → grade → ...`

This is something you simply cannot do with AgentExecutor. LangGraph makes loops like this clean and controllable.

---

## 9.7 — Visualizing Your Graph

LangGraph can draw your graph structure so you can see exactly what you built.

```python
# Requires: pip install pygraphviz
# Or use the ASCII representation

# View as ASCII
print(crag_graph.get_graph().draw_ascii())

# Or generate a PNG (requires graphviz installed)
try:
    img = crag_graph.get_graph().draw_mermaid_png()
    with open("crag_graph.png", "wb") as f:
        f.write(img)
    print("Graph saved as crag_graph.png")
except Exception:
    # If graphviz not installed, print mermaid syntax instead
    print(crag_graph.get_graph().draw_mermaid())
```

The mermaid output looks like:
```
graph TD
    __start__ --> retrieve
    retrieve --> grade_documents
    grade_documents -->|generate| generate
    grade_documents -->|rewrite_query| rewrite_query
    rewrite_query --> retrieve
    generate --> __end__
```

Always visualize your graph while building. It makes it immediately clear if the flow is wrong.

---

## 9.8 — Checkpointing: Saving State Mid-Workflow

**The problem:** Your server restarts. Or the workflow pauses for human approval. Or a step fails halfway through. Without checkpointing, everything is lost and you start over.

**Checkpointing** saves the graph state after every node. If something interrupts, you can resume from exactly where it stopped.

```python
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph, START, END
from typing import TypedDict, Annotated
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage
import operator
from dotenv import load_dotenv

load_dotenv()

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)

class ChatState(TypedDict):
    messages: Annotated[list, operator.add]

def call_llm(state: ChatState) -> dict:
    response = llm.invoke(state["messages"])
    return {"messages": [response]}

# Create graph with checkpointer
builder = StateGraph(ChatState)
builder.add_node("llm", call_llm)
builder.add_edge(START, "llm")
builder.add_edge("llm", END)

# MemorySaver stores state in memory (use SqliteSaver for persistence across restarts)
checkpointer = MemorySaver()
graph = builder.compile(checkpointer=checkpointer)

# thread_id identifies a specific conversation thread
# Same thread_id = same conversation, history is remembered automatically
config = {"configurable": {"thread_id": "user_123_session_1"}}

# First message
result1 = graph.invoke(
    {"messages": [HumanMessage(content="My name is Arjun.")]},
    config=config
)
print("Turn 1:", result1["messages"][-1].content)

# Second message — graph remembers the first message automatically
result2 = graph.invoke(
    {"messages": [HumanMessage(content="What is my name?")]},
    config=config
)
print("Turn 2:", result2["messages"][-1].content)
# Output: Your name is Arjun.

# You can check the saved state at any time
state = graph.get_state(config)
print(f"\nTotal messages in state: {len(state.values['messages'])}")
```

**Using SQLite for persistence across server restarts:**

```python
from langgraph.checkpoint.sqlite import SqliteSaver
import sqlite3

# State persists even if server restarts
conn = sqlite3.connect("./checkpoints.db", check_same_thread=False)
checkpointer = SqliteSaver(conn)

graph = builder.compile(checkpointer=checkpointer)
```

Now if your server restarts, the conversation history is still there. Resume with the same `thread_id`.

---

## 9.9 — Human-in-the-Loop

This is one of LangGraph's most powerful features. You can pause the graph at any node, wait for a human to approve or modify something, and then continue.

**Use cases:**
- Agent is about to send an email to 1000 people → pause for human approval
- Agent is about to delete a record → pause for confirmation
- Agent generates a document → pause for human review before publishing

```python
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph, START, END
from langgraph.types import interrupt, Command
from typing import TypedDict, Annotated
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage
import operator
from dotenv import load_dotenv

load_dotenv()

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

class ApprovalState(TypedDict):
    task: str                              # What the agent is asked to do
    plan: str                              # The plan the agent came up with
    human_approved: bool                   # Whether human approved
    result: str                            # Final result
    messages: Annotated[list, operator.add]

def create_plan(state: ApprovalState) -> dict:
    """Agent creates a plan for the task."""
    print("--- NODE: create_plan ---")
    response = llm.invoke([
        HumanMessage(content=f"Create a brief action plan for this task: {state['task']}\nBe specific about what actions will be taken.")
    ])
    plan = response.content
    print(f"Plan created:\n{plan}")
    return {"plan": plan}


def human_approval(state: ApprovalState) -> dict:
    """
    PAUSE HERE and wait for human input.
    The interrupt() call pauses the graph and returns control to your code.
    """
    print("--- NODE: human_approval ---")
    print("\n" + "="*50)
    print("HUMAN REVIEW REQUIRED")
    print("="*50)
    print(f"Task: {state['task']}")
    print(f"\nProposed Plan:\n{state['plan']}")
    print("="*50)
    
    # interrupt() pauses the graph here
    # The value passed to interrupt() is sent back to your calling code
    # The graph waits until you resume it with a Command
    human_response = interrupt({
        "question": "Do you approve this plan?",
        "plan": state["plan"],
        "task": state["task"]
    })
    
    # human_response contains whatever value you passed when resuming
    approved = human_response.lower() in ["yes", "y", "approve", "approved"]
    
    return {"human_approved": approved}


def execute_plan(state: ApprovalState) -> dict:
    """Execute the plan if approved, or abort if not."""
    print("--- NODE: execute_plan ---")
    
    if not state["human_approved"]:
        result = "Plan was not approved by human. Task aborted."
        print(result)
        return {"result": result}
    
    # Execute the plan (in real life this does actual work)
    response = llm.invoke([
        HumanMessage(content=f"Execute this plan and report what was done:\n{state['plan']}")
    ])
    result = response.content
    print(f"Execution complete: {result[:100]}...")
    return {"result": result}


def decide_after_approval(state: ApprovalState) -> str:
    """Always go to execute — but execute checks the approval flag."""
    return "execute_plan"

# Build graph
checkpointer = MemorySaver()
builder = StateGraph(ApprovalState)

builder.add_node("create_plan", create_plan)
builder.add_node("human_approval", human_approval)
builder.add_node("execute_plan", execute_plan)

builder.add_edge(START, "create_plan")
builder.add_edge("create_plan", "human_approval")
builder.add_edge("human_approval", "execute_plan")
builder.add_edge("execute_plan", END)

graph = builder.compile(checkpointer=checkpointer)

# ── RUNNING WITH HUMAN-IN-THE-LOOP ────────────────────

config = {"configurable": {"thread_id": "approval_task_1"}}

# Start the graph
print("Starting workflow...")
result = graph.invoke(
    {
        "task": "Send a promotional email to all 5000 customers about the new sale",
        "plan": "",
        "human_approved": False,
        "result": "",
        "messages": []
    },
    config=config
)

# Graph pauses at human_approval node
# result will have an __interrupt__ key
print("\nGraph paused for human input.")
print("Interrupt data:", result.get("__interrupt__"))

# ── HUMAN REVIEWS AND RESPONDS ────────────────────────

# Get human input (in a web app this would be a button click)
human_input = input("\nDo you approve this plan? (yes/no): ").strip()

# Resume the graph with the human's response
print("\nResuming workflow with human decision...")
final_result = graph.invoke(
    Command(resume=human_input),  # Resume with human's input
    config=config                 # Same thread_id — continues from where it paused
)

print("\n" + "="*50)
print("FINAL RESULT:")
print(final_result["result"])
```

This pattern is used everywhere in production AI — any time an AI takes a significant action, you want a human to verify it first.

---

## 9.10 — Parallel Nodes

Run multiple steps at the same time and combine the results.

```python
from langgraph.graph import StateGraph, START, END
from typing import TypedDict, Annotated, List
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
import operator
from dotenv import load_dotenv

load_dotenv()

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.3)

class ParallelResearchState(TypedDict):
    topic: str
    technical_summary: str
    business_summary: str
    audience_summary: str
    final_report: str

# Three parallel research nodes
def research_technical(state: ParallelResearchState) -> dict:
    """Research the technical aspects of the topic."""
    print("--- NODE: research_technical (running in parallel) ---")
    response = llm.invoke([
        HumanMessage(content=f"Summarize the technical aspects of: {state['topic']}. 3 sentences only.")
    ])
    return {"technical_summary": response.content}


def research_business(state: ParallelResearchState) -> dict:
    """Research the business aspects of the topic."""
    print("--- NODE: research_business (running in parallel) ---")
    response = llm.invoke([
        HumanMessage(content=f"Summarize the business impact of: {state['topic']}. 3 sentences only.")
    ])
    return {"business_summary": response.content}


def research_audience(state: ParallelResearchState) -> dict:
    """Research who uses this and why."""
    print("--- NODE: research_audience (running in parallel) ---")
    response = llm.invoke([
        HumanMessage(content=f"Who uses {state['topic']} and why? 3 sentences only.")
    ])
    return {"audience_summary": response.content}


def combine_research(state: ParallelResearchState) -> dict:
    """Combine all research into a final report."""
    print("--- NODE: combine_research ---")
    
    prompt = f"""Write a structured report on: {state['topic']}

Technical Overview:
{state['technical_summary']}

Business Impact:
{state['business_summary']}

Who Uses It:
{state['audience_summary']}

Combine these into a cohesive 3-paragraph report."""
    
    response = llm.invoke([HumanMessage(content=prompt)])
    return {"final_report": response.content}


# Build parallel graph
builder = StateGraph(ParallelResearchState)

builder.add_node("research_technical", research_technical)
builder.add_node("research_business", research_business)
builder.add_node("research_audience", research_audience)
builder.add_node("combine_research", combine_research)

# START branches to all three in parallel
builder.add_edge(START, "research_technical")
builder.add_edge(START, "research_business")
builder.add_edge(START, "research_audience")

# All three must complete before combine_research
builder.add_edge("research_technical", "combine_research")
builder.add_edge("research_business", "combine_research")
builder.add_edge("research_audience", "combine_research")

builder.add_edge("combine_research", END)

parallel_graph = builder.compile()

result = parallel_graph.invoke({
    "topic": "Retrieval-Augmented Generation (RAG)",
    "technical_summary": "",
    "business_summary": "",
    "audience_summary": "",
    "final_report": ""
})

print("\nFINAL REPORT:")
print(result["final_report"])
```

All three research nodes run at the same time. `combine_research` only runs after all three finish. This is much faster than running them sequentially.

---

## 9.11 — RAG Workflow with Self-Reflection

Combine everything — retrieval, grading, rewriting, generation, and then self-reflection where the model checks its own answer before returning it.

```python
from typing import TypedDict, Annotated, List, Literal
from langgraph.graph import StateGraph, START, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.documents import Document
from langchain_chroma import Chroma
from langchain_community.embeddings import FastEmbedEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import operator
from dotenv import load_dotenv

load_dotenv()

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
parser = StrOutputParser()
embeddings = FastEmbedEmbeddings(model_name="BAAI/bge-small-en-v1.5")
vectorstore = Chroma(persist_directory="./rag_vectorstore", embedding_function=embeddings)
retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

class ReflectiveRAGState(TypedDict):
    question: str
    documents: List[Document]
    generation: str
    is_grounded: bool         # Is the answer grounded in the documents?
    is_useful: bool           # Does the answer actually answer the question?
    retry_count: int
    messages: Annotated[list, operator.add]

# Nodes
def retrieve(state):
    print("--- retrieve ---")
    return {"documents": retriever.invoke(state["question"])}

def generate(state):
    print("--- generate ---")
    context = "\n\n".join([d.page_content for d in state["documents"]])
    prompt = f"Answer based on context only:\n{context}\n\nQuestion: {state['question']}\nAnswer:"
    response = llm.invoke([HumanMessage(content=prompt)])
    return {"generation": response.content}

def grade_groundedness(state):
    """Check: is the answer supported by the documents?"""
    print("--- grade_groundedness ---")
    grader = (
        ChatPromptTemplate.from_template("""
Is this answer fully supported by the context? No outside information?
Context: {context}
Answer: {answer}
Reply ONLY 'yes' or 'no'.""")
        | llm | parser
    )
    context = "\n".join([d.page_content for d in state["documents"]])
    result = grader.invoke({"context": context, "answer": state["generation"]}).strip().lower()
    print(f"Grounded: {result}")
    return {"is_grounded": result == "yes"}

def grade_usefulness(state):
    """Check: does the answer actually answer the question?"""
    print("--- grade_usefulness ---")
    grader = (
        ChatPromptTemplate.from_template("""
Does this answer address the question?
Question: {question}
Answer: {answer}
Reply ONLY 'yes' or 'no'.""")
        | llm | parser
    )
    result = grader.invoke({
        "question": state["question"],
        "answer": state["generation"]
    }).strip().lower()
    print(f"Useful: {result}")
    return {"is_useful": result == "yes"}

# Decision functions
def decide_after_groundedness(state) -> Literal["grade_usefulness", "generate"]:
    if state["is_grounded"]:
        return "grade_usefulness"
    print("Not grounded — regenerating")
    return "generate"  # Try generating again

def decide_after_usefulness(state) -> Literal["end_success", "retrieve"]:
    if state["is_useful"]:
        return "end_success"
    if state.get("retry_count", 0) >= 2:
        print("Max retries — ending anyway")
        return "end_success"
    print("Not useful — retrieving with different approach")
    return "retrieve"

def mark_success(state):
    print("--- SUCCESS ---")
    return {"retry_count": state.get("retry_count", 0)}

def increment_retry(state):
    return {"retry_count": state.get("retry_count", 0) + 1}

# Build
builder = StateGraph(ReflectiveRAGState)
builder.add_node("retrieve", retrieve)
builder.add_node("generate", generate)
builder.add_node("grade_groundedness", grade_groundedness)
builder.add_node("grade_usefulness", grade_usefulness)
builder.add_node("end_success", mark_success)

builder.add_edge(START, "retrieve")
builder.add_edge("retrieve", "generate")
builder.add_edge("generate", "grade_groundedness")

builder.add_conditional_edges("grade_groundedness", decide_after_groundedness, {
    "grade_usefulness": "grade_usefulness",
    "generate": "generate"
})
builder.add_conditional_edges("grade_usefulness", decide_after_usefulness, {
    "end_success": "end_success",
    "retrieve": "retrieve"
})
builder.add_edge("end_success", END)

reflective_rag = builder.compile()

# Run
result = reflective_rag.invoke({
    "question": "What is the return window for electronics?",
    "documents": [],
    "generation": "",
    "is_grounded": False,
    "is_useful": False,
    "retry_count": 0,
    "messages": []
})

print("\nFINAL ANSWER:")
print(result["generation"])
```

---

## 9.12 — Project: Approval Workflow Agent

Build an agent that:
1. Receives a task
2. Researches it using RAG + web search
3. Creates a detailed action plan
4. Pauses for human approval
5. Executes only if approved
6. Reports what was done

Everything you need is in this chapter. The key parts:
- Use the CRAG graph from section 9.6 for research
- Add a `human_approval` node with `interrupt()`
- Use `MemorySaver` or `SqliteSaver` for checkpointing
- Resume with `Command(resume=human_input)`

```python
# Starter structure
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import interrupt, Command
from typing import TypedDict, Annotated
import operator

class WorkflowState(TypedDict):
    task: str
    research: str       # What was found during research
    plan: str           # Detailed action plan
    approved: bool
    execution_log: str
    messages: Annotated[list, operator.add]

# Your nodes:
# 1. research_task → searches docs + web, returns research
# 2. create_plan → uses research to create detailed plan  
# 3. human_approval → interrupt() here, wait for input
# 4. execute_or_abort → if approved, execute; else abort
# 5. report → summarize what was done

# Edges:
# START → research → plan → approval → execute_or_abort → report → END
# approval uses interrupt() — graph pauses here until resumed
```

---

## Chapter 9 Summary

| Concept | What it means | When to use |
|---|---|---|
| State | Shared data passed between all nodes | Always — it is the backbone |
| Node | A function that reads state and returns updates | Each distinct step in your workflow |
| Normal edge | Always goes A → B | Fixed sequential flow |
| Conditional edge | Decision function picks next node | Branching, routing, retrying |
| Parallel edges | Multiple nodes start at once | Independent steps that can run simultaneously |
| Checkpointing | Saves state after every node | Any multi-turn or long-running workflow |
| `interrupt()` | Pauses graph, waits for human | Before any significant irreversible action |
| `Command(resume=...)` | Resumes a paused graph | After human provides input |
| `thread_id` | Identifies a conversation thread | Multi-user apps, separate conversations |

**Key mental model:** Think of your workflow as a flowchart. Each box is a node. Each arrow is an edge. Decision diamonds are conditional edges. That flowchart is your LangGraph.

---

## What Is Coming Next

**Chapter 10 — Multi-Agent Systems**

One agent handles one task. Complex real-world problems need multiple specialized agents working together — one researches, one writes, one reviews, one publishes. LangGraph is the perfect tool for this because you can build each agent as its own subgraph and connect them. Chapter 10 shows exactly how to do this, including how agents communicate, how an orchestrator manages them, and how to handle failures across a multi-agent system.

---

*End of Chapter 9*
