# 📘 Notes — Prompt Styles & Instruction Formats

> **Section:** Prompt Serialization Formats (Bonus Knowledge)
> **What you'll learn:** The 3 major prompt formats — Alpaca, ChatML, and Instruction (INST) — and which one to use when.
> **Interview-ready:** Knowing different prompt formats is a sign of deep LLM knowledge that interviewers love.

---

## 1. What are Prompt Styles?

> **A prompt style = the FORMAT used to give instructions to an LLM.**

### Two different concepts (don't confuse them)

| Concept | What it means |
|---|---|
| **Prompting Techniques** | The STRATEGY — Zero-Shot, Few-Shot, Chain-of-Thought, Persona |
| **Prompt Styles (this section)** | The STRUCTURE — How the instructions are physically formatted before being sent to the model |

### Interview-ready definition
> "Prompt styles are different physical formats used to structure instructions sent to LLMs. Different model families (LLaMA, OpenAI, Mistral) have been trained on different formats — knowing the right format ensures the model parses your instructions correctly."

### Why this matters
- LLMs are trained on specific formats during fine-tuning.
- If you give them an unfamiliar format, **accuracy drops significantly**.
- Modern APIs (OpenAI, Gemini, Claude) handle this for you, but if you ever run local models, you must match the format the model expects.

---

## 2. The Three Major Prompt Styles

| Style | Used By | Format |
|---|---|---|
| **ChatML** | OpenAI, Gemini, Claude (modern APIs) | JSON-like with roles |
| **Alpaca** | Meta's Alpaca, LLaMA fine-tunes | Text-based with `###` markers |
| **Instruction (INST)** | LLaMA 2, Mistral | Text-based with `[INST]` tags |

> 💡 **In agentic AI work, you'll use ChatML 99% of the time** — but knowing the others helps when running local/open-source models.

---

# 🎯 Style 1 — ChatML (Most Common ⭐)

## 3. ChatML Format

This is the format you've **already been using** with OpenAI and Gemini APIs.

### Structure

```python
messages = [
    {"role": "system",    "content": "You are an AI expert in math..."},
    {"role": "user",      "content": "What is 2 + 2?"},
    {"role": "assistant", "content": "4"}
]
```

### Key elements

| Element | Meaning |
|---|---|
| `messages` | An **array** of message objects |
| `role` | Who is speaking — `system`, `user`, `assistant`, or `tool` |
| `content` | The actual text content |

### The four roles

| Role | Purpose |
|---|---|
| **`system`** | Pre-instructions, persona, rules — sets the AI's behavior |
| **`user`** | Input from the human user |
| **`assistant`** | LLM's responses (used when sending conversation history) |
| **`tool`** | Output from a function/tool call (for tool-use agents) |

### Example — Full ChatML conversation

```python
from openai import OpenAI

client = OpenAI()

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system",    "content": "You are a helpful coding assistant."},
        {"role": "user",      "content": "How do I reverse a list in Python?"},
        {"role": "assistant", "content": "Use the reverse() method or slicing [::-1]."},
        {"role": "user",      "content": "Show me an example."}
    ]
)
```

### 🎯 Why ChatML dominates
- **Clean JSON structure** — easy to parse, easy to extend.
- **Role separation** — clear who's saying what.
- **Used by OpenAI, Gemini, Claude** — the entire modern ecosystem.
- **Easy to build agents** — tool/function calls fit naturally.

### Interview-ready
> "ChatML is the prompt format used by OpenAI, Google Gemini, and Anthropic Claude. It uses a structured list of messages, where each message has a `role` (system, user, assistant, or tool) and `content`. This structured format makes it easy to manage conversation history, build agents, and integrate tool calls."

---

# 🎯 Style 2 — Alpaca Format

## 4. Alpaca Format

> **Used by:** Meta's Alpaca model, LLaMA fine-tunes
> **Style:** Text-based, uses `###` as separators

### Structure

```
### Instructions:
{system_prompt — what the AI should do}

### Input:
{user_query — what the user is asking}

### Response:
{leave empty — LLM completes from here}
```

### Real Example

