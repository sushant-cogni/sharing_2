# 📘 Notes — Advanced Prompt Engineering Techniques

> **Section:** Prompt Engineering — making LLMs give you 10x better output
> **Why this matters:** The same LLM can give terrible or amazing output depending on HOW you prompt it. This is one of the most important skills in AI development.
> **Interview-ready:** Prompt engineering is asked in every AI engineering interview.

---

## 1. What is Prompting?

> A **prompt** is the instruction (or set of instructions) you give to an LLM to guide its behavior and output.

### Interview-ready definition
> "Prompting is the practice of crafting input messages to an LLM such that we get the most accurate, useful, and constrained output possible. Good prompts can improve LLM accuracy by 10x to 20x compared to free-flowing queries."

### The problem with free-flowing prompts
By default, an LLM will answer ANYTHING:
- Math questions ✓
- Coding questions ✓
- Tell jokes ✓
- Translate languages ✓

This is **too unbounded** for real applications. You need to **control** what your LLM does.

---

## 2. The System Prompt — Your First Tool

> The **system prompt** is a special instruction message that sets the LLM's behavior, role, and constraints.

```python
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {
            "role": "system",
            "content": "You are an expert in maths and only answer maths-related questions. If the query is not related to maths, just say sorry and do not answer."
        },
        {
            "role": "user",
            "content": "Hey, can you code a Python program?"
        }
    ]
)
```

### What happens
The LLM responds:
```
Sorry, I can only answer questions related to mathematics.
```

But if you ask a math question:
```
Can you help me solve (A + B)²?
→ Sure! (A + B)² = A² + 2AB + B²
```

### 🎯 Key insight
> The system prompt **shapes the LLM's behavior** for the entire conversation. It's the most powerful single tool in prompt engineering.

---

## 3. Message Roles in OpenAI

| Role | Purpose |
|---|---|
| `system` | High-level instructions, persona, rules |
| `user` | The actual user query |
| `assistant` | The LLM's previous response (in conversation history) |
| `tool` | Function call results (in agentic flows) |

The `messages` parameter is a **list** because LLMs are **stateless** — they don't remember previous messages. You must send the full conversation history every time.

---

# 🎯 PROMPTING TECHNIQUES

---

## 4. Zero-Shot Prompting

> **Zero-shot prompting** = giving the LLM direct instructions WITHOUT any examples.

### Interview-ready definition
> "Zero-shot prompting is the simplest technique where the model is given a direct instruction or task description without any prior examples. It relies on the model's pre-trained knowledge to figure out what to do."

### Example
```python
system_prompt = """
You should only and only answer coding-related questions.
Do not answer anything else.
Your name is Alexa.
If user asks something other than coding, just say sorry.
"""

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "Hey, can you tell me a joke?"}
    ]
)
# Output: "Sorry."
```

### When to use
- Simple, well-defined tasks
- When you trust the model to interpret your instructions
- Quick prototypes

### Limitations
- Less predictable for complex tasks
- Inconsistent output format
- Model may misinterpret instructions

---

## 5. Few-Shot Prompting ⭐ (widely used)

> **Few-shot prompting** = giving the LLM direct instructions PLUS some examples to demonstrate the expected behavior.

### Interview-ready definition
> "Few-shot prompting provides the model with a small number of examples within the prompt, teaching it the desired input-output pattern. This significantly improves accuracy and consistency compared to zero-shot prompting."

### Example with structure
```python
system_prompt = """
You are an AI assistant who only answers coding-related questions.
If the question is not coding-related, say sorry.

Examples:

Q: Can you explain (A + B)²?
A: Sorry, I can only help with coding-related questions.

Q: Write a Python function to add two numbers
A: def add(a, b):
       return a + b

Q: What's the weather like today?
A: Sorry, I can only help with coding-related questions.
"""
```

### Why few-shot prompts are powerful
- **Increases accuracy by 5-10x** for complex tasks
- **Demonstrates** the expected pattern instead of describing it
- **Reduces ambiguity** in your instructions
- Works because LLMs are excellent at **pattern matching**

### 🎯 Real-world tip
In production, you typically give **50-60+ examples** for best results. The more diverse and specific the examples, the better.

### When to use
- Complex tasks where instructions alone aren't enough
- Tasks with specific output format requirements
- Persona-based agents (more on this below)
- Domain-specific responses

---

## 6. Few-Shot + Structured Output (JSON Mode) ⭐

A common pattern: use few-shot examples to enforce a **JSON output format**.

