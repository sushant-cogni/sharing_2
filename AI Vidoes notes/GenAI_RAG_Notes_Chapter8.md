# GenAI & RAG — Full Course Notes
## Chapter 8: Agentic AI — Building AI Agents

---

> Until now every system you built followed a fixed pipeline. User asks → retrieve → generate → done. The flow never changes. An agent is different. An agent looks at the task, decides what to do, does it, looks at the result, decides what to do next, and keeps going until the task is complete. The LLM is not just generating text — it is making decisions. This chapter builds that from concept to working code.

---

## 8.1 — What is an AI Agent

A **chain** follows a fixed sequence of steps. You define the steps. They always run in the same order.

An **agent** is given a goal and a set of tools. It decides which tools to use, in what order, based on what it sees. The sequence is not fixed — the LLM figures it out at runtime.

**Simple analogy:**

A chain is like a recipe. Step 1, Step 2, Step 3. Always the same.

An agent is like a chef who has never seen this dish before. They look at what ingredients are available, decide what to make, taste as they go, and adjust. The steps are not written down anywhere — the chef decides in the moment.

---

**A concrete example of why chains are not enough:**

You build a chain to answer customer questions:
```
User question → search docs → generate answer
```

This works for simple questions. But what if the user asks:

*"I ordered a laptop three days ago. I live in Bangalore. Has it been shipped and when will it arrive?"*

To answer this you need to:
1. Look up the order status (call order API)
2. Check the shipping carrier's tracking (call tracking API)
3. Calculate estimated delivery based on location (maybe do a calculation)
4. Check if there are any delays in Bangalore (maybe search for news)
5. Combine all of this into one coherent answer

A fixed chain cannot do this. The steps depend on what the previous step returned. An agent can.

---

## 8.2 — The ReAct Loop (How Agents Think)

The most common agent pattern is called **ReAct** — Reasoning and Acting.

The agent runs in a loop:

```
Thought: What do I need to do?
Action: Call a tool with some input
Observation: Here is what the tool returned
Thought: Based on that, what should I do next?
Action: Call another tool (or finish)
Observation: Here is the result
...
Final Answer: I have enough information to answer now.
```

The LLM generates the "Thought" and "Action" parts. Your code executes the action and feeds back the "Observation". This loop repeats until the LLM decides it has enough information to give a final answer.

**The key insight:** The LLM never actually calls tools itself. It writes what tool it wants to call and what input to give it. Your code reads that, calls the actual function, and feeds the result back. The LLM is the brain — your code is the hands.

---

## 8.3 — Tools: What Agents Can Do

A **tool** is any Python function that you make available to the agent. The agent can call it whenever it decides to.

LangChain makes defining tools simple with the `@tool` decorator.

