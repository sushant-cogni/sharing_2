# GenAI & RAG — Full Course Notes
## Chapter 2: Prompt Engineering

---

> You now know what an LLM is and how it works. This chapter is about how to talk to it properly. This is the first practical skill in the course. No code yet — just patterns and thinking. Code starts in Chapter 3.

---

## 2.1 — What is Prompt Engineering?

A **prompt** is whatever you send to the LLM. It can be a question, an instruction, a paragraph, a task — anything.

**Prompt Engineering** is the skill of writing prompts in a way that consistently gets you the best possible output from an LLM.

You might think — "I just type my question normally, why does this need to be a skill?"

Here is why.

An LLM does not "understand" you the way a human does. It predicts what the most likely next tokens are based on your input. How you phrase your input changes what the model predicts as a response. The same question, worded differently, can give completely different results — one useful, one not.

**Example:**

Prompt 1: "Explain recursion."
→ You might get a generic textbook definition.

Prompt 2: "Explain recursion to a complete beginner using a simple real-life analogy. Keep it under 5 sentences."
→ You will get a clear, short, beginner-friendly explanation.

Same topic. Very different results. That is why prompt engineering matters.

---

## 2.2 — The Structure of an LLM API Call

Before learning techniques, you need to understand the basic structure of how you communicate with an LLM.

Every API call has three main parts:

**1. System Prompt**
This is the instruction you give the model about how it should behave. Think of it as the job description you give to an employee before they start work.

"You are a helpful assistant that only answers questions about cooking. If asked anything else, politely say you cannot help with that."

The model will follow this instruction for the entire conversation.

**2. User Message**
This is what the user (or you, the developer) is asking in that moment.

"What is the best way to make biryani at home?"

**3. Assistant Message**
This is what the LLM replies with.

In multi-turn conversations, you also send the history of previous user and assistant messages so the model has context of the conversation so far.

```
System:    "You are a cooking assistant..."
User:      "How do I make biryani?"
Assistant: "To make biryani, you need..."
User:      "What spices are essential?"   ← new message
```

The model sees all of this together when generating the next reply. That is how it remembers the conversation.

---

## 2.3 — Zero-Shot Prompting

**Zero-shot** means you give the model a task with no examples. You just describe what you want.

```
Classify the sentiment of this review as Positive, Negative, or Neutral.

Review: "The food was okay but the service was terrible."
```

The model has never been shown examples of what Positive/Negative/Neutral looks like for your specific task — yet it can do it because of its training on vast data.

Zero-shot works well for common tasks. For unusual or very specific tasks, it may not be reliable.

---

## 2.4 — Few-Shot Prompting

**The problem with zero-shot:**
For specific or unusual tasks, the model may not understand exactly what format or style you want.

**The solution → Few-Shot Prompting.**

You give the model a few examples of input → output pairs before asking it to do the actual task. The model learns the pattern from your examples and applies it.

```
Classify the sentiment. Reply with only one word: Positive, Negative, or Neutral.

Review: "Best restaurant I have ever been to!"
Sentiment: Positive

Review: "Waited 45 minutes and the food was cold."
Sentiment: Negative

Review: "It was fine, nothing special."
Sentiment: Neutral

Review: "The ambience was great but the food was overpriced."
Sentiment:
```

Now the model knows exactly the format you want — one word, and which words are valid. No confusion.

**Rule of thumb:** Use 2 to 5 examples. Too few may not establish the pattern. Too many wastes tokens and cost.

---

## 2.5 — Chain-of-Thought Prompting

**The problem:**
For tasks that require reasoning — math, logic, multi-step analysis — LLMs often jump straight to the answer and get it wrong.

**Why does this happen?**
Remember, the model predicts tokens. If you ask "What is 15% of 840?" it may just predict a number without actually calculating step by step. It may predict a wrong number because a wrong number can also be a likely next token in that context.

**The solution → Chain-of-Thought (CoT) Prompting.**

You tell the model to think step by step before giving the final answer.

**Without CoT:**
```
What is 15% of 840?

Answer: 116
```
(Wrong — correct answer is 126)

**With CoT:**
```
What is 15% of 840? Think through this step by step before giving the final answer.

Step 1: 10% of 840 = 84
Step 2: 5% of 840 = 42
Step 3: 15% = 84 + 42 = 126

Answer: 126
```

By forcing the model to write out its reasoning, it is less likely to make errors because each step constrains the next.

**The magic phrase:** Simply adding `"Think step by step"` or `"Let's think through this carefully"` to your prompt significantly improves accuracy on reasoning tasks.

This is not a trick — it actually changes what tokens the model generates, and those intermediate reasoning tokens guide the final answer tokens.

---

## 2.6 — The ReAct Pattern (Reason + Act)

