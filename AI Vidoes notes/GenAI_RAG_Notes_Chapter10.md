# GenAI & RAG — Full Course Notes
## Chapter 10: Multi-Agent Systems

---

> One agent is good. Multiple specialized agents working together are powerful. A single agent trying to research, write, review, and publish a document is like asking one person to be an expert in everything. Multi-agent systems split the work — one agent researches, one writes, one reviews, one publishes. Each is specialized. An orchestrator manages them. This chapter shows you exactly how to build this.

---

## 10.1 — Why One Agent Is Not Enough

Let us be concrete about where a single agent fails.

**Scenario:** You want to build an AI system that:
1. Researches a topic using documents and web search
2. Writes a detailed article based on the research
3. Reviews the article for accuracy and clarity
4. Rewrites sections that need improvement
5. Formats the final output for publishing

If you build this as one agent, problems appear quickly:

**Problem 1: Context window gets too large**
One agent doing all five steps accumulates massive context — research notes, drafts, review comments, rewrites. It hits the context limit before finishing.

**Problem 2: The agent gets confused**
One agent switching between "researcher mode", "writer mode", and "critic mode" produces worse output than three specialized agents. It is like asking one person to simultaneously be the author and the critic of their own work.

**Problem 3: Hard to retry a specific step**
If the writing step fails, you have to restart everything. With separate agents, you only retry the failed step.

**Problem 4: Cannot run independent steps in parallel**
Research and fact-checking can happen at the same time. One agent must do them sequentially.

**The solution:** Multiple specialized agents. Each is an expert at one thing. An orchestrator manages the flow.

---

## 10.2 — The Two Main Patterns

There are two ways to structure multi-agent systems.

---

### Pattern 1: Supervisor (Orchestrator-Worker)

One supervisor agent receives the task and delegates subtasks to specialized worker agents. The supervisor decides which worker to call next based on what has been done and what remains.

```
          Supervisor
         /    |    \
    Researcher Writer  Reviewer
```

The supervisor is itself an LLM. It reads the task, reads what has been done, and decides which worker to call next.

**When to use it:** When the overall task requires judgment about which specialist to use and in what order. The supervisor's intelligence drives the workflow.

---

### Pattern 2: Sequential Pipeline (Fixed Flow)

Agents run in a fixed sequence. Agent A finishes → Agent B starts → Agent C starts. No central supervisor — the flow is hardcoded.

```
Researcher → Writer → Reviewer → Publisher
```

**When to use it:** When the steps are always the same and the order never changes. Simpler to build and debug.

---

For this chapter you will build both.

---

## 10.3 — Setup

```bash
pip install langgraph langchain-openai langchain-community
pip install langchain-chroma fastembed
```

---

## 10.4 — Building Specialized Agents

First build the individual agents. Each is a small LangGraph graph.

