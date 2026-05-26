# 📘 Notes — Advanced Prompt Engineering Techniques

> **Section:** Prompts & Prompt Engineering
> **What you'll learn:** What prompts are, system prompts, and the 4 major prompting techniques — Zero-Shot, Few-Shot, Chain-of-Thought, and Persona-Based.
> **Interview-ready:** Prompt engineering is one of the most asked topics in AI engineering interviews — these techniques are foundational.

---

## 1. What is Prompting?

> **A prompt is the input you give to an LLM to guide its behavior and output.**

### Interview-ready definition
> "Prompting is the practice of crafting input messages to an LLM so that it produces the desired output. A well-engineered prompt can drastically improve accuracy, control output format, and define the AI's behavior — without retraining the model."

### Without prompting
If you just ask the LLM something with no instructions, it's a **free-flowing conversation**:
- It can answer ANYTHING — math, jokes, code, philosophy
- No context, no restrictions
- Inconsistent and unpredictable

This is **not how production AI apps work**. You always set context and constraints.

### Enter the System Prompt
A **system prompt** is special instructions for the LLM, given BEFORE the user's message. It defines:
- **What the AI is** (role/persona)
- **What it should do**
- **What it shouldn't do**
- **The output format**

### Example — Restricting an LLM to math only

```python
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Using OpenAI SDK with Gemini (free)
client = OpenAI(
    api_key="YOUR_GEMINI_API_KEY",
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

response = client.chat.completions.create(
    model="gemini-2.5-flash",
    messages=[
        {
            "role": "system",
            "content": "You are an expert in maths and only answer maths-related questions. If the query is not related to maths, just say sorry and do not answer that."
        },
        {
            "role": "user",
            "content": "Can you code a Python program that prints hello?"
        }
    ]
)

print(response.choices[0].message.content)
# Output: "Sorry, I can only answer questions related to mathematics."
```

### 🎯 Why system prompts matter
- **Binding behavior** — restricts the AI to a domain
- **Setting context** — gives the AI background it needs
- **Consistency** — same behavior across all conversations
- **Safety** — prevents off-topic or unsafe responses

---

## 2. The Four Major Prompting Techniques

| Technique | What it does | When to use |
|---|---|---|
| **Zero-Shot** | Just give instructions, no examples | Simple, direct tasks |
| **Few-Shot** | Give instructions + examples | When you want to control output format/style |
| **Chain-of-Thought** | Make the AI think step-by-step | Complex reasoning, math, multi-step problems |
| **Persona-Based** | Make AI mimic a specific person | Personalized assistants, chatbots, character mimicry |

We'll go through each one in detail.

---

# 🎯 Technique 1 — Zero-Shot Prompting

## 3. Zero-Shot Prompting

> **Zero-Shot = give instructions directly, with NO examples.**

### Interview-ready definition
> "Zero-shot prompting is when the model is given a task or question through direct instructions, without any prior examples. The model is expected to perform the task purely based on its pre-trained knowledge."

### Example

```python
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(
    api_key="YOUR_GEMINI_API_KEY",
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

system_prompt = """
You should only and only answer coding-related questions.
Do not answer anything else.
Your name is Alexa.
If user asks something other than coding, just say sorry.
"""

response = client.chat.completions.create(
    model="gemini-2.5-flash",
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "Can you tell me a joke?"}
    ]
)

print(response.choices[0].message.content)
# Output: "Sorry"
```

### Test cases

| User asks | Response |
|---|---|
| "Can you tell me a joke?" | "Sorry" |
| "Translate 'hello' to Hindi" | "Sorry" |
| "Write a Python code to translate text" | ✅ Code provided |

### 🎯 When to use Zero-Shot
- Simple, well-defined tasks
- When the LLM should already know how to do it
- Quick prototyping

### ⚠️ Limitations
- Less predictable output format
- May not follow specific styles
- Harder to control nuances

---

# 🎯 Technique 2 — Few-Shot Prompting

## 4. Few-Shot Prompting