This is a more advanced version of chain-of-thought, and it is the foundation of how AI agents work (covered in a later chapter).

**The idea:** The model does not just reason — it also takes actions, observes results, and reasons again.

The loop looks like this:
```
Thought: I need to find the current population of India.
Action: search("India population 2025")
Observation: India's population is approximately 1.44 billion.
Thought: Now I have the information. I can answer the question.
Answer: India's population in 2025 is approximately 1.44 billion.
```

You will not write this manually every time — later you will use frameworks like LangChain that handle this loop for you. But understanding the pattern is important.

---

## 2.7 — System Prompt Design

The system prompt is where you define the "character" and "rules" for your AI.

A well-written system prompt makes your application reliable, predictable, and safe.

**What a good system prompt includes:**

**1. Role definition**
"You are a customer support assistant for a software company called TechFlow."

**2. What it should and should not do**
"Only answer questions related to TechFlow's products. If someone asks about anything else, say: 'I can only help with TechFlow-related questions.'"

**3. Tone and style**
"Always be professional, friendly, and concise. Do not use jargon."

**4. Format instructions**
"When listing steps, always use numbered lists. Keep answers under 150 words unless the question requires more detail."

**5. Special knowledge (if needed)**
"TechFlow offers three plans: Starter ($9/month), Pro ($29/month), and Enterprise (custom pricing)."

**Full example:**
```
You are a helpful customer support assistant for TechFlow, a project management software company.

Your job is to:
- Answer questions about TechFlow's features, pricing, and plans
- Help users troubleshoot common issues
- Guide users to the correct documentation when needed

Do not:
- Discuss competitor products
- Make promises about future features
- Answer questions unrelated to TechFlow

Tone: Friendly, professional, concise.
Format: Use numbered steps for instructions. Keep responses under 200 words.

TechFlow Plans:
- Starter: $9/month — up to 5 users
- Pro: $29/month — up to 25 users  
- Enterprise: Custom pricing — unlimited users
```

With this system prompt in place, no matter what the user asks, the model behaves consistently.

---

## 2.8 — Structured Output Prompting

**The problem:**
When you are building an application, you do not want the LLM to reply with a paragraph of text. You want structured data — JSON, so your code can parse it and use it.

If you ask the model: "Extract the name, age, and city from this text" — and it replies:
"The person's name is Ravi, he is 28 years old, and he lives in Pune."

Your code cannot easily work with that. You want:
```json
{
  "name": "Ravi",
  "age": 28,
  "city": "Pune"
}
```

**The solution → tell the model to respond in JSON.**

```
Extract the following information from the text below and return it as a JSON object 
with these exact keys: name, age, city. Return only the JSON, no explanation.

Text: "Meet Ravi, a 28-year-old software developer from Pune."
```

Response:
```json
{
  "name": "Ravi",
  "age": 28,
  "city": "Pune"
}
```

**Important notes for structured outputs:**

1. Always say "Return only the JSON, no explanation" — otherwise the model wraps it in a sentence.
2. Specify the exact keys you want.
3. If you want nested structures, show an example of the structure.
4. Some APIs (like OpenAI) have a special "JSON mode" that forces the model to always return valid JSON. Use it when available.

**Example with nested structure:**
```
Extract all the products mentioned in the review below.
Return a JSON array where each item has: name, price (number), and sentiment (positive/negative/neutral).
Return only the JSON array, nothing else.

Review: "I bought the Sony headphones for ₹8000 — absolutely love them. 
Also got the charging cable for ₹500 but it stopped working in a week."
```

Expected output:
```json
[
  { "name": "Sony headphones", "price": 8000, "sentiment": "positive" },
  { "name": "charging cable", "price": 500, "sentiment": "negative" }
]
```

---

## 2.9 — Prompt Chaining

**The problem:**
Complex tasks cannot be done in a single prompt reliably. If you ask the model to do too many things at once, quality drops.

**The solution → Prompt Chaining.**

You break the big task into smaller steps. The output of one prompt becomes the input of the next.

**Example: Writing a blog post**

Instead of: "Write me a complete 1000-word SEO blog post on solar energy."

You chain it:

**Step 1 — Outline**
```
Generate a detailed outline for a 1000-word blog post titled 
"How Solar Energy Works: A Beginner's Guide". Return the outline only.
```
Output: [outline with sections]

**Step 2 — Write section by section**
```
Using this outline: [paste outline]
Write the Introduction section in detail. 
Tone: friendly, beginner-level. Length: 150 words.
```
Output: [introduction text]

**Step 3 — Review**
```
Review this blog post section for clarity, grammar, and tone. 
Suggest improvements if any. Text: [paste text]
```

Each step is focused. Each step's output is better than if you asked everything at once.