```python
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.tools import tool
from langchain_community.tools import DuckDuckGoSearchRun
from langchain_chroma import Chroma
from langchain_community.embeddings import FastEmbedEmbeddings
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from dotenv import load_dotenv

load_dotenv()

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.3)
embeddings = FastEmbedEmbeddings(model_name="BAAI/bge-small-en-v1.5")

# ── SHARED TOOLS ──────────────────────────────────────

web_search = DuckDuckGoSearchRun()

try:
    vectorstore = Chroma(
        persist_directory="./rag_vectorstore",
        embedding_function=embeddings
    )
    rag_retriever = vectorstore.as_retriever(search_kwargs={"k": 4})
except Exception:
    rag_retriever = None

@tool
def search_internal_knowledge(query: str) -> str:
    """Search internal company documents and knowledge base for relevant information."""
    if rag_retriever is None:
        return "Internal knowledge base not available."
    docs = rag_retriever.invoke(query)
    if not docs:
        return "Nothing found in internal documents."
    return "\n\n".join([
        f"[Internal, p.{d.metadata.get('page','?')}]: {d.page_content[:300]}"
        for d in docs[:3]
    ])

@tool
def search_web(query: str) -> str:
    """Search the web for current information, news, and external data."""
    try:
        return web_search.run(query)
    except Exception as e:
        return f"Web search failed: {str(e)}"

@tool
def calculate(expression: str) -> str:
    """Evaluate a mathematical expression. Input: math expression string."""
    import math
    try:
        allowed = {k: v for k, v in math.__dict__.items() if not k.startswith("_")}
        result = eval(expression, {"__builtins__": {}}, allowed)
        return str(result)
    except Exception as e:
        return f"Calculation error: {str(e)}"


# ── AGENT FACTORY ─────────────────────────────────────

def create_agent(name: str, role: str, tools: list, temperature: float = 0.3):
    """
    Factory function — creates an AgentExecutor with a specific role.
    """
    agent_llm = ChatOpenAI(model="gpt-4o-mini", temperature=temperature)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", f"""You are the {name} agent. Your specific role:

{role}

Focus ONLY on your role. Do your job thoroughly and output clearly structured results.
Do not go beyond your role — another agent will handle the next step."""),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
        MessagesPlaceholder("agent_scratchpad")
    ])
    
    agent = create_tool_calling_agent(agent_llm, tools, prompt)
    executor = AgentExecutor(
        agent=agent,
        tools=tools,
        verbose=False,       # Set True to see each agent's internal thinking
        max_iterations=6,
        handle_parsing_errors=True
    )
    return executor


# ── THE FOUR SPECIALIZED AGENTS ───────────────────────

researcher_agent = create_agent(
    name="Researcher",
    role="""You research topics thoroughly.
- Search both internal documents and the web
- Gather facts, statistics, and key information
- Organize findings into clear bullet points
- Include sources for each fact
- Output: a structured research report with sections""",
    tools=[search_internal_knowledge, search_web],
    temperature=0
)

writer_agent = create_agent(
    name="Writer",
    role="""You write clear, engaging content based on research provided to you.
- Transform research notes into well-structured prose
- Write in a clear, professional tone
- Include an introduction, main sections, and conclusion
- Do NOT add facts not present in the research
- Output: a complete written article""",
    tools=[],  # Writer does not need tools — just LLM
    temperature=0.7
)

reviewer_agent = create_agent(
    name="Reviewer",
    role="""You review written content for quality.
- Check accuracy: are all facts supported by the research?
- Check clarity: is it easy to understand?
- Check completeness: does it cover the topic thoroughly?
- Identify specific sections that need improvement
- Output: a detailed review with APPROVE or REVISE decision, and specific feedback""",
    tools=[],
    temperature=0
)

editor_agent = create_agent(
    name="Editor",
    role="""You make specific improvements to written content based on reviewer feedback.
- Address every point raised by the reviewer
- Keep the overall structure intact
- Improve clarity where flagged
- Fix any accuracy issues
- Output: the improved, final version of the article""",
    tools=[],
    temperature=0.5
)
```

---

## 10.5 — Pattern 1: Sequential Pipeline

The simplest multi-agent pattern — agents run one after another in a fixed order.