```python
from langchain_core.tools import tool

# Define tools using the @tool decorator
# The docstring is CRITICAL — the agent reads it to decide when to use this tool

@tool
def get_order_status(order_id: str) -> str:
    """
    Get the current status of a customer order.
    Use this when the user asks about their order, shipment, or delivery.
    Input: order_id as a string (e.g. 'ORD-12345')
    Returns: order status and estimated delivery date
    """
    # In real life, this would call your database or API
    fake_orders = {
        "ORD-001": {"status": "Shipped", "eta": "2 days", "carrier": "FedEx"},
        "ORD-002": {"status": "Processing", "eta": "Not yet shipped", "carrier": None},
        "ORD-003": {"status": "Delivered", "eta": "Already delivered", "carrier": "BlueDart"}
    }
    order = fake_orders.get(order_id.upper())
    if not order:
        return f"No order found with ID {order_id}"
    return f"Order {order_id}: Status={order['status']}, ETA={order['eta']}, Carrier={order.get('carrier', 'N/A')}"


@tool
def calculate_delivery_date(shipping_days: int, city: str) -> str:
    """
    Calculate estimated delivery date based on shipping days and destination city.
    Use this when you need to figure out when an order will arrive.
    Input: shipping_days (integer), city (string)
    Returns: estimated arrival date
    """
    from datetime import datetime, timedelta
    
    # Add extra day for metro cities processing
    metro_cities = ["mumbai", "delhi", "bangalore", "chennai", "kolkata", "hyderabad"]
    extra_days = 0 if city.lower() in metro_cities else 2
    
    arrival = datetime.now() + timedelta(days=shipping_days + extra_days)
    return f"Estimated delivery to {city}: {arrival.strftime('%A, %B %d')} ({shipping_days + extra_days} business days)"


@tool
def search_product_info(product_name: str) -> str:
    """
    Search for product information including specifications, price, and availability.
    Use this when user asks about a product's details, features, or stock status.
    Input: product_name as string
    Returns: product details
    """
    fake_products = {
        "laptop": "Dell XPS 15, 16GB RAM, 512GB SSD, Rs 1,20,000. In stock.",
        "phone": "Samsung Galaxy S24, 8GB RAM, 256GB, Rs 75,000. Limited stock.",
        "headphones": "Sony WH-1000XM5, Noise cancelling, Rs 25,000. In stock."
    }
    for key, info in fake_products.items():
        if key in product_name.lower():
            return info
    return f"No product information found for '{product_name}'"


@tool
def get_weather(city: str) -> str:
    """
    Get current weather conditions for a city.
    Use this when delivery estimates might be affected by weather or when user asks about weather.
    Input: city name as string
    Returns: current weather conditions
    """
    fake_weather = {
        "bangalore": "Clear, 24°C, no disruptions expected",
        "mumbai": "Cloudy, 31°C, minor traffic delays possible",
        "delhi": "Hazy, 28°C, air quality moderate"
    }
    return fake_weather.get(city.lower(), f"Weather data unavailable for {city}")


# List of all available tools
tools = [get_order_status, calculate_delivery_date, search_product_info, get_weather]
```

**The docstring is everything.** The agent reads the docstring to decide which tool to use. Write it clearly:
- What does this tool do
- When should the agent use it
- What input does it expect
- What does it return

---

## 8.4 — Building Your First Agent

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_core.messages import HumanMessage, AIMessage
from dotenv import load_dotenv

load_dotenv()

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# Agent prompt — tells the agent who it is and how to behave
agent_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a helpful customer service agent for an e-commerce platform.
You have access to tools to look up orders, products, and other information.