### Why structure matters
By default, LLMs give free-flowing text. But in code, you need predictable, parseable output.

### Example — coding assistant returning JSON

```python
system_prompt = """
You are a coding assistant.

Rule:
- Strictly follow the output in JSON format.

Output Format:
{
    "code": string or null,
    "is_coding_question": boolean
}

Examples:

Q: Can you explain (A + B)²?
A: { "code": null, "is_coding_question": false }

Q: Write a JavaScript function to add n numbers
A: { "code": "function add(...args) { return args.reduce((a,b) => a+b, 0); }", "is_coding_question": true }
"""

response = client.chat.completions.create(
    model="gpt-4o",
    response_format={"type": "json_object"},   # ⭐ enables JSON mode
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "Can you explain A+B whole square?"}
    ]
)
```

### Output
```json
{
    "code": null,
    "is_coding_question": false
}
```

### The `response_format` parameter

```python
response_format={"type": "json_object"}    # JSON mode
response_format={"type": "json_schema"}    # strict schema mode
```

### 🎯 Why this is powerful
Now you can parse the response with `json.loads()` and access fields like `data["code"]` — exactly like calling any API.

---

## 7. Chain-of-Thought (CoT) Prompting ⭐⭐

> **Chain-of-Thought prompting** = forcing the LLM to **think step-by-step** before giving a final answer.

### Interview-ready definition
> "Chain-of-thought prompting instructs the LLM to break down its reasoning into intermediate steps before arriving at the final answer. This dramatically improves accuracy on complex tasks like math, logic, and code generation. Models like OpenAI's o3 and DeepSeek are built around this technique."

### Why it works
LLMs are next-token predictors. When you force them to "think out loud," each token of reasoning helps generate the next more accurate token. The model essentially does its own scratch work.

### The 4-step pattern
1. **Start** — user gives a query
2. **Plan** — model thinks step by step (multiple times)
3. **Output** — final answer

### Detailed example — Math Problem Solver

```python
system_prompt = """
You are an expert AI assistant in resolving user queries using chain of thought.
You work on START, THINK/PLAN, and OUTPUT steps.

You need to first PLAN what needs to be done.
Planning can have multiple steps.
Once enough planning is done, finally you can give an OUTPUT.

Rules:
- Strictly follow the given JSON output format.
- Only run one step at a time.
- The sequence of steps is: START → PLAN (multiple times) → OUTPUT

Output JSON Format:
{
    "step": "start" or "plan" or "output",
    "content": string
}

Example:
Question: Can you solve 2 + 3 * 5 / 10?

{ "step": "start", "content": "User wants to solve 2 + 3 * 5 / 10" }
{ "step": "plan",  "content": "Seems like user is interested in maths problem" }
{ "step": "plan",  "content": "Looking at the problem, we should solve using BODMAS method" }
{ "step": "plan",  "content": "First we must multiply 3 by 5, which is 15. New equation: 2 + 15 / 10" }
{ "step": "plan",  "content": "Now we must perform divide: 15 / 10 = 1.5. New equation: 2 + 1.5" }
{ "step": "plan",  "content": "Now let's perform add: 2 + 1.5 = 3.5" }
{ "step": "plan",  "content": "Great, we have solved and finally left with 3.5 as answer" }
{ "step": "output", "content": "3.5" }
"""
```

### The catch — manual loop
With the basic version, you must **manually re-call the LLM** for each step, appending the previous result to the history.

```python
messages = [
    {"role": "system", "content": system_prompt},
    {"role": "user", "content": "Write code to add n numbers in JavaScript"}
]

# Call 1: get the first plan step
response = client.chat.completions.create(...)
messages.append({"role": "assistant", "content": response.choices[0].message.content})

# Call 2: get the next plan step
response = client.chat.completions.create(...)
messages.append({"role": "assistant", "content": response.choices[0].message.content})

# ... continue until "output" step
```

This is tedious — let's automate it.

---

## 8. Automating Chain-of-Thought 🔄

Wrap the LLM calls in a **loop** that continues until the model produces an `"output"` step.