```python
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, START, END
import operator

# ── SHARED STATE ──────────────────────────────────────

class ContentPipelineState(TypedDict):
    topic: str               # Input topic
    research: str            # Output from researcher
    draft: str               # Output from writer
    review: str              # Output from reviewer
    final_content: str       # Output from editor
    review_decision: str     # "APPROVE" or "REVISE"
    messages: Annotated[list, operator.add]

# ── NODES: WRAP EACH AGENT ────────────────────────────

def run_researcher(state: ContentPipelineState) -> dict:
    """Node that calls the researcher agent."""
    print("\n" + "="*50)
    print("RESEARCHER AGENT working...")
    
    result = researcher_agent.invoke({
        "input": f"Research this topic thoroughly: {state['topic']}",
        "chat_history": []
    })
    
    research = result["output"]
    print(f"Research complete ({len(research)} chars)")
    return {"research": research}


def run_writer(state: ContentPipelineState) -> dict:
    """Node that calls the writer agent."""
    print("\n" + "="*50)
    print("WRITER AGENT working...")
    
    result = writer_agent.invoke({
        "input": f"""Write a complete article about: {state['topic']}

Use this research as your source material:
{state['research']}

Write a full article with introduction, main sections, and conclusion.""",
        "chat_history": []
    })
    
    draft = result["output"]
    print(f"Draft complete ({len(draft)} chars)")
    return {"draft": draft}


def run_reviewer(state: ContentPipelineState) -> dict:
    """Node that calls the reviewer agent."""
    print("\n" + "="*50)
    print("REVIEWER AGENT working...")
    
    result = reviewer_agent.invoke({
        "input": f"""Review this article about {state['topic']}.

ORIGINAL RESEARCH:
{state['research'][:1000]}...

ARTICLE TO REVIEW:
{state['draft']}

Provide detailed feedback and end with either APPROVE or REVISE.""",
        "chat_history": []
    })
    
    review = result["output"]
    decision = "APPROVE" if "APPROVE" in review.upper() else "REVISE"
    print(f"Review complete. Decision: {decision}")
    return {"review": review, "review_decision": decision}


def run_editor(state: ContentPipelineState) -> dict:
    """Node that calls the editor agent."""
    print("\n" + "="*50)
    print("EDITOR AGENT working...")
    
    result = editor_agent.invoke({
        "input": f"""Improve this article based on the reviewer's feedback.

ORIGINAL DRAFT:
{state['draft']}

REVIEWER FEEDBACK:
{state['review']}

Produce the final improved version.""",
        "chat_history": []
    })
    
    final = result["output"]
    print(f"Editing complete ({len(final)} chars)")
    return {"final_content": final}


def skip_editor(state: ContentPipelineState) -> dict:
    """If reviewer approved, no editing needed."""
    print("\nReviewer approved — skipping editor")
    return {"final_content": state["draft"]}


# ── DECISION: REVISE OR APPROVE ───────────────────────

def decide_after_review(state: ContentPipelineState) -> str:
    if state["review_decision"] == "APPROVE":
        return "approved"
    return "needs_revision"


# ── BUILD SEQUENTIAL PIPELINE ─────────────────────────

builder = StateGraph(ContentPipelineState)

builder.add_node("researcher", run_researcher)
builder.add_node("writer", run_writer)
builder.add_node("reviewer", run_reviewer)
builder.add_node("editor", run_editor)
builder.add_node("skip_editor", skip_editor)

# Fixed sequence
builder.add_edge(START, "researcher")
builder.add_edge("researcher", "writer")
builder.add_edge("writer", "reviewer")

# Branch based on review decision
builder.add_conditional_edges(
    "reviewer",
    decide_after_review,
    {
        "approved": "skip_editor",
        "needs_revision": "editor"
    }
)

builder.add_edge("editor", END)
builder.add_edge("skip_editor", END)

sequential_pipeline = builder.compile()

# ── RUN ───────────────────────────────────────────────

def run_content_pipeline(topic: str) -> dict:
    print(f"\nStarting content pipeline for: '{topic}'")
    print("="*50)
    
    result = sequential_pipeline.invoke({
        "topic": topic,
        "research": "",
        "draft": "",
        "review": "",
        "final_content": "",
        "review_decision": "",
        "messages": []
    })
    
    return result

# result = run_content_pipeline("The impact of RAG systems on enterprise AI")
# print("\nFINAL ARTICLE:")
# print(result["final_content"])
```

---

## 10.6 — Pattern 2: Supervisor (Orchestrator-Worker)

Now build the supervisor pattern. The supervisor is itself an LLM that decides which worker to call next.