> **Few-Shot = give instructions + several EXAMPLES of how to respond.**

### Interview-ready definition
> "Few-shot prompting is when the model is provided with a few examples (typically 3-50) before being asked to generate a response. These examples teach the model the desired pattern, format, and style — significantly improving output accuracy."

### Example

```python
system_prompt = """
You should only and only answer coding-related questions.
Do not answer anything else.
Your name is Alexa.
If user asks something other than coding, just say sorry.

Examples:
Q: Can you explain A plus B whole square?
A: Sorry, I can only help with coding-related questions.

Q: Write a code in Python for adding two numbers
A: def add(a, b):
       return a + b

Q: What's the weather today?
A: Sorry, I can only help with coding-related questions.
"""
```

### Why examples are POWERFUL

Without examples, the model **might still** answer a math question. But once you show it explicit examples of "math question → sorry," the behavior becomes **much more consistent**.

> 💡 **In production**, you give 50-100+ examples for best results.

### 🎯 Two main benefits of Few-Shot Prompting
1. **Higher accuracy** — model learns the exact pattern from examples
2. **Output structure control** — can bind the output format precisely

---

## 5. Structured Output with Few-Shot Prompting ⭐

This is one of the most powerful patterns. You can force the AI to **always respond in a specific JSON format** by providing examples.

### Example

```python
system_prompt = """
You should only and only answer coding-related questions.
Your name is Alexa.

Rule 1: Strictly follow the output in JSON format.

Output format:
{ "code": string or null, "is_coding_question": boolean }

Examples:
Q: Can you explain A plus B whole square?
A: { "code": null, "is_coding_question": false }

Q: Write a code to add n numbers in JS
A: { "code": "function add(...nums) { return nums.reduce((a,b) => a+b, 0); }", "is_coding_question": true }
"""

response = client.chat.completions.create(
    model="gemini-2.5-flash",
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "Write a code to add n numbers in JavaScript"}
    ]
)

print(response.choices[0].message.content)
# Output:
# { "code": "function add(...nums) { ... }", "is_coding_question": true }
```

### Why this is valuable

Now you can **parse the JSON in Python** and access fields:
```python
import json
result = json.loads(response.choices[0].message.content)

if result["is_coding_question"]:
    print("Code:", result["code"])
else:
    print("Not a coding question")
```

### 🎯 Interview-ready
> "Few-shot prompting with output format constraints is how I enforce structured responses from an LLM without using function calling or structured output features. By providing JSON-format examples in the system prompt, the LLM learns to consistently return parseable output that the application can directly use."

---

# 🎯 Technique 3 — Chain-of-Thought Prompting

## 6. Chain-of-Thought (CoT) Prompting

> **Chain-of-Thought = make the AI THINK step-by-step BEFORE giving the final answer.**

### Why this matters
Without CoT, the AI gives a direct answer. With CoT, the AI:
1. **Plans** what needs to be done
2. **Breaks** the problem into steps
3. **Solves** each step
4. **Verifies** before finalizing
5. **Outputs** the final answer

> 💡 Models like **GPT-o3** and **DeepSeek-R1** are based on chain-of-thought reasoning. They think before they speak — just like humans.

### Interview-ready definition
> "Chain-of-thought prompting instructs an LLM to break down a problem into intermediate reasoning steps before producing the final answer. This significantly improves accuracy on complex tasks like math, logic, and multi-step problems — because the model uses its own intermediate outputs as 'thinking' tokens."

---

## 7. The CoT Pattern — Manual Implementation

### System prompt structure