Guidelines:
- Always look up information before answering — do not guess
- If you need multiple pieces of information, use multiple tools
- Be concise and friendly in your final answer
- If a tool returns an error, tell the user politely and suggest alternatives"""),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad")  # Agent's thinking space
])

# Create the agent
agent = create_tool_calling_agent(
    llm=llm,
    tools=tools,
    prompt=agent_prompt
)

# AgentExecutor runs the ReAct loop
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,           # Shows every thought and action — essential for learning
    max_iterations=10,      # Safety limit — stops after 10 tool calls
    handle_parsing_errors=True  # Gracefully handles LLM output parsing issues
)

# Run the agent
result = agent_executor.invoke({
    "input": "I ordered a laptop (order ORD-001). I live in Bangalore. When will it arrive?",
    "chat_history": []
})

print("\nFINAL ANSWER:")
print(result["output"])
```

With `verbose=True` you will see the agent's full thought process:

```
> Entering new AgentExecutor chain...

Thought: I need to check the order status for ORD-001 first.
Action: get_order_status
Action Input: {"order_id": "ORD-001"}
Observation: Order ORD-001: Status=Shipped, ETA=2 days, Carrier=FedEx

Thought: The order is shipped with 2 days ETA. Now I should calculate the actual
delivery date for Bangalore.
Action: calculate_delivery_date
Action Input: {"shipping_days": 2, "city": "Bangalore"}
Observation: Estimated delivery to Bangalore: Thursday, January 16 (2 business days)

Thought: I have everything I need. Bangalore is a metro city so no extra days.
Final Answer: Your laptop (ORD-001) has been shipped via FedEx and is estimated
to arrive in Bangalore by Thursday, January 16 — in about 2 business days.

> Finished chain.
```

The agent used two tools in the right order without being told to. That is the power of agents.

---

## 8.5 — Adding Memory to Agents

Without memory, every conversation starts fresh. The agent cannot remember what was said earlier.

```python
from langchain_core.messages import HumanMessage, AIMessage

chat_history = []

def chat_with_agent(user_input: str) -> str:
    result = agent_executor.invoke({
        "input": user_input,
        "chat_history": chat_history
    })
    
    answer = result["output"]
    
    # Update history
    chat_history.append(HumanMessage(content=user_input))
    chat_history.append(AIMessage(content=answer))
    
    return answer


# Multi-turn conversation
print(chat_with_agent("What is the status of order ORD-002?"))
print()
print(chat_with_agent("Is the product I ordered in stock?"))  # "product I ordered" — needs history
print()
print(chat_with_agent("How long will it take to reach Delhi?"))  # Still about same order
```

The agent uses chat history to understand "the product I ordered" and "it" refer to the item in ORD-002 from earlier in the conversation.

---

## 8.6 — Controlling Agent Behavior

Sometimes agents go in wrong directions. You need ways to control and constrain them.

### Setting Max Iterations

```python
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    max_iterations=5,       # Agent cannot loop more than 5 times
    max_execution_time=30,  # Hard stop after 30 seconds
    verbose=True
)
```

### Forcing the Agent to Use Specific Tools

Sometimes you want to ensure the agent always uses a particular tool.

```python
# You can instruct this in the system prompt
agent_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a customer service agent.

IMPORTANT: Always call get_order_status FIRST before answering any question about orders.
Never answer order-related questions from memory alone.
"""),
    ...
])
```

### Handling Tool Errors

```python
@tool
def get_order_status(order_id: str) -> str:
    """Get order status. Input: order_id string."""
    try:
        # Your real API call here
        result = call_order_api(order_id)
        return result
    except Exception as e:
        # Return a helpful error message instead of crashing
        return f"Error fetching order {order_id}: {str(e)}. Please try again or contact support."
```

When a tool returns an error message instead of crashing, the agent reads it and can decide what to do — try a different approach, ask the user for more info, or tell the user about the problem.

---

## 8.7 — Custom Tools with Complex Inputs

For tools that need structured inputs, use Pydantic to define the schema.

```python
from langchain_core.tools import tool
from pydantic import BaseModel, Field

class SearchInput(BaseModel):
    query: str = Field(description="The search query to look up")
    max_results: int = Field(default=3, description="Maximum number of results to return")
    category: str = Field(default="all", description="Category to filter: 'all', 'orders', 'products', 'policies'")

@tool(args_schema=SearchInput)
def advanced_search(query: str, max_results: int = 3, category: str = "all") -> str:
    """
    Search across all company data for relevant information.
    Use this for general questions that don't fit other specific tools.
    Can search orders, products, and company policies.
    """
    # Your actual search logic here
    return f"Search results for '{query}' in category '{category}' (showing {max_results} results): [results here]"
```

---

## 8.8 — Agentic RAG

This is where Chapter 5's RAG and Chapter 8's agents combine.

**The problem with standard RAG:** It always retrieves, always generates. Every question goes through the same pipeline regardless of whether it needs retrieval or not.

**Agentic RAG:** The agent decides whether to retrieve, what to retrieve, and how many times to retrieve.

```python
from langchain_core.tools import tool
from langchain_chroma import Chroma
from langchain_community.embeddings import FastEmbedEmbeddings
from langchain_openai import ChatOpenAI
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from dotenv import load_dotenv

load_dotenv()

# Load the vector store from Chapter 7
embeddings = FastEmbedEmbeddings(model_name="BAAI/bge-small-en-v1.5")
vectorstore = Chroma(
    persist_directory="./rag_vectorstore",
    embedding_function=embeddings
)
retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