```python
from typing import TypedDict, Annotated, Literal
from langgraph.graph import StateGraph, START, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import operator
import json
from dotenv import load_dotenv

load_dotenv()

supervisor_llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
parser = StrOutputParser()

# ── STATE ─────────────────────────────────────────────

class SupervisorState(TypedDict):
    task: str                              # Overall task
    messages: Annotated[list, operator.add]  # All agent outputs accumulate here
    next_agent: str                        # Which agent to call next
    completed_steps: list                  # What has been done so far
    final_output: str                      # Final result

# ── SUPERVISOR NODE ───────────────────────────────────

WORKERS = ["researcher", "writer", "reviewer", "editor", "FINISH"]

SUPERVISOR_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are a supervisor managing a content creation team.
Your workers are: {workers}

Based on the task and what has been done so far, decide which worker should act next.
When the task is complete, return FINISH.

Rules:
- researcher must always run before writer
- writer must run before reviewer  
- reviewer must run before editor (if revision needed)
- Return FINISH when content is complete and approved

Return ONLY a JSON object with one key "next" and the worker name as value.
Example: {{"next": "researcher"}} or {{"next": "FINISH"}}"""),
    ("human", """Task: {task}

Completed steps: {completed_steps}

Recent outputs:
{recent_outputs}

Which worker should act next?""")
])

def supervisor_node(state: SupervisorState) -> dict:
    """The supervisor decides which agent to run next."""
    print("\n--- SUPERVISOR deciding ---")
    
    # Get recent messages for context
    recent = state["messages"][-3:] if state["messages"] else []
    recent_text = "\n".join([
        f"{m.type.upper()}: {m.content[:200]}..."
        for m in recent
    ]) if recent else "No work done yet."
    
    response = (SUPERVISOR_PROMPT | supervisor_llm | parser).invoke({
        "workers": ", ".join(WORKERS),
        "task": state["task"],
        "completed_steps": state.get("completed_steps", []),
        "recent_outputs": recent_text
    })
    
    try:
        decision = json.loads(response.strip())
        next_agent = decision.get("next", "FINISH")
    except json.JSONDecodeError:
        # Fallback: parse the response directly
        next_agent = "FINISH"
        for worker in WORKERS:
            if worker.lower() in response.lower():
                next_agent = worker
                break
    
    print(f"Supervisor decision: → {next_agent}")
    return {"next_agent": next_agent}


# ── WORKER NODES ──────────────────────────────────────

def researcher_node(state: SupervisorState) -> dict:
    print("\n--- RESEARCHER working ---")
    result = researcher_agent.invoke({
        "input": f"Research this topic: {state['task']}",
        "chat_history": []
    })
    msg = AIMessage(content=f"RESEARCH RESULTS:\n{result['output']}", name="researcher")
    completed = state.get("completed_steps", []) + ["research"]
    return {"messages": [msg], "completed_steps": completed}


def writer_node(state: SupervisorState) -> dict:
    print("\n--- WRITER working ---")
    
    # Find research from messages
    research = ""
    for msg in state["messages"]:
        if hasattr(msg, "name") and msg.name == "researcher":
            research = msg.content
            break
    
    result = writer_agent.invoke({
        "input": f"Write an article about '{state['task']}' using this research:\n{research}",
        "chat_history": []
    })
    msg = AIMessage(content=f"DRAFT ARTICLE:\n{result['output']}", name="writer")
    completed = state.get("completed_steps", []) + ["writing"]
    return {"messages": [msg], "completed_steps": completed}


def reviewer_node(state: SupervisorState) -> dict:
    print("\n--- REVIEWER working ---")
    
    draft = ""
    for msg in reversed(state["messages"]):
        if hasattr(msg, "name") and msg.name == "writer":
            draft = msg.content
            break
    
    result = reviewer_agent.invoke({
        "input": f"Review this article:\n{draft}\nEnd with APPROVE or REVISE.",
        "chat_history": []
    })
    review_text = result["output"]
    decision = "APPROVE" if "APPROVE" in review_text.upper() else "REVISE"
    
    msg = AIMessage(
        content=f"REVIEW ({decision}):\n{review_text}",
        name="reviewer"
    )
    completed = state.get("completed_steps", []) + [f"review_{decision.lower()}"]
    return {"messages": [msg], "completed_steps": completed}


def editor_node(state: SupervisorState) -> dict:
    print("\n--- EDITOR working ---")
    
    draft, review = "", ""
    for msg in state["messages"]:
        if hasattr(msg, "name"):
            if msg.name == "writer":
                draft = msg.content
            elif msg.name == "reviewer":
                review = msg.content
    
    result = editor_agent.invoke({
        "input": f"Improve this draft based on the review.\nDRAFT:\n{draft}\n\nREVIEW:\n{review}",
        "chat_history": []
    })
    
    msg = AIMessage(content=f"FINAL ARTICLE:\n{result['output']}", name="editor")
    completed = state.get("completed_steps", []) + ["editing"]
    return {"messages": [msg], "completed_steps": completed}


# ── ROUTING FROM SUPERVISOR ───────────────────────────

def route_from_supervisor(state: SupervisorState) -> str:
    """Route to the next agent based on supervisor's decision."""
    next_agent = state.get("next_agent", "FINISH")
    if next_agent == "FINISH":
        return "finish"
    return next_agent


def finish_node(state: SupervisorState) -> dict:
    """Extract the final output from messages."""
    final = ""
    # Get the last substantive agent output
    for msg in reversed(state["messages"]):
        if hasattr(msg, "name") and msg.name in ["editor", "writer"]:
            # Extract actual content (after "DRAFT ARTICLE:" or "FINAL ARTICLE:")
            content = msg.content
            for prefix in ["FINAL ARTICLE:\n", "DRAFT ARTICLE:\n"]:
                if prefix in content:
                    final = content.split(prefix, 1)[1]
                    break
            if not final:
                final = content
            break
    
    return {"final_output": final}


# ── BUILD SUPERVISOR GRAPH ────────────────────────────

builder = StateGraph(SupervisorState)

# Add all nodes
builder.add_node("supervisor", supervisor_node)
builder.add_node("researcher", researcher_node)
builder.add_node("writer", writer_node)
builder.add_node("reviewer", reviewer_node)
builder.add_node("editor", editor_node)
builder.add_node("finish", finish_node)

# Start → Supervisor
builder.add_edge(START, "supervisor")

# Supervisor routes to workers
builder.add_conditional_edges(
    "supervisor",
    route_from_supervisor,
    {
        "researcher": "researcher",
        "writer": "writer",
        "reviewer": "reviewer",
        "editor": "editor",
        "finish": "finish"
    }
)

# After each worker → back to supervisor for next decision
builder.add_edge("researcher", "supervisor")
builder.add_edge("writer", "supervisor")
builder.add_edge("reviewer", "supervisor")
builder.add_edge("editor", "supervisor")
builder.add_edge("finish", END)

supervisor_graph = builder.compile()

# ── RUN ───────────────────────────────────────────────

def run_supervisor_pipeline(task: str) -> str:
    print(f"\nStarting supervisor pipeline")
    print(f"Task: {task}")
    print("="*50)
    
    result = supervisor_graph.invoke({
        "task": task,
        "messages": [],
        "next_agent": "",
        "completed_steps": [],
        "final_output": ""
    })
    
    return result["final_output"]

# result = run_supervisor_pipeline("Write an article about how RAG improves LLM accuracy")
# print("\nFINAL OUTPUT:")
# print(result)
```

