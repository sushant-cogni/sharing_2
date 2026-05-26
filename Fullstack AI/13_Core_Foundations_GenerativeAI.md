# 📘 Notes — Core Foundations for Generative AI

> **Section:** How LLMs Work — The Foundation
> **What you'll learn:** What LLMs are, how they generate text, what GPT really means, tokenization, vector embeddings, positional encoding, and the Transformer architecture.
> **Interview-ready:** Explanations are written so you can use them directly in interviews.

---

## 1. What is an LLM?

> **LLM = Large Language Model** — an AI system trained to **understand** and **generate** human language.

### Interview-ready definition
An LLM is a type of AI model trained on massive amounts of text data (Internet articles, books, code, tweets, etc.) to understand natural language and generate human-like text responses.

### Why "Large"?
Because they are trained on **huge datasets** — billions to trillions of words from the entire Internet.

### Real-world examples of LLMs
| Company | Models |
|---|---|
| **OpenAI** | GPT-3.5, GPT-4, GPT-4o, GPT-o3, GPT-o3-mini |
| **Google** | Gemini 1.5, Gemini 2.5, Gemini 2.5 Pro |
| **Anthropic** | Claude 3, Claude Sonnet, Claude 4 |
| **Mistral** | Mistral, Mixtral |

### What's the difference between ChatGPT and GPT?
- **GPT** = the actual LLM (the brain)
- **ChatGPT** = the chat interface where you talk to GPT

So when you "chat with ChatGPT," you're really chatting with the GPT model behind it.

### The USP of LLMs
You can talk to a machine in **plain natural language** — no need to learn C, Java, or any structured language. Just type like you'd talk to a human.

---

## 2. How LLMs Work — The Black Box Explained

When you say "Hi" to ChatGPT and it responds "Hey there!", what's actually happening?

```
USER INPUT (Input Tokens) → [ LLM ] → RESPONSE (Output Tokens)
       "Hi"                              "Hey there!"
```

### Key terminology

| Term | Meaning |
|---|---|
| **Input Tokens** | What the user gives to the LLM |
| **Output Tokens** | What the LLM gives back |

---

## 3. What Does "GPT" Actually Mean?

GPT = **Generative Pre-trained Transformer**

This name perfectly describes how the model works. Let's break it down:

| Word | What it means |
|---|---|
| **Generative** | It *generates* new content (it doesn't just search like Google) |
| **Pre-trained** | It's trained on data *before* you use it (not learning live) |
| **Transformer** | The actual architecture (the "brain design") it uses |

### Interview-ready breakdown

**"Generative"** — Unlike Google (which searches existing pages for keywords), GPT *creates* responses on the spot. Each response is generated fresh based on your input — that's why even the same question can get slightly different answers.

**"Pre-trained"** — The model can't generate from nothing. It needs prior knowledge. So it's *pre-trained* on massive datasets, similar to how a student must read books before they can teach a class.

**"Transformer"** — This is the actual **architecture** of the model. It comes from a famous Google research paper called *"Attention Is All You Need"* (2017).

### Funny analogy from the instructor
Imagine you launched a **car company** and named it... "Car." Or a **shoe brand** named "Shoes." That's basically what OpenAI did with "GPT" — every modern LLM (Gemini, Claude, Mistral) is technically a *Generative Pre-trained Transformer*. OpenAI just trademarked the most obvious name.

---

## 4. The Transformer — Born from "Attention Is All You Need"

The Transformer architecture comes from a **Google white paper called "Attention Is All You Need" (2017)**. This is the foundation of every modern LLM.

### Original use case: Google Translate
Google originally built Transformers for **language translation** — taking an English sentence and converting it to French, Hindi, etc.

```
Input sequence  →  [ Transformer ]  →  Output sequence
"Hello"                                "Bonjour"
```

### How GPT uses Transformers — predicting the next token

The key insight of GPT: a Transformer can be used to **predict the next token** in a sequence.

### Step-by-step example

User asks: `"Hey there"`

```
Step 1: Input = "Hey there"          → Transformer predicts: "I"
Step 2: Input = "Hey there I"        → Transformer predicts: " am"
Step 3: Input = "Hey there I am"     → Transformer predicts: " good"
Step 4: Input = "Hey there I am good"→ Transformer predicts: <END>

Final output: "I am good"
```

### 🎯 Interview-ready summary
> "GPT is essentially a Transformer model that predicts the next most likely token, given the previous tokens. It does this iteratively — each predicted token gets fed back as input until an end-of-sequence token is reached. That's why generating long responses is **CPU/GPU intensive** — the model runs the prediction loop dozens or hundreds of times for a single response."

This is also **why LLMs need GPUs** — running the prediction loop hundreds of times for a single response is computationally heavy.

---

## 5. What is a Token?

> A **token** is a unit of text that the model processes. It can be a word, part of a word, a character, or even a punctuation mark.

Computers don't understand letters — they understand **numbers**. So before any text reaches the LLM, it's converted into numbers (tokens).

### Simple example (just for illustration)
If we assigned: `A=1, B=2, C=3, D=4, E=5`
- Input: `"BDE"` → Tokens: `[2, 4, 5]`

### Real tokenization
In reality, tokens are not always one character. They might be:
- A whole word (`"hello"` = 1 token)
- A part of a word (`"Piyush"` might split into `"Pi"` + `"yush"`)
- A symbol or space

Each model has its **own tokenization system**:
- GPT-4 tokens ≠ GPT-3.5 tokens
- Gemini tokens ≠ Claude tokens

### Visualizing tokens — use the [Tiktokenizer website](https://tiktokenizer.vercel.app/)
Type any sentence and see how it's broken into tokens for different models.

Example with GPT-4o:
```
"Hey there, my name is Piyush K."
```
Gets split into roughly:
- `"Hey"` → 22556
- `" there"` → 1354
- `","` → 11
- `" my"` → 856
- ... and so on

### 🎯 Interview-ready definition
> "Tokenization is the process of converting human-readable text into a sequence of numbers (tokens) that the LLM can process. Each LLM has its own tokenization scheme, and the choice of tokenizer affects model efficiency and cost — because LLMs are billed per token."

### The full flow

```
User input (text)
   ↓ tokenization
[List of numbers / tokens]
   ↓ sent to LLM
LLM predicts next tokens (more numbers)
   ↓ de-tokenization
Output text (human-readable response)
```

---

## 6. Code Your Own Tokenizer (Hands-On)

OpenAI provides a free library called **`tiktoken`** to tokenize and de-tokenize text.

### Step 1: Setup

```bash
python -m venv venv          # create virtual environment
source venv/bin/activate     # activate (Mac/Linux) — Windows: venv\Scripts\activate
pip install tiktoken         # install OpenAI's tokenizer
pip freeze > requirements.txt  # save dependencies
```

### Step 2: Tokenize and de-tokenize

```python
import tiktoken

# Get the tokenizer for a specific model
encoder = tiktoken.encoding_for_model("gpt-4o")

# Tokenize (encode) text → numbers
text = "Hey there, my name is Piyush Garg"
tokens = encoder.encode(text)
print("Tokens:", tokens)
# e.g., [22556, 1354, 11, 856, 1308, 374, 5760, 1531, 25130]

# De-tokenize (decode) numbers → text
decoded = encoder.decode(tokens)
print("Decoded:", decoded)
# "Hey there, my name is Piyush Garg"
```

### What you've just built
The exact same process LLMs use behind the scenes:
1. **Encode** user input → numbers
2. **LLM predicts** next numbers
3. **Decode** numbers → human text → show to user

---

## 7. The Transformer Architecture — High-Level View

The full Transformer architecture (from the paper) looks complex, but here are the **core steps** that matter:

```
INPUT TEXT
    ↓
[Tokenization]
    ↓
[Input Embeddings]       ← convert tokens into vector embeddings
    ↓
[Positional Encoding]    ← add position info to embeddings
    ↓
[Multi-Head Attention]   ← let tokens "talk" to each other for context
    ↓
[Feed Forward Layer]     ← a neural network layer
    ↓
[Linear Layer]           ← produces probability distribution over next tokens
    ↓
[Softmax]                ← picks the most probable next token
    ↓
NEXT TOKEN PREDICTION
```

### ⚠️ Important distinction (instructor's note)

There are two types of people in AI:
| ML / Researchers | Application Developers |
|---|---|
| Build the foundation models (GPT, Gemini, etc.) | Build apps using those models |
| Deep into math + research papers | Solve business problems |
| Need to understand all internal layers | Just need a high-level understanding |
| Write papers | Write APIs and agents |

**This course is for application developers.** You don't need to deeply understand every formula — you just need a high-level "what's happening" picture. The deep math is optional.

---

## 8. Vector Embeddings (⭐ Critical Concept)

> **Vector embeddings = numerical representations of tokens that capture their semantic meaning and relationships.**

### Interview-ready definition
> "Vector embeddings convert tokens into multi-dimensional vectors (lists of numbers) such that words with **similar meanings** end up close to each other in vector space. This lets LLMs understand the meaning and relationships between words, not just their textual form."

### The intuition — why we need them

When I say:
- "dog" → you picture a dog
- "cat" → you picture a cat
- "Paris" → you picture Eiffel Tower
- "India" → you picture India Gate

These are just **letters**, but somehow they carry **real-world meaning** in your brain. How do we make the computer understand this same meaning?

**Answer:** Vector embeddings.

### 2D visualization (simplified)

Imagine plotting words on a 2D graph:

```
       (countries)
          India •
                |
       Paris •  |
        ___|___|________
       |       |
       | dog • |
       | cat • |   ← (animals)
       |
       Eiffel •
            (landmarks)
```

Key insights:
- **Similar concepts are close** — dog/cat are near each other (both animals).
- **Relationships are preserved as directions** — the vector from "Paris" to "Eiffel Tower" is similar to the vector from "India" to "India Gate" (both are: country → famous landmark).

### Classic example
```
King - Man + Woman ≈ Queen
```
This works because vector embeddings preserve relationships — "King" minus "male-ness" plus "female-ness" lands you near "Queen."

### In reality
Real embeddings are NOT 2D. They have **hundreds to thousands of dimensions** (e.g., OpenAI's `text-embedding-3` has 1536 dimensions). But the concept stays the same — similar meanings = close vectors.

### 🌐 See it visually
Try Google's TensorFlow Embedding Projector — it shows real vector embeddings in 3D space.

### 🎯 Why this matters for AI apps
Vector embeddings are the **foundation of RAG (Retrieval Augmented Generation)** — you'll see them everywhere when building AI applications.

---

## 9. Positional Encoding (Why Word Order Matters)

> **Positional encoding adds information about WHERE each token appears in the sequence.**

### Why we need it — the brutal example

| Sentence 1 | Sentence 2 |
|---|---|
| "Dog ate cat" | "Cat ate dog" |

If you only use vector embeddings:
- `dog`, `ate`, `cat` → produce the same set of embeddings either way
- The model can't tell which animal got eaten!

### The fix — add position info

After creating vector embeddings, we add a **positional encoding** that tells the model: "this token is at position 0, this one is at position 1, this one is at position 2."

```
"Dog ate cat"     →  vec(dog) + pos(0)
                     vec(ate) + pos(1)
                     vec(cat) + pos(2)

"Cat ate dog"     →  vec(cat) + pos(0)
                     vec(ate) + pos(1)
                     vec(dog) + pos(2)
```

Now the two sentences produce **completely different** combined embeddings → the model understands the difference.

### 🎯 Interview-ready definition
> "Positional encoding injects information about token positions into the embeddings. Without it, the Transformer would treat 'dog ate cat' and 'cat ate dog' as identical, because raw embeddings don't capture sequence. Positional encoding ensures word order is preserved."

---

## 10. Self-Attention and Multi-Head Attention

> **Attention = letting tokens look at other tokens to understand context.**

### Self-Attention — words talking to each other

After positional encoding, **self-attention** lets each token "look at" every other token in the sentence to adjust its meaning based on context.

### The classic "bank" example

| Phrase | Meaning of "bank" |
|---|---|
| "river bank" | The side of a river |
| "ICICI bank" | A financial institution |

The word "bank" is identical in both. Without context, the model can't tell them apart.

**Self-attention** lets "bank" pay attention to neighboring words:
- "river bank" → the embedding of "bank" shifts toward water/nature meaning
- "ICICI bank" → the embedding of "bank" shifts toward finance meaning

### 🎯 Interview-ready definition
> "Self-attention allows each token to compute how much it should 'pay attention' to every other token in the sequence. This lets the model dynamically adjust the meaning of a token based on its context — solving ambiguity problems like the word 'bank' having different meanings."

### Multi-Head Attention — looking at multiple aspects at once

A single attention "head" looks at one aspect. **Multi-head attention** runs many attention mechanisms in parallel, each focusing on a different aspect.

### Train analogy
Imagine watching a train pass by. You notice:
- "There's a dog" (subject)
- "The dog is sleeping" (action)
- "It's a Labrador" (specifics)
- "It's near the door" (position)
- "The train is moving fast" (background)

Your brain is doing **multi-head attention** — focusing on multiple aspects simultaneously to fully understand the scene.

### 🎯 Interview-ready definition
> "Multi-head attention runs multiple self-attention operations in parallel, each focused on a different aspect of the context — like syntax, semantics, position, and relationships. This gives the model a richer, more nuanced understanding of each token."

---

## 11. The Final Layers — Linear and Softmax

After all the attention layers, the model needs to produce the **next token prediction**.

### Linear Layer
Outputs a **probability distribution** over all possible next tokens. For example:

| Token | Probability |
|---|---|
| "hello" | 0.85 |
| "hi" | 0.10 |
| "hey" | 0.03 |
| "xyz" | 0.001 |
| ... | ... |

### Softmax
Picks the **most probable token** from the distribution (or samples from it if temperature/randomness is enabled).

### 🎯 Interview-ready summary
> "The Linear layer projects the model's internal state into a vector of size = vocabulary, where each value represents the score for a possible next token. Softmax converts these scores into probabilities, and the most probable token (or a sampled one based on temperature) becomes the prediction."

---

## 12. Putting It All Together — Full Flow

When you ask ChatGPT "Hey there, how are you?", here's everything that happens:

```
1. "Hey there, how are you?"
       ↓
2. Tokenization              → [4421, 837, 11, ..., 91]
       ↓
3. Input Embeddings          → vectors that capture meaning
       ↓
4. Positional Encoding       → add WHERE each token is
       ↓
5. Multi-Head Attention      → tokens learn context from each other
       ↓
6. Feed Forward Layer        → neural network processing
       ↓
7. Linear Layer              → probabilities for next token
       ↓
8. Softmax                   → pick most likely → "I"
       ↓
9. APPEND "I" to input, REPEAT steps 3–8
       ↓
10. Eventually predict END token
       ↓
11. De-tokenize the full output
       ↓
12. "I am doing well, thanks!"
```

---

## 🎯 Interview Cheat Sheet

| Question | Answer |
|---|---|
| **What is an LLM?** | A large AI model trained on massive text data to understand and generate human language. |
| **What does GPT stand for?** | Generative Pre-trained Transformer — generates content, pre-trained on data, uses Transformer architecture. |
| **What is a token?** | A unit of text (word, sub-word, character) converted to a number for the LLM to process. |
| **What is tokenization?** | Converting human text into a sequence of numbers (tokens). |
| **What are vector embeddings?** | Numerical vectors that capture the semantic meaning of tokens — similar meanings = close vectors. |
| **Why positional encoding?** | Without it, the model can't tell "dog ate cat" from "cat ate dog" — it injects word order info. |
| **What is self-attention?** | A mechanism that lets tokens look at other tokens to adjust meaning based on context. |
| **What is multi-head attention?** | Multiple self-attention operations in parallel, each focusing on a different aspect of context. |
| **How does GPT generate text?** | It predicts the next token, appends it to input, then predicts the next — iteratively until END. |
| **Why do LLMs need GPUs?** | Because the prediction loop runs hundreds of times per response, and each step involves heavy matrix math. |
| **Difference between ChatGPT and GPT?** | GPT is the LLM (brain); ChatGPT is the chat interface around it. |
| **What is the "Attention Is All You Need" paper?** | The 2017 Google paper that introduced the Transformer architecture — the foundation of every modern LLM. |

---

## 🔑 Key Learnings

1. **LLMs are not magic** — they're statistical models predicting the next token.
2. **GPT = Generative Pre-trained Transformer** — generative output, trained beforehand, using Transformer architecture.
3. **Computers process numbers, not text** — that's why **tokenization** is needed.
4. Each model has its **own tokenizer** — GPT, Gemini, Claude all tokenize differently.
5. **Vector embeddings** capture semantic meaning — similar words = nearby vectors.
6. **Positional encoding** preserves word order — without it, "dog ate cat" = "cat ate dog."
7. **Self-attention** lets tokens look at each other for context (solves ambiguity).
8. **Multi-head attention** = multiple attention mechanisms in parallel = richer understanding.
9. The **Linear + Softmax** layers produce the next-token prediction.
10. **Text generation is iterative** — predict one token at a time, then feed back as input.
11. This iteration is **why LLMs need GPUs** — heavy matrix math, hundreds of times per response.
12. The **Transformer architecture** comes from the **"Attention Is All You Need"** paper (Google, 2017).
13. **As an app developer**, you don't need to master the math — just understand the flow.
14. **Vector embeddings are essential for RAG** — coming up next!

---

## 💡 Instructor's Final Thoughts

> "There's a line between the ML researcher and the application developer. ML people build the foundation models — deep math, deep research. Developers build apps that **use** these models — that's where you make money and solve business problems. We're on the developer side. Understanding all of this is bonus context, not a requirement."

> "Don't worry if every line of the transformer architecture doesn't click — even the instructor admits they've **never used it directly** for application work. We're learning it just to have the big picture."

---

End of Section — Core Foundations of Generative AI. Next up: Building real AI applications and agents!