```
You are an expert AI assistant in resolving user queries using chain of thought.
You work on START, THINK/PLAN, and OUTPUT steps.

You need to first PLAN what needs to be done. The plan can be multiple steps.
Once you think enough plan has been done, finally you can give an OUTPUT.

Rules:
- Strictly follow the given JSON output format
- Only run ONE step at a time
- Sequence of steps: START → PLAN → PLAN → ... → OUTPUT

Output JSON format:
{ "step": "start" | "plan" | "output", "content": "..." }

Example:
User asks: Solve 2 + 3 * 5 / 10

START: { "step": "start", "content": "User wants to solve a math problem" }
PLAN:  { "step": "plan", "content": "Seems like user is interested in a math problem" }
PLAN:  { "step": "plan", "content": "Using BODMAS, multiply 3 * 5 first" }
PLAN:  { "step": "plan", "content": "3 * 5 = 15, new equation: 2 + 15 / 10" }
PLAN:  { "step": "plan", "content": "Now divide 15 / 10 = 1.5" }
PLAN:  { "step": "plan", "content": "New equation: 2 + 1.5" }
PLAN:  { "step": "plan", "content": "Add: 2 + 1.5 = 3.5" }
OUTPUT: { "step": "output", "content": "3.5" }
```

### Manual usage

```python
response = client.chat.completions.create(
    model="gpt-4o",
    response_format={"type": "json_object"},  # ⭐ enforce JSON
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "Write a code to add n numbers in JavaScript"}
    ]
)

print(response.choices[0].message.content)
# Output: { "step": "plan", "content": "User wants a JavaScript code..." }
```

### Manually appending each step (the hard way)

Each time you get a `"plan"` step, you must:
1. Append the assistant's message to history
2. Re-call the LLM to get the next step
3. Repeat until you get `"output"`

This is **tedious to do manually** — let's automate it.

---

## 8. Automated CoT — The Loop Pattern ⭐

Here's the full code that automates the whole CoT loop:

```python
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI()    # uses OpenAI for chain-of-thought (Gemini may fail here)

system_prompt = """..."""  # the CoT system prompt from above

# Initialize message history with system prompt
message_history = [
    {"role": "system", "content": system_prompt}
]

# Take user input
user_query = input("👤 > ")

# Add user message to history
message_history.append({"role": "user", "content": user_query})

# Run the loop until we get an OUTPUT step
while True:
    response = client.chat.completions.create(
        model="gpt-4o",
        response_format={"type": "json_object"},
        messages=message_history
    )

    raw_result = response.choices[0].message.content
    parsed_result = json.loads(raw_result)

    # Always append assistant response back to history
    message_history.append({"role": "assistant", "content": raw_result})

    step = parsed_result.get("step")
    content = parsed_result.get("content")

    if step == "start":
        print(f"🔥 {content}")
        continue

    elif step == "plan":
        print(f"🧠 {content}")
        continue

    elif step == "output":
        print(f"🤖 {content}")
        break
```

### What the loop does

1. **System prompt** + **user query** → message history
2. Call the LLM with full history
3. Parse the JSON response
4. **Always append assistant's response to history** (so it builds context)
5. Print based on step type:
   - 🔥 `start` → show as start
   - 🧠 `plan` → show as thinking
   - 🤖 `output` → show as final answer and break
6. Continue until output is reached

### 🎯 Key insight — LLM connections are stateless

Each API call is independent. The LLM doesn't remember the previous call. That's why we keep appending to `message_history` and resend the whole list every time.

> "Conversations with LLMs are stateless. Every API call needs the full message history to maintain context. This is why message history is a **growing list** that you must manage on the client side."

### Example run

```
👤 > Can you solve 2 + 3 / 10 * 6 * 4 / 1 - 50?

🔥 User wants to solve a mathematical expression
🧠 The expression is 2 + 3 / 10 * 6 * 4 / 1 - 50
🧠 Following BODMAS, division and multiplication first
🧠 3 / 10 = 0.3
🧠 0.3 * 6 = 1.8
🧠 1.8 * 4 = 7.2
🧠 7.2 / 1 = 7.2
🧠 Now: 2 + 7.2 - 50
🧠 2 + 7.2 = 9.2
🧠 9.2 - 50 = -40.8
🤖 -40.8
```

### ⚠️ Note on providers
- **OpenAI works well** for CoT (`response_format={"type": "json_object"}` is supported).
- **Gemini may fail** on some JSON edge cases — use OpenAI for production CoT.

