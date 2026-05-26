# 📘 Notes — Building AI Agents & Agentic Workflows

> **Section:** AI Agents — Where LLMs become useful in the real world
> **What you'll learn:** What agents are, building your first agent (weather agent), structured outputs with Pydantic, and creating a CLI coding assistant (like Cursor/Claude Code).
> **Interview-ready:** Agentic AI is THE hottest topic in 2025-2026 — every company is building agents. This is a must-know section.

---

## 1. Why Agents Matter (Section Intro)

You've already learned how to:
- Make OpenAI/Gemini API calls
- Do chat completions
- Use prompting techniques

But here's the question: **how do these LLMs actually DO things in the real world?**

That's where **AI Agents** come in. All big tech companies are racing to build agents because they're how AI generates real business value — booking flights, writing code, analyzing data, automating workflows.

### Interview-ready
> "Agentic AI is the next evolution of LLM applications. Where regular LLM calls just answer questions, agents can actually take actions in the real world — calling APIs, reading files, executing code, and interacting with external systems. This is what transforms LLMs from chatbots into autonomous workers."

---

## 2. The Traditional System (Before AI)

To understand agents, let's first understand how systems worked **before** AI agents existed.

### Example: Amazon-like e-commerce

```
        USERS
          ↓
    ┌─────────────────────────────────────┐
    │           SERVERS                   │
    │  ┌────────┐ ┌──────┐ ┌────────┐    │
    │  │Payment │ │ Auth │ │Orders  │    │
    │  └────────┘ └──────┘ └────────┘    │
    │  ┌────────┐                         │
    │  │Shipping│                         │
    │  └────────┘                         │
    └─────────────────────────────────────┘
                  ↓
    ┌─────────────────────────────────────┐
    │         DATABASES                   │
    │     MongoDB    PostgreSQL           │
    └─────────────────────────────────────┘
```

### When a customer has a problem...
A traditional system needs **human customer support agents**:

```
USER → calls support → HUMAN AGENT
                          ↓
                      Has access to:
                      - Orders service
                      - Payment service
                      - Auth service
                      - Shipping service
                          ↓
                      Can read/modify data
                      to help the customer
```

### What do these humans do?
1. **Listen** to the user's query (NLP)
2. **Decide** what to do based on the query
3. **Take action** using the systems (call APIs, check data)
4. **Respond** to the user