# Make RAG retrieval a TOOL the agent can choose to use
@tool
def search_company_documents(query: str) -> str:
    """
    Search through company documents, policies, and knowledge base.
    Use this when the user asks about company policies, procedures, product info,
    or anything that might be in our internal documents.
    Input: a clear search query describing what to look for.
    Returns: relevant document excerpts.
    """
    docs = retriever.invoke(query)
    if not docs:
        return "No relevant documents found for this query."
    
    results = []
    for i, doc in enumerate(docs, 1):
        source = doc.metadata.get("source", "unknown")
        page = doc.metadata.get("page", "")
        results.append(f"[Doc {i} from {source}, p.{page}]\n{doc.page_content}")
    
    return "\n\n".join(results)


@tool
def search_web(query: str) -> str:
    """
    Search the web for current, real-time information.
    Use this for recent events, live data, or anything not in company documents.
    Input: search query string.
    Returns: web search results summary.
    """
    # In production use: from langchain_community.tools import DuckDuckGoSearchRun
    # For this example, returning fake results
    return f"Web search results for '{query}': [This would show real search results in production]"


@tool
def answer_from_knowledge(question: str) -> str:
    """
    Answer a general knowledge question from your own training knowledge.
    Use this ONLY for well-known facts that don't need document lookup.
    For example: definitions, general concepts, historical facts.
    Do NOT use this for company-specific information.
    Input: the question to answer.
    Returns: answer based on general knowledge.
    """
    # The agent itself answers — this is a meta-tool
    return f"General knowledge answer: [The agent will generate this]"


# Build the agentic RAG system
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

agentic_rag_tools = [search_company_documents, search_web, get_order_status]

agentic_rag_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are an intelligent assistant with access to multiple information sources.

Decision guide:
- For company policies, procedures, products → use search_company_documents
- For order status, shipment info → use get_order_status  
- For recent news or live information → use search_web
- For simple factual questions (capitals, definitions) → answer directly

Always prefer specific tools over general ones.
If the first search does not give a complete answer, search again with a different query.
Cite your sources in the final answer."""),
    MessagesPlaceholder("chat_history"),
    ("human", "{input}"),
    MessagesPlaceholder("agent_scratchpad")
])

agentic_rag_agent = create_tool_calling_agent(llm, agentic_rag_tools, agentic_rag_prompt)
agentic_rag_executor = AgentExecutor(
    agent=agentic_rag_agent,
    tools=agentic_rag_tools,
    verbose=True,
    max_iterations=6
)

# Test
result = agentic_rag_executor.invoke({
    "input": "What is your return policy for electronics, and what is my order status for ORD-001?",
    "chat_history": []
})
print("\nFINAL ANSWER:")
print(result["output"])
```

The agent:
1. Reads the question — it has two parts
2. Decides to call `search_company_documents` for the policy question
3. Decides to call `get_order_status` for the order question
4. Combines both results into one answer

No fixed pipeline told it to do this. The agent figured it out.

---

## 8.9 — Self-Correcting RAG (CRAG Pattern)

**The problem:** Sometimes retrieved documents are not relevant enough. The agent should recognize this and try again.

**Corrective RAG (CRAG):** The agent grades retrieved documents. If they are not relevant, it rewrites the query and retrieves again — or searches the web as a fallback.

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv
import json

load_dotenv()
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
parser = StrOutputParser()

def grade_documents(question: str, documents: list) -> str:
    """
    Grade whether retrieved documents are relevant to the question.
    Returns 'relevant' or 'not_relevant'
    """
    docs_text = "\n\n".join([doc.page_content for doc in documents])
    
    grade_prompt = ChatPromptTemplate.from_template("""
You are grading whether retrieved documents are relevant to a question.

Question: {question}

Retrieved documents:
{documents}

Are these documents relevant to the question?
Return ONLY one word: 'relevant' or 'not_relevant'
""")
    
    chain = grade_prompt | llm | parser
    result = chain.invoke({"question": question, "documents": docs_text})
    return result.strip().lower()


def rewrite_query(original_query: str) -> str:
    """Rewrite a query that did not produce good retrieval results."""
    rewrite_prompt = ChatPromptTemplate.from_template("""
The following query did not retrieve relevant documents.
Rewrite it to be more likely to find the right information.
Return ONLY the rewritten query.