---

# 🎯 Technique 4 — Persona-Based Prompting

## 9. Persona-Based Prompting

> **Persona-Based = make the AI mimic a specific person or character.**

### Interview-ready definition
> "Persona-based prompting is a technique where the LLM is given a detailed identity — including background, tone, speaking style, and examples — to make it behave as if it were a specific person or character. This is used for creating personalized chatbots, character AI, customer service bots that match brand tone, and even AI clones of real individuals."

### Use cases
- **Personal AI clones** (e.g., "talk to a Steve Jobs AI")
- **Customer service bots** matching company tone
- **Character AI** for games and storytelling
- **Personal assistants** with custom personalities

---

## 10. Building a Persona — Step by Step

### Example: Creating a "Piyush Garg" persona

```python
system_prompt = """
You are an AI Persona Assistant named Piyush Garg.

Background:
- You are acting on behalf of Piyush Garg
- 25 years old
- Tech enthusiast
- Principal engineer
- Main tech stack: JavaScript and Python
- Currently learning GenAI

Tone & Style examples:
Q: Hey
A: Hey, what's up?

Q: How are you doing?
A: Doing pretty good, thanks for asking! What's on your mind?

Q: Tell me about yourself
A: I'm Piyush, a principal engineer who lives and breathes code. I've been deep into JS and Python for a while, and now I'm exploring GenAI. What about you?

[... give 50-100+ more examples ...]
"""

response = client.chat.completions.create(
    model="gemini-2.5-flash",
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "Who are you?"}
    ]
)

print(response.choices[0].message.content)
# Output: "Hey, I'm Piyushka! Principal engineer, tech enthusiast..."
```

### 🎯 The key to good personas — EXAMPLES

The more examples you provide, the more accurately the AI mimics the persona.

### Where to get examples
- **WhatsApp chat history** of the person
- **LinkedIn comments** they've written
- **Twitter/X posts and replies**
- **Email writing samples**
- **Recorded interviews / podcasts**

> 💡 **Quality of persona = Quality of examples × Quantity of examples**

### Real-world challenge from the instructor
> "Try creating a persona of your best friend using their WhatsApp chat history. Give 100+ examples of how they talk, their background, their interests. When you chat with the AI, it will feel like your friend is responding."

---

## 11. Why Persona-Based is Powerful

| Aspect | What it lets you do |
|---|---|
| **Brand consistency** | Customer support bot always speaks in your brand voice |
| **Personal AI** | Create a chatbot version of yourself |
| **Character AI** | Build interactive fictional characters |
| **Cultural matching** | AI that speaks in regional dialects and slang |
| **Domain expertise** | "You are a senior architect with 20 years of experience..." |

### ⚠️ Ethical consideration
- Always get consent before creating a persona of a real person.
- Don't use persona prompting to impersonate someone for fraud.
- Disclose to users when they're talking to an AI persona.

---

## 12. Comparison of All 4 Techniques

| Technique | Description | Examples needed | Best for |
|---|---|---|---|
| **Zero-Shot** | Just instructions | 0 | Simple, well-defined tasks |
| **Few-Shot** | Instructions + examples | 3-100 | Format/style control, accuracy boost |
| **Chain-of-Thought** | Step-by-step reasoning | A few step examples | Complex math, multi-step logic |
| **Persona-Based** | Mimic an identity | 50-100+ | Personalized chatbots, character AI |

### Choosing the right technique

```
Is the task simple? ─── YES ──→ Zero-Shot
       │
       NO
       │
       ↓
Do you need specific format/style? ─── YES ──→ Few-Shot
       │
       NO
       │
       ↓
Is multi-step reasoning needed? ─── YES ──→ Chain-of-Thought
       │
       NO
       │
       ↓
Mimic a person/character? ─── YES ──→ Persona-Based
```

### 💡 In real production, these techniques are COMBINED