Given a ChatML prompt:
```python
[
    {"role": "system",  "content": "You are an AI expert. Answer coding questions only."},
    {"role": "user",    "content": "Write a code to add n numbers in JavaScript"}
]
```

In **Alpaca format**, it becomes:

```
### Instructions:
You are an AI expert. Answer coding questions only.

### Input:
Write a code to add n numbers in JavaScript

### Response:
```

The LLM then **predicts what comes after `### Response:`** — that's the answer.

### 🎯 How it works internally
The model is trained to recognize that `### Response:` is where it should start generating. Everything before it is context (instructions + input).

### Why Alpaca was popular
- Simple, text-based format
- Easy for early instruction-tuned models to learn
- Doesn't require special parsing — just plain text

### When to use it today
- Running open-source LLaMA-derived models locally
- Working with older fine-tuned models
- Educational/research purposes

---

# 🎯 Style 3 — Instruction (INST) Format

## 5. INST Format

> **Used by:** LLaMA 2, Mistral, and other instruction-tuned models
> **Style:** Text-based, uses `[INST]` tags

### Structure

```
<s>[INST] <<SYS>>
{system_prompt}
<</SYS>>

{user_query} [/INST]
```

### Real Example

ChatML:
```python
[
    {"role": "system", "content": "You are a helpful assistant"},
    {"role": "user",   "content": "What is the time now?"}
]
```

In **INST format**:

```
<s>[INST] <<SYS>>
You are a helpful assistant
<</SYS>>

What is the time now? [/INST]
```

### Breaking down the tokens

| Token | Meaning |
|---|---|
| `<s>` | Begin of sequence/text |
| `[INST]` | Start of instruction block |
| `<<SYS>>` ... `<</SYS>>` | System prompt block |
| `[/INST]` | End of instruction — AI responds after this |

### 🎯 Why these special tokens?
LLaMA 2 and Mistral were **trained with these exact tokens** during instruction tuning. They literally learned that:
- After `[/INST]` → start generating a response
- Inside `<<SYS>>...<</SYS>>` → these are background rules

If you don't use these tokens, the model performs poorly.

---

## 6. Side-by-Side Comparison — Same Prompt, 3 Formats

Let's see the same conversation in all three formats:

**Task:** System: "You are an AI math expert." User: "What is 2+2?"

### ChatML
```python
messages = [
    {"role": "system", "content": "You are an AI math expert."},
    {"role": "user",   "content": "What is 2+2?"}
]
```

### Alpaca
```
### Instructions:
You are an AI math expert.

### Input:
What is 2+2?

### Response:
```

### INST
```
<s>[INST] <<SYS>>
You are an AI math expert.
<</SYS>>

What is 2+2? [/INST]
```

---

## 7. When Would You Use Which?