🎯 **Key insight:** These humans are called "agents" because they have:
- Instructions/training
- Access to tools (the company's systems)
- Ability to take real actions

> **The question is — can AI replace these human agents?**

---

## 3. The Problem with Plain LLMs

LLMs by themselves can't replace these humans. Why?

### LLMs are "dumb pieces of code"
> "An LLM is just a dumb piece of code sitting on a server that takes input tokens and predicts output tokens."

That's it. They can't:
- ❌ Access your database
- ❌ Call your APIs
- ❌ Read files
- ❌ Execute code
- ❌ Send emails

They just predict the next word.

### The Brain Analogy 🧠

> "An LLM is like a brain in a jar — it can think and reason, but it has no body to actually DO anything."

| What a brain alone can do | What a brain WITH a body can do |
|---|---|
| Think | Write code |
| Process information | Make phone calls |
| Reason | Make coffee |
| Plan | Drive a car |

A brain (LLM) + a body (tools) = an **agent**.

### Interview-ready
> "Agents are LLMs given the ability to take actions in the world. We do this by attaching 'tools' — functions the LLM can decide to call. The LLM provides the reasoning/decision-making (the brain), and the tools provide the capabilities (the body)."

---

## 4. From LLM → Agent

### How do we give an LLM "a body"?

By writing code that allows the LLM to:
1. **Understand** what tools are available
2. **Decide** which tool to use based on user query
3. **Call** the tool with appropriate inputs
4. **Read** the tool's output
5. **Use** that output to formulate a response

### The transformation

```
BEFORE (just an LLM):
USER → "What's the weather in Goa?"
LLM  → "I don't have real-time data, sorry!"

AFTER (an agent):
USER  → "What's the weather in Goa?"
AGENT → [decides to use weather tool]
        ↓
        Calls get_weather("Goa")
        ↓
        Tool returns: "Goa is 28°C, sunny"
        ↓
        Formulates response
AGENT → "The current weather in Goa is 28°C and sunny!"
```

### 🎯 The magic is in the LOOP
The agent doesn't just call one tool. It can:
- Plan multiple steps
- Call multiple tools in sequence
- Observe results between calls
- Adjust based on what it sees

---

# 🛠️ PART A — BUILDING YOUR FIRST AGENT (WEATHER AGENT)

## 5. Setting Up

We'll build a weather agent that can answer "What's the weather in [city]?" by calling a real weather API.

### Project structure
```
weather_agent/
├── main.py          # the agent
├── .env             # API keys
└── requirements.txt
```

### Imports
```python
from openai import OpenAI
from dotenv import load_dotenv
import requests
import json

load_dotenv()
client = OpenAI()
```

---

## 6. The Weather Tool

First, build the actual tool — a regular Python function:

```python
def get_weather(city: str):
    """Get current weather for a city using a free API"""
    url = f"https://wttr.in/{city.lower()}?format=%C+%t"
    response = requests.get(url)
    if response.status_code == 200:
        return f"The weather in {city} is {response.text}"
    return "Something went wrong"

# Test it
print(get_weather("Goa"))    # "The weather in Goa is Partly cloudy +28°C"
```

The tool is just a Python function. **No AI yet** — we just need it to work.

---

## 7. Teaching the LLM About the Tool

Now we need to tell the LLM:
- That this tool exists
- When to use it
- How to call it
- What format to use

We do this through the **system prompt** with chain-of-thought reasoning:

```python
system_prompt = """
You are an expert AI assistant in resolving user queries using chain of thought.
You work on START, PLAN, TOOL, OBSERVE, and OUTPUT steps.

For tool calls, wait for the OBSERVE step which contains the tool's output.

Available tools:
- get_weather: takes city name as input (string) and returns weather info

Output format (JSON):
{ "step": "start|plan|tool|output", "content": "...", "tool": "...", "input": "..." }

Example 1: Math query (no tools needed)
User: What is 2 + 3 * 5 / 10?
{ "step": "start", "content": "User wants to solve a math problem" }
{ "step": "plan", "content": "Using BODMAS, multiply first" }
{ "step": "plan", "content": "3 * 5 = 15" }
{ "step": "output", "content": "3.5" }

Example 2: Weather query (uses tool)
User: What is the weather of Delhi?
{ "step": "plan", "content": "User wants weather of Delhi" }
{ "step": "plan", "content": "I should use get_weather tool" }
{ "step": "tool", "tool": "get_weather", "input": "Delhi" }
{ "step": "observe", "content": "The weather in Delhi is 20°C, cloudy" }
{ "step": "plan", "content": "Got the weather info" }
{ "step": "output", "content": "The current weather in Delhi is 20°C, cloudy." }
"""
```

### 🎯 Key teaching points in the prompt
1. **Step types** — START, PLAN, TOOL, OBSERVE, OUTPUT
2. **Tool list** — what's available with signatures
3. **JSON output format** — strict structure
4. **Examples** — both with and without tool use

---

## 8. The Agent Loop ⭐

This is the heart of every agent — the loop that keeps calling the LLM until we get a final output:

```python
# Available tools dictionary
available_tools = {
    "get_weather": get_weather
}

# Initialize message history with system prompt
message_history = [
    {"role": "system", "content": system_prompt}
]

# Get user input
user_query = input("User: ")
message_history.append({"role": "user", "content": user_query})

# The agent loop
while True:
    response = client.chat.completions.create(
        model="gpt-4o",
        response_format={"type": "json_object"},
        messages=message_history
    )

    raw_result = response.choices[0].message.content
    parsed_result = json.loads(raw_result)

    # ALWAYS append assistant's response to history
    message_history.append({"role": "assistant", "content": raw_result})

    step = parsed_result.get("step")
    content = parsed_result.get("content")

    if step == "start":
        print(f"🔥 {content}")
        continue

    elif step == "plan":
        print(f"🧠 {content}")
        continue

    elif step == "tool":
        tool_name = parsed_result.get("tool")
        tool_input = parsed_result.get("input")
        print(f"🛠️ Calling {tool_name} with input: {tool_input}")

        # Actually call the tool!
        tool_response = available_tools[tool_name](tool_input)
        print(f"📋 Tool returned: {tool_response}")

        # Feed the result back as an "observe" step
        message_history.append({
            "role": "developer",
            "content": json.dumps({
                "step": "observe",
                "tool": tool_name,
                "input": tool_input,
                "output": tool_response
            })
        })
        continue

    elif step == "output":
        print(f"🤖 {content}")
        break
```

### What each step does

| Step | What happens |
|---|---|
| **start** | Initial understanding of the query |
| **plan** | Thinking about how to solve it |
| **tool** | Decision to call a specific tool |
| **observe** | Result of the tool call (we inject this) |
| **output** | Final answer to the user |

### 🎯 The critical insight

The agent doesn't actually "call" the tool itself — it **decides** which tool to call. **Your code** then calls the tool and **feeds the result back** as an "observe" message. The LLM uses this to decide what to do next.

---

## 9. Watching the Agent Work

```
👤 User: What is the weather of Goa?

🧠 User wants to know the current weather of Goa
🧠 I should use the get_weather tool for this
🛠️ Calling get_weather with input: Goa
📋 Tool returned: The weather in Goa is Partly cloudy +28°C
🧠 I have the weather information now
🤖 The current weather in Goa is 28°C, partly cloudy.
```

### Try complex queries

```
👤 User: What is the weather of Delhi, Bangalore, and Patiala?

🛠️ Calling get_weather with input: Delhi
🛠️ Calling get_weather with input: Bangalore
🛠️ Calling get_weather with input: Patiala
🤖 Delhi is 27°C clear, Bangalore is partly cloudy, Patiala data unavailable.
```

The agent **autonomously** decided to call the tool 3 times for 3 cities!

---

## 10. Adding More Tools

Just write more functions and add them to `available_tools`:

```python
def get_news(topic: str):
    # implementation
    return news_data

def send_email(to: str, subject: str, body: str):
    # implementation
    return "Email sent"

available_tools = {
    "get_weather": get_weather,
    "get_news": get_news,
    "send_email": send_email
}
```

And update the system prompt to list the new tools:

```
Available tools:
- get_weather: takes city name (string), returns weather info
- get_news: takes topic (string), returns latest news
- send_email: takes to, subject, body, sends email
```

### 🎯 That's it! 
> "An LLM with tools is an agent."

---

# 🛠️ PART B — STRUCTURED OUTPUTS WITH PYDANTIC

## 11. The Problem with Plain JSON Mode

In Part A, we relied on `response_format={"type": "json_object"}` — but this just says "give me JSON." It doesn't enforce a specific structure.

### What can go wrong
The LLM might return:
```json
{"sure": "here is your result"}
```
Instead of:
```json
{"step": "plan", "content": "..."}
```

Your code expects specific fields. If they're missing, `parse_result.get("step")` returns `None` and things break.

### The fix — Structured Outputs

OpenAI supports **structured outputs** — you define an exact schema using Pydantic, and the LLM is **guaranteed** to match it.

---

## 12. Defining the Output Schema

```python
from pydantic import BaseModel, Field
from typing import Optional

class MyOutputFormat(BaseModel):
    step: str = Field(
        ...,
        description="The id of the step. Example: plan, output, tool, etc."
    )
    content: Optional[str] = Field(
        default=None,
        description="The optional string content for the step"
    )
    tool: Optional[str] = Field(
        default=None,
        description="The id of the tool to call"
    )
    input: Optional[str] = Field(
        default=None,
        description="The input params for the tool"
    )
```

### Key points
- **Inherit from `BaseModel`**
- **`Field(...)`** with `...` = required
- **`Field(default=None)`** for optional fields
- **`description`** helps the LLM understand each field

---

## 13. Using Structured Outputs

Instead of `chat.completions.create()`, use `chat.completions.parse()`:

```python
response = client.chat.completions.parse(
    model="gpt-4o",
    response_format=MyOutputFormat,    # Pass the Pydantic class
    messages=message_history
)

# Access the parsed result directly
parsed_result = response.choices[0].message.parsed

# No more json.loads() needed!
# All fields are type-safe
step = parsed_result.step           # str
content = parsed_result.content     # Optional[str]
tool = parsed_result.tool           # Optional[str]
tool_input = parsed_result.input    # Optional[str]
```

### Benefits
| Before (JSON mode) | After (Structured outputs) |
|---|---|
| `json.loads()` required | Direct object access |
| `parsed_result.get("step")` | `parsed_result.step` |
| Errors at runtime | Type errors caught early |
| Loose schema | Strict schema |
| Need many examples | Less prompting needed |

### 🎯 Interview-ready
> "Structured outputs use Pydantic models with OpenAI's `parse()` method to enforce a strict schema on the LLM's responses. This eliminates the need for manual JSON parsing, provides type safety, and dramatically reduces output format errors — making agents far more reliable."

---

# 🛠️ PART C — BUILDING A CLI CODING ASSISTANT

## 14. The Idea — Build Your Own Cursor/Claude Code

What if we give the agent ONE powerful tool — the ability to **run any shell command** on the system?

Then the agent could:
- Create folders
- Create files
- Write code
- Run commands
- Build entire applications

This is essentially how **Cursor**, **Claude Code**, and **GPT Codex** work.

---

## 15. The Magic Tool — `run_command`

```python
import os

def run_command(command: str):
    """Runs any shell command on the system"""
    result = os.system(command)
    return result
```

⚠️ **WARNING:** This is dangerous! An LLM running arbitrary commands on your system can delete files, install malware, etc. Use this only in sandboxed environments or with strict guardrails.

### Add it to the tools

```python
available_tools = {
    "get_weather": get_weather,
    "run_command": run_command
}
```

### Update the system prompt
```
Available tools:
- get_weather: takes city name, returns weather
- run_command: takes a Linux command (string), executes it on user's system,
               returns the output
```

---

## 16. Watch the Agent Build an App

```
👤 User: Create a folder named todo_app

🧠 User wants me to create a folder
🛠️ Calling run_command with input: mkdir todo_app
📋 Tool returned: 0 (success)
🤖 Folder 'todo_app' created.

👤 User: Inside todo_app folder, create a todo app using HTML, CSS, and JavaScript

🧠 I need to create HTML, CSS, and JS files
🛠️ Calling run_command with input: touch todo_app/index.html
🛠️ Calling run_command with input: touch todo_app/style.css
🛠️ Calling run_command with input: touch todo_app/script.js
🛠️ Calling run_command with input: echo "<!DOCTYPE html>..." > todo_app/index.html
🛠️ Calling run_command with input: echo "body { ... }" > todo_app/style.css
🛠️ Calling run_command with input: echo "function addTodo() { ... }" > todo_app/script.js
🤖 Todo app created in the todo_app folder!
```

### 🤯 What just happened
- You said "create a todo app"
- The AI agent **designed the file structure**
- **Wrote HTML, CSS, and JavaScript**
- **Created the actual files on your disk**
- This is essentially **vibe coding** — the AI is building software for you

---

## 17. Even Crazier — Agent Modifies Itself

You can ask the agent to **modify its own code**:

```
👤 User: In the folder weather_agent, there's an agent.py file with 2 tools.
        Add more tools for file handling: create_file, read_file, list_directory,
        delete_file, update_file, etc.

🛠️ Calling run_command: cat weather_agent/agent.py
🧠 I can see the current tools, let me add new ones
🛠️ Calling run_command: echo "def create_file(path, content)..." >> agent.py
🤖 Added 5 new tools to your agent!
```

The agent is **upgrading itself**.

---

## 18. Best Practices for Production Agents

### Don't use raw `run_command`
Instead, build **structured tools** with proper validation:

```python
def create_file(path: str, content: str):
    """Create a file at path with given content"""
    # Validate path is safe (no .., no absolute paths outside workspace)
    # Validate content size
    with open(path, 'w') as f:
        f.write(content)
    return f"Created {path}"

def read_file(path: str):
    """Read contents of a file"""
    # Validation here
    with open(path, 'r') as f:
        return f.read()

def list_directory(path: str = "."):
    """List files in directory"""
    return os.listdir(path)

def delete_file(path: str):
    """Delete a file"""
    # Confirmation, sandboxing
    os.remove(path)
    return f"Deleted {path}"
```

### Why structured tools > raw command
| Raw `run_command` | Structured tools |
|---|---|
| Dangerous (any command) | Limited capabilities |
| LLM has to construct commands correctly | Tool handles syntax |
| Hard to validate inputs | Easy to validate per tool |
| Hard to log/audit | Easy to track what was done |
| Hard to test | Easy to unit test |

---

## 19. Agent Design Patterns

### Pattern 1 — Plan-Execute-Observe
What you've been building. Agent plans steps, executes tools, observes results.

### Pattern 2 — ReAct (Reason + Act)
Similar but more interleaved — every reasoning step is paired with an action.

### Pattern 3 — Multi-Agent
Multiple specialized agents that talk to each other (e.g., a "researcher" agent + a "writer" agent + a "reviewer" agent).

### Pattern 4 — Hierarchical
A "manager" agent breaks tasks into sub-tasks for "worker" agents.

### 🎯 In production
Frameworks like **LangChain**, **LangGraph**, **CrewAI**, and **AutoGen** provide these patterns out of the box.

---

## 🎯 Master Summary

| Concept | Key idea |
|---|---|
| **LLM** | "Brain in a jar" — can think but can't do anything |
| **Tool** | A Python function the LLM can call |
| **Agent** | LLM + Tools + Loop = autonomous worker |
| **System prompt** | Tells LLM what tools exist and how to use them |
| **Agent loop** | Keep calling LLM until step="output" |
| **Step types** | start → plan → tool → observe → plan → ... → output |
| **Tool execution** | YOUR code calls the tool, LLM just decides which |
| **Observe step** | Feed tool's result back into message history |
| **Structured outputs** | Use Pydantic schemas for guaranteed JSON shape |
| **`chat.completions.parse()`** | OpenAI's structured output API |
| **`response_format=MyModel`** | Pass a Pydantic class for strict schema |
| **`.parsed`** | Access the typed object directly |
| **CLI agents** | `run_command` tool can build entire applications |
| **Vibe coding** | Describing what you want; AI builds it |

---

## 🔑 Key Learnings

1. **LLMs alone are "dumb brains"** — they can think but can't act.
2. **Agents = LLM + tools + a loop** — that's the entire formula.
3. **Tools are just Python functions** — nothing fancy.
4. **The LLM decides WHICH tool** — your code actually calls it.
5. **Step-based reasoning** (start → plan → tool → observe → output) makes agents reliable.
6. **Always feed tool results back** as "observe" messages in the conversation history.
7. **The same agent can use multiple tools** — even multiple times for one query.
8. **Structured outputs with Pydantic** eliminate parsing errors and improve reliability.
9. **`chat.completions.parse()`** is the OpenAI method for structured outputs.
10. **`.parsed`** gives you a typed Python object directly — no `json.loads()`.
11. **Adding more tools = adding more capabilities** — the agent learns automatically.
12. **`run_command` is powerful but dangerous** — prefer structured, validated tools in production.
13. **Agents can build entire applications** when given file/command tools — this is how Cursor/Claude Code work.
14. **Agents can even modify themselves** — adding tools, refactoring code.
15. **Production agents** should have logging, error handling, rate limiting, and safety guardrails.

---

## 📌 Interview Cheat Sheet

| Question | Answer |
|---|---|
| **What is an AI agent?** | An LLM enhanced with tools (callable functions) and a control loop, enabling it to take actions in the real world, not just generate text. |
| **How does an agent differ from a regular LLM?** | A regular LLM only generates text. An agent can call external functions to perform actions like API calls, file operations, or database queries. |
| **What's a "tool" in agent context?** | A function the LLM can call by emitting a structured tool-call message. The application code executes the tool and feeds the result back. |
| **How does the agent loop work?** | LLM decides next step (plan/tool/output) → if tool, app executes it → result is appended to history as "observe" → loop until "output" step. |
| **Why use Pydantic structured outputs?** | To guarantee the LLM's response matches an exact schema — eliminating parsing errors, providing type safety, and reducing prompt complexity. |
| **What's the difference between `create()` and `parse()`?** | `create()` returns raw JSON strings; `parse()` accepts a Pydantic model and returns a typed Python object via `.parsed`. |
| **How do agents like Cursor or Claude Code work?** | They give an LLM tools like file_read, file_write, run_command, etc. The LLM plans actions, the app executes them, and the loop continues until the task is complete. |
| **What are risks of agents?** | Hallucinations, infinite loops, tool misuse, security risks (especially with run_command), high token costs from long loops. |
| **How do you prevent infinite loops?** | Set a max iteration limit, use timeouts, add cost tracking, and have escape conditions in the system prompt. |
| **What are agent design patterns?** | Plan-Execute-Observe, ReAct (Reason+Act), Multi-Agent, Hierarchical. Frameworks like LangChain, LangGraph, and CrewAI implement these. |
| **Why feed tool results back as "observe"?** | The LLM is stateless — without putting tool results in the conversation history, the LLM wouldn't know what the tool returned for the next decision. |
| **Should production agents use `run_command`?** | No — it's a security risk. Use structured tools with input validation, sandboxing, and audit logging. |

---

## 💡 Instructor's Final Thoughts

> "An LLM is like a brain in a jar — it can think, but it can't do anything. Once you give it tools, you've given it hands and legs. That's an agent."

> "An LLM with tools = an agent. That's the entire formula."

> "Frameworks like Cursor and Claude Code are just LLMs with the right tools — file operations, command execution, and a smart agent loop."

> "Structured outputs with Pydantic are the modern way to build agents. Use `chat.completions.parse()` instead of relying on `json.loads()`."

---

End of Section — Building AI Agents & Agentic Workflows. Next up: RAG (Retrieval Augmented Generation)!