---

## 10.7 — How Agents Communicate

In both patterns above, agents communicate through the shared state — specifically through the `messages` list. Each agent reads previous agent outputs from the messages and adds its own output.

This is clean but has limits. Here are three communication patterns:

---

### Pattern A: Through State (what you did above)

```
Researcher writes to state["messages"]
         ↓
Writer reads from state["messages"], finds research
         ↓
Writer writes draft to state["messages"]
```

**Good for:** Sequential workflows where each agent needs only the previous agent's output.

---

### Pattern B: Direct Function Call

Sometimes one agent needs to directly call another as a tool.

```python
@tool
def call_researcher(topic: str) -> str:
    """
    Call the researcher agent to get research on a topic.
    Use when you need research before writing.
    """
    result = researcher_agent.invoke({
        "input": f"Research: {topic}",
        "chat_history": []
    })
    return result["output"]

# Writer agent now has call_researcher as a tool
writer_with_researcher_tool = create_agent(
    name="Writer",
    role="You write articles. Use the researcher tool first to gather information.",
    tools=[call_researcher],  # Can call researcher directly
    temperature=0.7
)
```

**Good for:** When one agent needs to dynamically request work from another.

---

### Pattern C: Subgraph as a Node

A complex agent can be its own graph embedded as a node in a larger graph.

```python
# research_graph is itself a compiled StateGraph
# It becomes a single node in the larger pipeline

def research_subgraph_node(state: ContentPipelineState) -> dict:
    """Runs the entire research subgraph as one node."""
    # The research graph has its own internal logic
    # (multiple steps, retries, etc.)
    result = research_graph.invoke({
        "topic": state["topic"],
        "documents": [],
        "web_results": [],
        "summary": ""
    })
    return {"research": result["summary"]}

# Add to main graph as a single node
builder.add_node("research_phase", research_subgraph_node)
```

**Good for:** When a step is complex enough to be its own workflow — hide that complexity behind a single node.

---

## 10.8 — Handling Failures Across Agents

In a multi-agent system, one agent failing should not crash everything.