| Scenario | Recommended format |
|---|---|
| Building production AI app with OpenAI/Gemini/Claude | **ChatML** (it's automatic) |
| Running LLaMA 2 / Mistral locally | **INST** |
| Running Alpaca / older LLaMA fine-tunes | **Alpaca** |
| Building agentic AI / RAG / tool-calling | **ChatML** |
| Educational / experimenting with raw models | Match the model's training format |

### 🎯 The rule
> "**Match the format the model was trained on.** When in doubt, check the model's documentation on Hugging Face."

---

## 8. Quick Way to Convert Between Formats

You can use ChatGPT/Claude/Gemini themselves to convert between formats:

> "Convert the below to Alpaca-style prompt: [paste ChatML messages]"
> "Convert the below to INST-style prompt: [paste ChatML messages]"

Or you can write small helper functions:

```python
def chatml_to_alpaca(messages):
    system = next((m["content"] for m in messages if m["role"] == "system"), "")
    user   = next((m["content"] for m in messages if m["role"] == "user"), "")

    return f"""### Instructions:
{system}

### Input:
{user}

### Response:
"""


def chatml_to_inst(messages):
    system = next((m["content"] for m in messages if m["role"] == "system"), "")
    user   = next((m["content"] for m in messages if m["role"] == "user"), "")

    return f"""<s>[INST] <<SYS>>
{system}
<</SYS>>

{user} [/INST]"""
```

---

## 9. Other Formats You Might Encounter

This section covered the **top 3**, but there are more:

| Format | Used by |
|---|---|
| **Vicuna** | Vicuna model — `USER:` and `ASSISTANT:` tags |
| **WizardLM** | Variation of Alpaca format |
| **ShareGPT** | Multi-turn conversation in JSON |
| **OpenChat** | Custom format with `<|message|>` tokens |
| **Custom XML formats** | Some Anthropic experiments |

> 💡 **Practical advice:** Don't memorize all formats. Just know they exist, and know that **ChatML dominates production work** — focus your effort there.

---

## 🎯 Master Summary

| Format | Key marker | Used by | Use today? |
|---|---|---|---|
| **ChatML** | JSON with `role` and `content` | OpenAI, Gemini, Claude | ⭐ YES — 99% of work |
| **Alpaca** | `### Instructions:`, `### Input:`, `### Response:` | Alpaca, some LLaMA fine-tunes | Only for legacy models |
| **INST** | `[INST]`, `[/INST]`, `<<SYS>>` | LLaMA 2, Mistral | When running these models locally |

---

## 🔑 Key Learnings

1. **Prompt style ≠ Prompt technique** — style is the FORMAT, technique is the STRATEGY.
2. **ChatML** is the modern standard — JSON with roles and content.
3. **Alpaca** uses `###` markers — text-based, simple, used by older fine-tuned models.
4. **INST** uses `[INST]` and `<<SYS>>` tokens — specific to LLaMA 2 and Mistral.
5. **The format MUST match how the model was trained** — wrong format = bad output.
6. **Modern APIs (OpenAI, Gemini, Claude)** handle the format conversion internally — you just give ChatML.
7. **You'll only need other formats when running local/open-source models**.
8. **Roles in ChatML**: `system`, `user`, `assistant`, `tool`.
9. **`<s>`, `[INST]`, `<<SYS>>` are special tokens** baked into the model during training.
10. **For agentic AI**, ChatML is the only format you really need.
11. **Hugging Face model cards** tell you which format a model expects.
12. **Don't memorize formats** — bookmark a converter or use ChatGPT to convert when needed.

---

## 📌 Interview Cheat Sheet

| Question | Answer |
|---|---|
| **What is ChatML?** | A structured prompt format using a list of messages with `role` and `content` keys — used by OpenAI, Gemini, and Claude. |
| **What is Alpaca-style prompting?** | A text-based prompt format using `### Instructions:`, `### Input:`, and `### Response:` markers, used by Meta's Alpaca model. |
| **What is INST format?** | LLaMA 2 / Mistral's prompt format using `[INST]...[/INST]` tags with optional `<<SYS>>...<</SYS>>` for system prompts. |
| **Why do different models use different formats?** | Because each model is fine-tuned on a specific format — using the right one ensures the model recognizes where instructions end and responses begin. |
| **Which format should I use in production?** | ChatML — it's the standard for all modern hosted APIs (OpenAI, Gemini, Claude). |
| **What are the standard ChatML roles?** | `system`, `user`, `assistant`, and `tool`. |
| **What happens if you use the wrong format?** | The model may produce poor or unstructured output because it doesn't recognize where its response should begin. |
| **How do you know which format a model uses?** | Check the model card on Hugging Face — formats are always documented for instruction-tuned models. |
| **What's `<s>` in INST format?** | The "beginning of sequence" token that LLaMA 2 was trained to recognize. |
| **Is it worth learning Alpaca/INST?** | Only if you'll run open-source models locally. For API-based work, ChatML is enough. |

---

## 💡 Instructor's Final Thoughts

> "Treat this section as a bonus. In your agentic AI journey, 99% of the time you'll use ChatML — the role/content format with OpenAI, Gemini, and Claude. But you should KNOW that other formats exist."

> "The big tech giants — OpenAI, Google, Anthropic — have standardized on ChatML. That's what we'll stick with."

---

End of Section — Prompt Styles & Instruction Formats. Next up: Building real AI agents!