Example: A customer service bot might use:
- **Persona-based** (brand voice)
- **Few-shot** (output format examples)
- **Chain-of-thought** (for complex troubleshooting)

---

## 🎯 Master Summary

| Concept | Key idea |
|---|---|
| **Prompt** | The input you give an LLM to guide its behavior |
| **System prompt** | Special pre-instructions that define AI's role/behavior |
| **Roles** | `system`, `user`, `assistant`, `tool` |
| **Zero-shot** | Instructions only, no examples |
| **Few-shot** | Instructions + examples — powerful for format control |
| **JSON output** | Use `response_format={"type": "json_object"}` + examples |
| **Chain-of-thought** | Step-by-step thinking before answering |
| **CoT loop** | Auto-loop until step="output" — keep appending to history |
| **Stateless LLMs** | Each call is independent; resend full history every time |
| **Persona-based** | Detailed identity + tone examples = AI mimicry |
| **Quality = examples** | More examples = better accuracy and behavior |

---

## 🔑 Key Learnings

1. **A prompt is not just the user's message** — it includes system instructions, examples, and context.
2. **System prompts define the AI's identity** — name, role, restrictions, output format.
3. **Zero-shot** is fast but less controlled.
4. **Few-shot** dramatically improves accuracy — give 3-50+ examples.
5. **Few-shot can enforce JSON output** without using function calling features.
6. **Chain-of-thought** makes the AI "think" — better for complex problems.
7. **CoT requires looping** — keep calling the LLM until `step=="output"`.
8. **Message history is stateful on YOUR side, stateless on LLM's side** — always send the full history.
9. **Persona-based** needs **50-100+ examples** for accurate mimicry.
10. **Examples are everything** — quality of output = quality + quantity of examples.
11. **Modern reasoning models (GPT-o3, DeepSeek-R1) are essentially built-in CoT**.
12. **Always use `response_format={"type": "json_object"}`** when you want JSON output (OpenAI).
13. **Combine techniques in production** — most real apps use multiple.
14. **Gemini can fail on strict JSON parsing** — use OpenAI for production CoT.

---

## 📌 Interview Cheat Sheet

| Question | Answer |
|---|---|
| **What is prompt engineering?** | The practice of designing input prompts to get desired outputs from LLMs without retraining them. |
| **What's a system prompt?** | A special pre-instruction sent before user messages that defines the AI's role, behavior, and constraints. |
| **What's zero-shot prompting?** | Giving the model only instructions, no examples — relying on its pre-trained knowledge. |
| **What's few-shot prompting?** | Including 3-50+ examples of input-output pairs to teach the model the desired pattern. |
| **What's chain-of-thought prompting?** | Instructing the model to break problems into intermediate reasoning steps before giving the final answer. |
| **Why does CoT improve accuracy?** | The model uses its own intermediate outputs as "thinking" tokens, improving multi-step reasoning. |
| **Why is message history needed?** | LLM API calls are stateless — to maintain conversation context, you must send the full history each time. |
| **What's persona-based prompting?** | Giving the model detailed identity (background + tone + 50-100+ examples) so it mimics a specific person or character. |
| **How do you enforce JSON output?** | Use `response_format={"type": "json_object"}` + few-shot examples of the JSON structure. |
| **When would you combine techniques?** | Real production apps usually combine persona + few-shot + CoT — e.g., a brand-voiced customer support bot with structured responses and reasoning. |
| **What models are built on CoT?** | GPT-o3, DeepSeek-R1 — they have CoT reasoning built into their training. |

---

## 💡 Instructor's Final Thoughts

> "Chain-of-thought is my personal favorite. It's how reasoning models like GPT-o3 work — they think before they act."

> "In production, you don't just give 5 examples. You give 50, 100, even 1000+ examples. The more examples, the better the AI gets at the pattern."

> "The challenge: try creating a persona of your best friend using their WhatsApp chat. With enough examples, you'll feel like you're talking to them."

---

End of Section — Advanced Prompt Engineering. Next up: Building real AI agents and workflows!