Original query: {query}
Rewritten query:""")
    
    chain = rewrite_prompt | llm | parser
    return chain.invoke({"query": original_query}).strip()


def corrective_rag(question: str, retriever, generate_fn, max_retries: int = 2) -> str:
    """
    RAG with self-correction:
    1. Retrieve
    2. Grade documents
    3. If not relevant, rewrite query and try again
    4. If still not relevant after retries, use web search as fallback
    5. Generate answer
    """
    current_query = question
    
    for attempt in range(max_retries + 1):
        print(f"\nAttempt {attempt + 1}: Retrieving for query: '{current_query}'")
        
        # Retrieve
        docs = retriever.invoke(current_query)
        
        if not docs:
            print("No documents retrieved.")
            current_query = rewrite_query(current_query)
            continue
        
        # Grade relevance
        relevance = grade_documents(question, docs)
        print(f"Document relevance: {relevance}")
        
        if relevance == "relevant":
            print("Documents are relevant. Generating answer.")
            return generate_fn(question, docs)
        
        if attempt < max_retries:
            print("Documents not relevant. Rewriting query...")
            current_query = rewrite_query(current_query)
        else:
            print("Max retries reached. Using fallback.")
            # Fallback: answer from general knowledge with a disclaimer
            response = llm.invoke(
                f"Answer this question based on general knowledge "
                f"(note: company documents were not helpful): {question}"
            )
            return f"[Based on general knowledge, not company docs] {response.content}"
    
    return "I was unable to find relevant information to answer this question."


def generate_answer(question: str, docs: list) -> str:
    """Generate an answer from retrieved docs."""
    context = "\n\n".join([doc.page_content for doc in docs])
    prompt = f"""Answer based on the context below.

CONTEXT:
{context}

QUESTION: {question}
ANSWER:"""
    response = llm.invoke(prompt)
    return response.content


# Use it
# answer = corrective_rag(
#     "What is the warranty period for electronics?",
#     retriever=retriever,
#     generate_fn=generate_answer
# )
# print(answer)
```

---

## 8.10 — Built-in LangChain Tools

LangChain provides many ready-made tools you can give to your agents.

```python
# Install extras as needed
# pip install duckduckgo-search wikipedia

from langchain_community.tools import DuckDuckGoSearchRun, WikipediaQueryRun
from langchain_community.utilities import WikipediaAPIWrapper
from langchain_core.tools import tool
import math

# Web search tool
search_tool = DuckDuckGoSearchRun()

# Wikipedia tool
wiki_tool = WikipediaQueryRun(api_wrapper=WikipediaAPIWrapper())

# Python calculator tool (write your own for safety)
@tool
def calculator(expression: str) -> str:
    """
    Evaluate a mathematical expression.
    Use for any arithmetic, percentages, or numerical calculations.
    Input: a valid mathematical expression as a string.
    Example inputs: '15 * 840 / 100', 'math.sqrt(144)', '2 ** 10'
    Returns: the calculated result.
    """
    try:
        # Only allow safe math operations
        allowed_names = {k: v for k, v in math.__dict__.items() if not k.startswith("_")}
        result = eval(expression, {"__builtins__": {}}, allowed_names)
        return str(result)
    except Exception as e:
        return f"Calculation error: {str(e)}"


# Add all to your agent
all_tools = [search_tool, wiki_tool, calculator, get_order_status, search_company_documents]

# Build agent with these tools
agent = create_tool_calling_agent(llm, all_tools, agent_prompt)
executor = AgentExecutor(agent=agent, tools=all_tools, verbose=True, max_iterations=8)

# Test with a complex query
result = executor.invoke({
    "input": "What is 18% GST on a product worth Rs 25000? Also search for the latest GST rules in India.",
    "chat_history": []
})
print(result["output"])
```

---

## 8.11 — Project: Research Agent

Build an agent that researches a topic by searching both company documents and the web, then writes a structured report.

**What to build:**

An agent that:
1. Takes a research topic as input
2. Searches company documents for internal knowledge
3. Searches the web for current information
4. Calculates any relevant numbers
5. Writes a structured report with sections: Summary, Key Facts, Sources

**Complete code:**

```python
from langchain_openai import ChatOpenAI
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.tools import tool
from langchain_community.tools import DuckDuckGoSearchRun
from langchain_chroma import Chroma
from langchain_community.embeddings import FastEmbedEmbeddings
from dotenv import load_dotenv

load_dotenv()

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.3)
search = DuckDuckGoSearchRun()

embeddings = FastEmbedEmbeddings(model_name="BAAI/bge-small-en-v1.5")
vectorstore = Chroma(persist_directory="./rag_vectorstore", embedding_function=embeddings)
retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

@tool
def search_internal_docs(query: str) -> str:
    """Search internal company documents and knowledge base."""
    docs = retriever.invoke(query)
    if not docs:
        return "Nothing found in internal documents."
    return "\n\n".join([
        f"[Internal doc, p.{d.metadata.get('page','?')}]: {d.page_content}"
        for d in docs
    ])

@tool
def search_web_for_research(query: str) -> str:
    """Search the web for current information, news, and external data."""
    return search.run(query)

@tool
def write_report_section(section_title: str, content: str) -> str:
    """
    Format a section of the final research report.
    Use this to structure the report as you gather information.
    Input: section_title (e.g., 'Summary', 'Key Facts'), content (the section text).
    Returns: formatted section string.
    """
    return f"\n## {section_title}\n{content}\n"

research_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a thorough research agent. When given a research topic:

1. Search internal documents for relevant company knowledge
2. Search the web for current information and statistics  
3. Synthesize everything into a well-structured report
4. Use write_report_section to format each section of your report

Your final report must include:
- Executive Summary (2-3 sentences)
- Key Findings (bullet points)
- Internal Context (from company docs)
- External Context (from web)
- Conclusion

Be thorough. Use multiple searches if needed."""),
    MessagesPlaceholder("chat_history"),
    ("human", "Research topic: {input}"),
    MessagesPlaceholder("agent_scratchpad")
])