```python
def safe_agent_node(agent_executor, agent_name: str):
    """
    Wraps an agent in error handling.
    Returns a node function that catches errors gracefully.
    """
    def node(state: dict) -> dict:
        print(f"\n--- {agent_name.upper()} working ---")
        try:
            result = agent_executor.invoke({
                "input": build_input_for_agent(agent_name, state),
                "chat_history": []
            })
            output = result["output"]
            status = "success"
            
        except Exception as e:
            output = f"{agent_name} failed: {str(e)}"
            status = "error"
            print(f"ERROR in {agent_name}: {e}")
        
        msg = AIMessage(content=output, name=agent_name)
        return {
            "messages": [msg],
            "completed_steps": state.get("completed_steps", []) + [f"{agent_name}_{status}"]
        }
    
    return node


def build_input_for_agent(agent_name: str, state: dict) -> str:
    """Build the right input for each agent based on current state."""
    if agent_name == "researcher":
        return f"Research: {state['task']}"
    
    elif agent_name == "writer":
        research = next(
            (m.content for m in state.get("messages", [])
             if hasattr(m, "name") and m.name == "researcher"),
            "No research available"
        )
        return f"Write an article about '{state['task']}' using:\n{research}"
    
    elif agent_name == "reviewer":
        draft = next(
            (m.content for m in reversed(state.get("messages", []))
             if hasattr(m, "name") and m.name == "writer"),
            "No draft available"
        )
        return f"Review this article:\n{draft}"
    
    return f"Complete your task for: {state.get('task', 'unknown task')}"


# Create safe versions of all agent nodes
safe_researcher = safe_agent_node(researcher_agent, "researcher")
safe_writer = safe_agent_node(writer_agent, "writer")
safe_reviewer = safe_agent_node(reviewer_agent, "reviewer")


def decide_after_safe_review(state: dict) -> str:
    """Check if reviewer succeeded before deciding."""
    completed = state.get("completed_steps", [])
    
    # If reviewer failed, go to a fallback node
    if "reviewer_error" in completed:
        return "skip_review"
    
    # Check review decision from messages
    for msg in reversed(state.get("messages", [])):
        if hasattr(msg, "name") and msg.name == "reviewer":
            if "APPROVE" in msg.content.upper():
                return "approved"
    
    return "needs_revision"
```

---

## 10.9 — Debate Pattern: Agents Check Each Other

One powerful multi-agent pattern is the **debate** — multiple agents propose solutions, argue for them, and a judge picks the best.

```python
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, START, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage
import operator
from dotenv import load_dotenv

load_dotenv()

# Use slightly higher temperature for creative agents
creative_llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.8)
judge_llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

class DebateState(TypedDict):
    question: str
    proposal_a: str
    proposal_b: str
    critique_a: str
    critique_b: str
    final_decision: str
    messages: Annotated[list, operator.add]

def agent_a_proposes(state: DebateState) -> dict:
    """Agent A proposes a solution."""
    print("--- Agent A proposing ---")
    response = creative_llm.invoke([
        SystemMessage(content="You are Agent A. Propose a creative solution to the question."),
        HumanMessage(content=state["question"])
    ])
    return {"proposal_a": response.content}

def agent_b_proposes(state: DebateState) -> dict:
    """Agent B proposes a different solution."""
    print("--- Agent B proposing ---")
    response = creative_llm.invoke([
        SystemMessage(content="You are Agent B. Propose a DIFFERENT, alternative solution to Agent A's approach."),
        HumanMessage(content=f"Question: {state['question']}\nAgent A proposed: {state['proposal_a']}\n\nPropose a different approach:")
    ])
    return {"proposal_b": response.content}

def agent_a_critiques_b(state: DebateState) -> dict:
    """Agent A critiques B's proposal."""
    print("--- Agent A critiquing B ---")
    response = judge_llm.invoke([
        HumanMessage(content=f"""Critique this proposal. Be specific about weaknesses.
Proposal: {state['proposal_b']}
Original question: {state['question']}""")
    ])
    return {"critique_b": response.content}

def agent_b_critiques_a(state: DebateState) -> dict:
    """Agent B critiques A's proposal."""
    print("--- Agent B critiquing A ---")
    response = judge_llm.invoke([
        HumanMessage(content=f"""Critique this proposal. Be specific about weaknesses.
Proposal: {state['proposal_a']}
Original question: {state['question']}""")
    ])
    return {"critique_a": response.content}

def judge_decides(state: DebateState) -> dict:
    """Judge reviews both proposals and critiques, picks the best."""
    print("--- Judge deciding ---")
    response = judge_llm.invoke([
        HumanMessage(content=f"""You are an impartial judge. Pick the better solution.

QUESTION: {state['question']}

PROPOSAL A: {state['proposal_a']}
CRITIQUE OF A: {state['critique_a']}

PROPOSAL B: {state['proposal_b']}
CRITIQUE OF B: {state['critique_b']}

Pick the better proposal (or combine the best elements).
Explain your decision clearly.""")
    ])
    return {"final_decision": response.content}

from langchain_core.messages import SystemMessage

# Build debate graph
builder = StateGraph(DebateState)
builder.add_node("agent_a_propose", agent_a_proposes)
builder.add_node("agent_b_propose", agent_b_proposes)
builder.add_node("agent_a_critique", agent_a_critiques_b)
builder.add_node("agent_b_critique", agent_b_critiques_a)
builder.add_node("judge", judge_decides)

builder.add_edge(START, "agent_a_propose")
builder.add_edge("agent_a_propose", "agent_b_propose")

# After both proposals — critiques run in parallel
builder.add_edge("agent_b_propose", "agent_a_critique")
builder.add_edge("agent_b_propose", "agent_b_critique")

# Both critiques must finish before judge
builder.add_edge("agent_a_critique", "judge")
builder.add_edge("agent_b_critique", "judge")

builder.add_edge("judge", END)

debate_graph = builder.compile()

# Run a debate
result = debate_graph.invoke({
    "question": "What is the best chunking strategy for RAG systems?",
    "proposal_a": "",
    "proposal_b": "",
    "critique_a": "",
    "critique_b": "",
    "final_decision": "",
    "messages": []
})

print("\nFINAL DECISION:")
print(result["final_decision"])
```