In code, you will automate this — the output of Step 1 automatically feeds into Step 2, and so on. This is a key pattern you will use in LangChain.

---

## 2.10 — Negative Prompting (Tell It What NOT To Do)

LLMs respond well to negative instructions — telling them what to avoid.

**Examples:**
- "Do not include disclaimers or caveats in your response."
- "Do not repeat the question back to me."
- "Do not use bullet points. Write in flowing paragraphs."
- "Do not add an introduction. Start directly with the answer."

Adding clear negative instructions removes the filler and fluff that LLMs tend to add.

---

## 2.11 — Common Prompt Mistakes (and How to Fix Them)

These are the most frequent mistakes beginners make:

---

**Mistake 1: Being too vague**

Bad: "Tell me about machine learning."
Better: "Explain what supervised learning is, in 3 sentences, as if I am a complete beginner."

Fix: Be specific about what you want, how long, what level, and what format.

---

**Mistake 2: Asking multiple unrelated things in one prompt**

Bad: "Summarize this article, translate it to Hindi, and also suggest 5 blog post titles based on it."

Better: Three separate prompts, or three clearly numbered tasks with clear separation.

Fix: One focused task per prompt, or clearly number multiple tasks.

---

**Mistake 3: Not specifying format**

Bad: "List the top 5 programming languages."

Better: "List the top 5 programming languages. Format your response as a numbered list. For each language, write one sentence explaining why it is popular."

Fix: Always say what format you want — list, JSON, paragraph, table, etc.

---

**Mistake 4: Not giving enough context**

Bad: "Is this a good idea?"

Better: "I am planning to build a mobile app that lets users track their water intake. My target audience is people aged 20–35. Is this a good business idea? Consider current market trends and competition."

Fix: Give the model enough context to give a useful answer. More relevant context = better output.

---

**Mistake 5: Trusting the output blindly**

The model can be confidently wrong. Always verify important facts, numbers, and claims from LLM output — especially for business, medical, or legal information.

---

## 2.12 — Prompt Templates

In real applications, you do not write prompts by hand every time. You write a **prompt template** — a prompt with placeholders — and fill in the values dynamically.

**Example:**

```
Template:
"Summarize the following customer review in one sentence. 
Tone: {{tone}}. 
Language: {{language}}.

Review: {{review_text}}"
```

When a customer submits a review, your code fills in the placeholders:
- `{{tone}}` → "professional"
- `{{language}}` → "English"
- `{{review_text}}` → actual review text

This is how you build reusable, scalable AI features. You will use this constantly in LangChain, where prompt templates are a first-class concept.

---

## 2.13 — Meta Prompting

Sometimes you do not know exactly what the best prompt is for a task. Meta prompting means you ask the LLM to help you write a better prompt.

```
I want to use an LLM to automatically categorize customer support tickets 
into one of these categories: Billing, Technical Issue, Feature Request, General Inquiry.

Write me the best possible system prompt for this task.
```

The model will generate a strong system prompt for you. You can then tweak it. This is a legitimate and very useful technique — let the model help you engineer the prompt.

---

## 2.14 — Putting It All Together: A Real Example

Let's say you want to build an AI feature that reads a product review and outputs:
1. A one-sentence summary
2. The overall sentiment
3. Key issues mentioned (if any)

Here is how you would combine everything you learned:

**System prompt:**
```
You are a product review analyst. Your job is to analyze customer reviews 
and extract structured information from them.
Always respond with valid JSON only. No explanation, no markdown, just the JSON object.
```

**User prompt template:**
```
Analyze the following product review and return a JSON object with these keys:
- summary: one sentence summary of the review
- sentiment: "positive", "negative", or "mixed"  
- issues: an array of specific problems mentioned (empty array if none)

Review: {{review_text}}
```

**Sample output:**
```json
{
  "summary": "The customer loved the product quality but faced delivery delays.",
  "sentiment": "mixed",
  "issues": ["delayed delivery", "poor packaging"]
}
```

This is production-ready prompt design. Clean, structured, reliable.

---

## Chapter 2 Summary

| Technique | When to use it |
|---|---|
| Zero-shot | Simple, common tasks |
| Few-shot | When format or style needs to be specific |
| Chain-of-thought | Math, logic, reasoning tasks |
| ReAct | When the model needs to take actions and observe |
| Structured output | When you need JSON for your code to parse |
| Prompt chaining | Complex multi-step tasks |
| Negative prompting | Removing unwanted patterns from output |
| Prompt templates | Building reusable, scalable AI features |

---

## What Is Coming Next

**Chapter 3 — Working with LLM APIs in Python**

Now you will write actual code. You will make your first API call to an LLM, handle responses, stream text word by word, manage conversation history, and use function calling — where the LLM can trigger functions in your code. This is where theory becomes working software.

---

*End of Chapter 2*