research_tools = [search_internal_docs, search_web_for_research, write_report_section]

research_agent = create_tool_calling_agent(llm, research_tools, research_prompt)
research_executor = AgentExecutor(
    agent=research_agent,
    tools=research_tools,
    verbose=True,
    max_iterations=12,
    return_intermediate_steps=True  # Returns all tool calls in output
)

def run_research(topic: str) -> str:
    print(f"\nResearching: {topic}\n{'='*50}")
    result = research_executor.invoke({
        "input": topic,
        "chat_history": []
    })
    return result["output"]

# Run
report = run_research("RAG systems in enterprise applications")
print("\n" + "="*50)
print("FINAL RESEARCH REPORT:")
print("="*50)
print(report)
```

---

## Chapter 8 Summary

| Concept | What it means |
|---|---|
| Agent | LLM that decides what to do at runtime using tools |
| Tool | Any Python function the agent can call |
| ReAct loop | Thought → Action → Observation → repeat |
| AgentExecutor | Runs the ReAct loop for you |
| `max_iterations` | Safety limit on how many tool calls the agent can make |
| Agentic RAG | RAG where retrieval is a tool the agent decides to use |
| CRAG | Agent grades retrieved docs and retries if they are not relevant |
| `verbose=True` | Shows every thought and action — always use while learning |

**Key rules for agents:**
- Write clear tool docstrings — the agent reads them to decide
- Always set `max_iterations` — prevent infinite loops
- Use `verbose=True` while developing — you must see what the agent is doing
- Start with simple 2–3 tool agents before building complex ones
- Temperature 0 for agents — you want deterministic decisions not creative ones

---

## What Is Coming Next

**Chapter 9 — LangGraph: Stateful Agent Workflows**

Agents with AgentExecutor work well for simple tasks. But when you need complex workflows — branching logic, parallel steps, human approval before an action, the ability to pause and resume — AgentExecutor is not enough. LangGraph is the solution. It lets you build agents as graphs where nodes are steps and edges are decisions. This is how production-grade AI systems are built today.

---

*End of Chapter 8*