---

## 10.10 — Project: Multi-Agent Content Pipeline

Build a complete multi-agent content creation system.

**What to build:**

A supervisor-based multi-agent system that:
1. Takes a topic and target audience as input
2. Researcher searches docs + web for relevant content
3. Fact-checker verifies the research is accurate
4. Writer creates the article for the specific audience
5. SEO agent suggests improvements for search visibility
6. Editor incorporates all feedback
7. Human approval gate before publishing
8. Final formatted output

**Architecture:**

```
                  Supervisor
                 /    |    \    \
         Researcher  Writer  Reviewer  SEO-Agent
                            |
                         Editor
                            |
                    Human Approval
                            |
                         Publisher
```

**Key additions over the examples above:**

```python
@tool
def check_seo(content: str, target_keywords: list) -> str:
    """
    Analyze content for SEO.
    Check keyword density, heading structure, readability.
    """
    # Check keyword presence
    findings = []
    for kw in target_keywords:
        count = content.lower().count(kw.lower())
        findings.append(f"'{kw}': {count} mentions")
    
    word_count = len(content.split())
    
    return f"""SEO Analysis:
- Word count: {word_count} ({'Good' if word_count > 500 else 'Too short'})
- Keyword coverage: {', '.join(findings)}
- Recommendation: {'Add more keyword context' if word_count < 500 else 'Content length is good'}"""


seo_agent = create_agent(
    name="SEO Specialist",
    role="""You optimize content for search engines.
- Analyze keyword usage and density
- Suggest headline improvements
- Recommend internal linking opportunities
- Ensure content answers the target query clearly
- Output: specific SEO improvement suggestions""",
    tools=[check_seo],
    temperature=0.2
)
```

Build the full system using the supervisor pattern, add the human-in-the-loop from Chapter 9, and deploy it.

---

## Chapter 10 Summary

| Pattern | Structure | Best for |
|---|---|---|
| Sequential Pipeline | A → B → C → D | Fixed, always-same workflow |
| Supervisor | Orchestrator routes to workers dynamically | Complex tasks needing intelligent routing |
| Direct tool call | Agent A calls Agent B as a tool | When one agent dynamically needs another's work |
| Subgraph as node | Complex agent hidden behind one node | Hiding complex internal logic |
| Debate | Multiple proposals + critique + judge | When you want the best answer from multiple approaches |

**Key rules for multi-agent systems:**
- Keep each agent focused on one job — specialization improves quality
- Use state to pass information between agents — not global variables
- Always wrap agents in error handling — one failure should not crash everything
- Start with the sequential pipeline — add a supervisor only when you need dynamic routing
- Add human-in-the-loop for any consequential action

---

## What Is Coming Next

**Chapter 11 — Production AI Engineering & LLMOps**

You now know how to build — RAG, agents, LangGraph, multi-agent systems. Chapter 11 is about how to ship it properly. Security, monitoring, cost control, deployment, testing, and fine-tuning. This is the difference between a demo and a real product.

---

*End of Chapter 10*