```python
import json
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI()

system_prompt = """..."""    # the CoT prompt from above

# Initialize message history
message_history = [
    {"role": "system", "content": system_prompt}
]

# Get user input
print("\n\n")
user_query = input("> ")
message_history.append({"role": "user", "content": user_query})

# The automated CoT loop
while True:
    response = client.chat.completions.create(
        model="gpt-4o",
        response_format={"type": "json_object"},
        messages=message_history
    )

    raw_result = response.choices[0].message.content
    parsed_result = json.loads(raw_result)

    # Add assistant response to history
    message_history.append({"role": "assistant", "content": raw_result})

    # Check the step type
    step = parsed_result.get("step")
    content = parsed_result.get("content")

    if step == "start":
        print(f"🔥 {content}")
        continue

    if step == "plan":
        print(f"🧠 {content}")
        continue

    if step == "output":
        print(f"🤖 {content}")
        break    # we have our answer, exit the loop

print("\n\n")
```

### How this works
1. User gives input
2. Loop runs until `step == "output"`
3. Each iteration:
   - LLM returns one JSON step
   - We append it to history
   - Print it with an emoji icon
   - Continue if it's a `plan`, break if it's `output`

### Sample output
```
> Can you solve 2 + 3 / 10 * 6 * 4 - 50?

🔥 User wants to solve a mathematical expression
🧠 Looking at the problem, we apply BODMAS
🧠 First, perform division: 3 / 10 = 0.3
🧠 Now: 2 + 0.3 * 6 * 4 - 50
🧠 Next, multiply: 0.3 * 6 * 4 = 7.2
🧠 Now: 2 + 7.2 - 50
🧠 Finally, perform addition and subtraction
🤖 -40.8
```

### 🎯 Why CoT is THE most important technique
- It powers **OpenAI's o3, DeepSeek-R1, Gemini Thinking models**
- It dramatically improves performance on **math, code, logic**
- It makes LLMs explainable (you see the reasoning)
- It's the foundation of **AI agents**

---

## 9. Persona-Based Prompting

> **Persona-based prompting** = making the LLM mimic a specific person, character, or role.

### Use cases
- **Customer service bots** (mimic your company's voice)
- **Educational tutors** (mimic a famous teacher)
- **Companion AIs** (mimic a friend, mentor)
- **Roleplay games**

### Example — Cloning yourself

```python
system_prompt = """
You are an AI Persona assistant named Piyush Garg.
You are acting on behalf of Piyush Garg, who is 25 years old,
a tech enthusiast and principal engineer.
Your main tech stack is JS and Python.
You are learning GenAI these days.

Example of how Piyush talks:
- "Hey, what's up?"
- "Yeah man, that's cool!"
- "Let me code this real quick"

When asked "How are you?" you might respond:
"Hey, I'm doing great! Just working on some GenAI stuff. What about you?"
"""
```

### 🎯 The secret to good persona prompts — EXAMPLES
> "Persona-based prompting is heavily dependent on examples. You should give 100-150 examples of how the person actually talks, what they say in different situations, and their typical phrases."

### Where to get examples
- **WhatsApp chat history** with the person
- **LinkedIn comments** they've made
- **Twitter posts**
- **Social media bios**
- **YouTube transcripts** (if they're a public figure)

### 🎯 Pro tip
Combine persona + few-shot + structured output for production-grade chatbots that feel like a specific person.

---

## 10. Comparison of Prompting Techniques

| Technique | What it is | When to use | Accuracy |
|---|---|---|---|
| **Zero-shot** | Direct instruction, no examples | Simple tasks, quick tests | ⭐⭐ |
| **Few-shot** | Instruction + examples | Most production cases | ⭐⭐⭐⭐ |
| **Few-shot + JSON** | Examples + structured output | API-like responses, integration | ⭐⭐⭐⭐⭐ |
| **Chain-of-Thought** | Step-by-step reasoning | Math, logic, code, complex problems | ⭐⭐⭐⭐⭐ |
| **Persona-based** | Mimic a specific role/person | Chatbots, roleplay, customer service | ⭐⭐⭐⭐ |

---

## 11. Best Practices for Prompt Engineering

### 1. Be SPECIFIC
❌ "Help me with coding"
✓ "You only answer Python coding questions. Reject other queries."

### 2. Use STRUCTURE
- Use headers, bullet points, examples
- Number your rules
- Separate sections clearly

### 3. Give EXAMPLES (lots of them)
- 5-10 examples = good
- 50+ examples = production quality

### 4. ENFORCE OUTPUT FORMAT
- Use JSON mode for parseable output
- Show examples in the exact format you want

### 5. Set GUARDRAILS
- Define what the LLM should NOT do
- Use phrases like "ONLY answer X" or "If user asks Y, respond with Z"

### 6. ITERATE
- Test your prompt with edge cases
- Refine based on actual outputs
- Add examples that cover failure modes

### 7. Watch for COSTS
- More tokens in prompt = more cost
- Use system prompts efficiently
- Cache common prompts when possible

---

## 12. Common Mistakes

| Mistake | Fix |
|---|---|
| Vague instructions | Be specific and detailed |
| No examples | Add 5-10+ examples |
| No output format | Use JSON mode or specify format |
| Mixing instructions and examples poorly | Use clear sections (rules, format, examples) |
| Forgetting to add assistant responses to history | Always append for stateful conversations |
| Forgetting `response_format={"type": "json_object"}` for JSON | Add it explicitly |
| Hardcoding API keys | Use `.env` file |
| Not handling errors in the CoT loop | Wrap in try/except |

---

## 🎯 Master Summary

| Concept | Key idea |
|---|---|
| **Prompt** | The input message that controls LLM behavior |
| **System prompt** | High-level instructions for the entire conversation |
| **`messages` list** | Stateless — send full history each call |
| **Zero-shot** | Direct instruction, no examples |
| **Few-shot** | Instruction + examples (production standard) |
| **JSON mode** | `response_format={"type": "json_object"}` for structured output |
| **Chain-of-Thought** | Step-by-step reasoning before answer |
| **Automated CoT** | Loop until `step == "output"` |
| **Persona-based** | Mimic a person/role with extensive examples |
| **More examples = better** | 50+ examples for production |

---

## 🔑 Key Learnings

1. **Prompting is the MOST important skill** in AI app development — better prompts = 10-20x better output.
2. **System prompts shape behavior** — use them to set role, rules, and constraints.
3. **LLMs are stateless** — you must send full message history each call.
4. **Zero-shot** is for simple tasks; **few-shot** is for everything else.
5. **Examples are gold** — give as many as possible, ideally 50+ for production.
6. **JSON mode** enables parseable output via `response_format={"type": "json_object"}`.
7. **Chain-of-Thought** dramatically improves accuracy by forcing step-by-step reasoning.
8. **CoT can be automated** by looping until the LLM produces an `"output"` step.
9. **Modern reasoning models** (o3, DeepSeek-R1) use CoT under the hood.
10. **Persona prompts** require many real-world examples (chats, posts, etc.) to feel authentic.
11. **Always append** assistant responses to history for stateful conversations.
12. **Test with edge cases** — refine the prompt based on actual outputs.

---

## 📌 Interview Cheat Sheet

| Question | Answer |
|---|---|
| **What is prompt engineering?** | The practice of designing input messages to LLMs to maximize output quality, accuracy, and consistency. |
| **What is a system prompt?** | A special instruction sent at the start that shapes the LLM's behavior, persona, and constraints for the entire conversation. |
| **What's the difference between zero-shot and few-shot prompting?** | Zero-shot gives only instructions; few-shot adds examples to teach the LLM the expected pattern. |
| **Why are few-shot prompts more effective?** | LLMs are pattern matchers — examples demonstrate exactly what you want, reducing ambiguity. |
| **What is Chain-of-Thought (CoT) prompting?** | A technique that forces the LLM to reason step-by-step before answering, improving accuracy on complex tasks. |
| **Which models use CoT internally?** | OpenAI's o3, DeepSeek-R1, Gemini Thinking models — they generate reasoning tokens before the final answer. |
| **How do you get JSON output from an LLM?** | Use `response_format={"type": "json_object"}` and show JSON examples in the system prompt. |
| **Why are LLMs stateless?** | Each API call is independent; the model doesn't remember previous interactions, so you must send the full message history. |
| **How would you build a persona chatbot?** | Use a system prompt that defines the persona + 100+ examples of how that person actually communicates. |
| **How do you automate CoT?** | Loop API calls, appending each assistant response to history, until the LLM returns an `"output"` step. |
| **What roles exist in OpenAI messages?** | `system` (instructions), `user` (query), `assistant` (LLM responses), `tool` (function results). |

---

## 💡 Instructor's Final Thoughts

> "Chain-of-thought prompting is my personal favorite. It's the same technique that powers o3 and DeepSeek — making LLMs think before they speak."

> "Persona-based prompting is all about examples. You need 100-150 examples to make your AI sound like a real person. WhatsApp chats, LinkedIn comments, social posts — they all become training data for your persona."

> "Few-shot prompting is used a lot in real-world applications. You can give 50-60 examples easily and watch your accuracy jump by 50x."

---

End of Section — Advanced Prompt Engineering. Next up: Building real AI agents that use these techniques!
