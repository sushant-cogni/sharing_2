# 🤖 How LLMs Work — Notes from Piyush Garg's Video
> Originally explained in Hindi. Converted to clear, flowing English notes. Every concept in one logical flow.

---

## 📌 Table of Contents
1. [GPT Full Form — The Magic is in the Name](#1-gpt-full-form--the-magic-is-in-the-name)
2. [Generative vs Search Engines](#2-generative-vs-search-engines)
3. [How the Transformer Generates Output — The Loop](#3-how-the-transformer-generates-output--the-loop)
4. [Step 1 — Tokenization](#4-step-1--tokenization)
5. [Vocabulary — The Dictionary Behind Tokens](#5-vocabulary--the-dictionary-behind-tokens)
6. [Step 2 — Vector Embeddings](#6-step-2--vector-embeddings)
7. [Step 3 — Positional Encoding](#7-step-3--positional-encoding)
8. [Step 4 — Self-Attention](#8-step-4--self-attention)
9. [Step 5 — Multi-Head Attention](#9-step-5--multi-head-attention)
10. [Step 6 — Feed Forward + Normalization Loop](#10-step-6--feed-forward--normalization-loop)
11. [Step 7 — Output Generation (Linear + Softmax)](#11-step-7--output-generation-linear--softmax)
12. [Training Phase vs Inference Phase](#12-training-phase-vs-inference-phase)
13. [Temperature — Controlling Creativity](#13-temperature--controlling-creativity)
14. [Code Walkthrough — LLM in Action](#14-code-walkthrough--llm-in-action)
15. [Complete Summary — LLM in One Flow](#15-complete-summary--llm-in-one-flow)

---

## 1. GPT Full Form — The Magic is in the Name

The full form of GPT is:

```
G = Generative
P = Pre-trained
T = Transformer
```

Each word tells you exactly what GPT is doing under the hood:

- **Generative** → it generates new content (not just retrieves it)
- **Pre-trained** → it was trained on a huge dataset before you ever used it
- **Transformer** → the neural network architecture it runs on

There is no magic. Everything is just science, math, and code. You could technically build your own GPT-like model if you have enough compute resources.

---

## 2. Generative vs Search Engines

This is the most important fundamental difference to understand before going deeper.

### Traditional Search Engines (Google, Bing, Yahoo)

- They **do NOT generate** anything.
- They crawled the entire web, indexed that data, and when you search, they find and return relevant pre-existing results.
- They are **finders**, not **creators**.

### LLMs (ChatGPT, Gemini, Claude)

- They **generate** output on the spot.
- Based on your input prompt, they create new sequences of text **in real time**.
- They are **creators**, not finders.

**The key word is:** *Sequences* — LLMs generate the **next set of sequences** based on what you gave them as input and what they learned during pre-training.

> 💡 When you ask ChatGPT "How are you?" and it replies "I am doing great!" — that reply was not stored anywhere. It was generated fresh, on the spot, based on pre-training data.

---

## 3. How the Transformer Generates Output — The Loop

Here is the most fundamental thing to understand about how an LLM works:

> **An LLM does one thing and one thing only: predict the next word (token).**

Everything else — the long responses, the code, the essays — is just this one operation repeated many times.

### The Loop (Step by Step)

Let's say input is: **"Hey I am P"**

**Iteration 1:**
- Feed "Hey I am P" into Transformer
- Transformer predicts next token: **"i"**

**Iteration 2:**
- Feed "Hey I am Pi" into Transformer
- Transformer predicts next token: **"y"**

**Iteration 3:**
- Feed "Hey I am Piy" into Transformer
- Transformer predicts: **"u"**

**Iteration 4:**
- Feed "Hey I am Piyu" into Transformer
- Transformer predicts: **"s"**

**Iteration 5:**
- Feed "Hey I am Piyus" into Transformer
- Transformer predicts: **"h"**

**Iteration 6:**
- Feed "Hey I am Piyush" into Transformer
- Transformer predicts: **[END]**

Final output = "Hey I am Piyush"

This is basically **autocomplete** — but extremely powerful autocomplete, run optimally on massive data.

The loop continues until:
- The model predicts an **[END OF STRING]** token, OR
- It reaches a **max tokens** limit

This is the core mechanism of ChatGPT, Gemini, Claude — all of them.

---

## 4. Step 1 — Tokenization

### Why Tokenize?

Computers don't understand English, Hindi, Spanish, or any human language. They only understand **numbers**. So the first thing we do is convert text into numbers.

### What is Tokenization?

Tokenization = splitting text into pieces (tokens) and mapping each piece to a unique number.

**Simple example:**

If we have a master dictionary:
- "hey" → 10
- "there" → 20
- "let" → 36

Then **"Hey there"** becomes **[10, 20]**

**Character-level tokenization example:**

If A=1, B=2, C=3... then:
- "PIYUSH" → [P=16, I=9, Y=25, U=21, S=19, H=8] → 6 tokens

### Token vs Word

A **word** and a **token** are NOT the same thing. For example:
- The word "calling" might become 2 tokens: "call" + "ing"
- A space is also a token
- Punctuation is also a token

This is why for a sentence like "Hey there, my name is Piyush Garg" you might get 11 tokens even though there are only 6 words.

### It's Model-Specific

Every model has its OWN tokenizer. There is no universal standard.

- **GPT-4** tokenizes differently from **Google Gemma**
- **BERT** tokenizes differently from **GPT**

You can see live tokenization at: **tiktokenizer.vercel.app**

### Code (Using HuggingFace)

```python
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("google/gemma-2b")

result = tokenizer("Hey there")
print(result)  # → {'input_ids': [2, 17531, 2085, 23688], ...}
```

The numbers you get back are the token IDs — each word's position in that model's vocabulary dictionary.

### Larger Vocabulary = Smarter Tokenization

- **Large vocabulary** → whole words/phrases can be single tokens → more efficient
- **Small vocabulary** → each letter is its own token → less efficient, needs more tokens

---

## 5. Vocabulary — The Dictionary Behind Tokens

Every model has a **vocabulary** — a complete pre-built dictionary that maps every possible token to a number.

- **BERT:** ~30,522 tokens in vocabulary
- **GPT-4:** ~50,000+ tokens in vocabulary

The vocabulary is fixed after training. When you tokenize any input, you look up each piece in this dictionary to get its token ID.

---

## 6. Step 2 — Vector Embeddings

### Why Not Just Use Token IDs?

Token IDs are just arbitrary numbers (like an index). They carry NO meaning.

Token ID 10 for "King" and Token ID 11 for "Queen" — the number 10 and 11 tell you nothing about the relationship between King and Queen.

We need numbers that **capture meaning and relationships between words**. That's what vector embeddings do.

### What is a Vector Embedding?

A vector embedding is a **list of numbers (a vector)** that represents a word in a multi-dimensional space, such that words with similar meanings end up **near each other in that space**.

### The Magic of Embeddings — Words Near Each Other = Similar Meaning

Visualize a 2D (or 3D) graph. Plot words as points on this graph:

```
       cat ●
       dog ●

milk ●
pedigree ●
```

- Cat and Dog are close to each other (both animals)
- Milk and Pedigree are close to each other (both are consumed by animals)
- Cat is near Milk (cat loves milk)
- Dog is near Pedigree (dog eats Pedigree)

If you take the **direction vector** from Cat → Dog, that same direction from Milk should point toward Pedigree. Because:
```
Dog - Cat ≈ Pedigree - Milk
(both represent: what the animal eats/consumes)
```

Similarly:
```
Man - Animal ≈ Human - Animal
Dog → Animal direction ≈ Man → Human direction
```

This is the **semantic meaning** captured in the vector space.

### How Are Embeddings Made?

A neural network is trained on massive text data to understand word relationships. After training, for every word it has learned a vector that captures its meaning. We don't know what each individual number in the vector means — but together they encode the word's meaning.

### Embedding Dimensions

- OpenAI's small embedding model: **1536 dimensions** per token
- OpenAI's large model: **3072 dimensions** per token
- More dimensions = richer, more diverse meanings captured

A dimension like 512 means each word is represented as a list of 512 numbers.

### What Happens If You Reduce Dimensions?

If you reduce dimensions (say from 512 to 10), the words lose their **semantic relationships** — they can no longer tell that cat and dog are similar, or that milk and pedigree are related.

### Code (Using OpenAI)

```python
from openai import OpenAI
client = OpenAI()

response = client.embeddings.create(
    input=["cat loves milk"],
    model="text-embedding-3-small"
)

embeddings = response.data[0].embedding
print(len(embeddings))  # → 1536
```

You get back 1536 numbers that together represent the meaning of "cat loves milk".

---

## 7. Step 3 — Positional Encoding

### The Problem

When the Transformer processes tokens, it processes **all of them at the same time (in parallel)** — not one by one like older models (RNN).

This is great for speed, BUT it creates a problem: **the model doesn't know the order of words**.

### Why Order Matters

Consider these two sentences — they have the exact same words but completely different meanings:

```
Sentence 1: "The dog chased the cat"
Sentence 2: "The cat chased the dog"
```

If you tokenize both, you get identical tokens (just in different order). Without position information, their vector embeddings would be identical — which means the model thinks they mean the same thing. **That's wrong.**

### The Solution: Positional Encoding

We add a **position vector** on top of each word's embedding:

```
final_embedding = word_embedding + positional_encoding_vector
```

The positional encoding vector for position 1 is different from position 2, position 3, etc.

**Result:** Even if two sentences have the same words, their positional encodings will be different, so the model knows the order and can understand the different meanings.

### How Are Positional Encodings Calculated?

Using **sine and cosine formulas** from the original Transformer paper (from Google, 2017). The math gives each position a unique vector that the model can use to understand word order.

```
PE(pos, 2i)   = sin(pos / 10000^(2i/d_model))
PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))
```

You don't need to memorize the formula — just remember: **positional encoding adds position information to each token's embedding so the model knows word order.**

---

## 8. Step 4 — Self-Attention

### The Problem with Old Models (RNN)

Before Transformers (before 2017), models used RNNs (Recurrent Neural Networks). RNNs had two big problems:

**Problem 1: Sequential Processing (Slow)**
RNNs processed tokens one by one. For a sentence with 100 words, it had to wait for word 1 to finish before processing word 2, etc. Very slow.

**Problem 2: Context Loss**
RNNs struggled to remember relationships between words that were far apart in a sentence.

**Classic Example:**
```
Sentence A: "The river bank"
Sentence B: "The ICICI bank"
```

The word "bank" appears in both sentences but means completely different things:
- In Sentence A: "bank" = side of a river
- In Sentence B: "bank" = financial institution

An RNN would give both instances of "bank" the same vector embedding — it lost the context!

### Self-Attention: The Fix

**Self-attention allows tokens to "talk to each other" and update their embeddings based on surrounding context.**

In the "river bank" example:
1. The word "bank" starts with its base embedding (financial bank meaning)
2. The word "river" notices "bank" is nearby and talks to it
3. "bank" changes its embedding slightly to indicate "I am near a river, so I mean river bank"

The final embedding of "bank" in Sentence A is **different** from the final embedding of "bank" in Sentence B — even though they're the same word. **Context is preserved!**

### How Does Self-Attention Work Mathematically?

Take all token embeddings in a sentence → multiply the matrix by its transpose → divide by square root of the model dimension → this tells you **how much each token should influence every other token**.

The result: a score matrix showing "how related is every word to every other word in this sentence?"

**Example attention scores for "The river bank":**
```
         The    river    bank
The    [ 0.2,   0.1,    0.1 ]
river  [ 0.1,   0.5,    0.7 ]   ← river strongly attends to bank
bank   [ 0.1,   0.7,    0.5 ]   ← bank strongly attends to river
```

High attention score between "river" and "bank" → they influence each other's embeddings → context is captured.

### The Core Idea

> Self-attention allows vector embeddings to talk to each other and change based on surrounding words, so that the **context of every word is preserved**.

This is the most important step in the entire Transformer. Without it, LLMs would give wrong answers constantly.

---

## 9. Step 5 — Multi-Head Attention

### What's the Problem with Single-Head Attention?

One attention pass can only capture **one type of relationship** at a time.

But a sentence has many different types of relationships happening simultaneously:
- Grammatical relationships (subject-verb-object)
- Semantic relationships (what things are related to what)
- Positional relationships (this word comes before that word)
- Contextual relationships (this word in this context means X)

One head can't look at all of these at once.

### Multi-Head Attention = Multiple Attention Passes in Parallel

Instead of one attention pass, you do **multiple attention passes simultaneously**, each one looking for different types of relationships.

**Real-world analogy (from Piyush's video):**

Imagine you see a dog sleeping in a train, and later you describe it. Different parts of your brain captured different things at the same time:
- Part 1 noticed: "Dog was in the train" (location)
- Part 2 noticed: "Dog was sleeping" (action/state)
- Part 3 noticed: "Dog was brown" (attribute/color)

All three were noticed simultaneously, then combined to give you the full understanding.

That's exactly multi-head attention:
- **Head 1** might focus on: grammatical structure
- **Head 2** might focus on: semantic relationships
- **Head 3** might focus on: positional context
- **Head N** might focus on: some other relationship type

Each head produces its own set of updated embeddings. Then all heads' outputs are **combined (concatenated + blended)** to give the final, richly contextual embedding.

### Why is This Important?

In LLMs, **context is everything**. You've heard of "context window" — that's literally how much context the model can consider at once. Multi-head attention is what allows the model to deeply understand that context from multiple angles simultaneously.

> 💡 **Summary:** Multi-head attention = multiple self-attention operations in parallel → each looking for different relationships → combined to improve overall contextual understanding.

---

## 10. Step 6 — Feed Forward + Normalization Loop

### After Attention — Feed Forward Layer

After multi-head attention, the enriched embeddings go through a **Feed Forward Neural Network** layer.

**Why?**
- Self-attention captures *linear* relationships between words.
- But language has **non-linear** complexity — idioms, nuance, tone, complex patterns.
- The Feed Forward Network introduces **non-linearity** to capture these complex patterns.
- Each token's embedding passes through this network **independently**.

### Normalization Layer

After each major step (attention and feed forward), a **normalization layer** is applied. This keeps all the numbers in a stable range (zero mean, unit variance) so training doesn't go haywire.

### The Whole Thing is Repeated (NX Layers)

Here's the key: this entire block (Attention → Normalization → Feed Forward → Normalization) is **repeated multiple times**:

```
Input
  ↓
[Block 1: Attention + FFN + Normalization]
  ↓
[Block 2: Attention + FFN + Normalization]
  ↓
[Block 3: Attention + FFN + Normalization]
  ↓
... (N times)
  ↓
Final refined embeddings
```

Each time through the loop, the token embeddings get **more and more refined**. They keep becoming richer representations of meaning.

**How many layers?**
- Depends on the model
- More layers = deeper understanding = bigger model = more compute needed

After all these layers, you finally have **fully contextual, richly refined embeddings** for each token.

---

## 11. Step 7 — Output Generation (Linear + Softmax)

Now comes the question: how do you actually predict the **next word**?

### Step 1 — Linear Layer (Probability Distribution)

After all the encoding layers, the output goes through a **Linear layer**.

What does Linear do? It produces a **probability score for every single token in the vocabulary**.

For example, if we're predicting the next word after "I am":

```
Token "F" → probability 0.90
Token "G" → probability 0.05
Token "N" → probability 0.03
Token "X" → probability 0.02
...
```

This is saying: "Given what came before, here's how likely each possible next token is."

### Step 2 — Softmax (Pick the Winner)

**Softmax** is a function that decides which token to actually pick from these probabilities.

- If Softmax value is **1 (low temperature)** → it always picks the highest probability token (most predictable, safe, repetitive)
- If Softmax value is **high (high temperature)** → it sometimes picks lower-probability tokens (more creative, varied, sometimes surprising)

---

## 12. Training Phase vs Inference Phase

Every LLM has two completely different modes of operation.

### 🏋️ Training Phase (Learning)

This is when the model is being **trained** on data — like a student studying for exams.

**How it works:**
1. Take a real sentence from training data: "How are you?"
2. The expected output is already known: "I am fine."
3. Feed the input through the entire Transformer
4. Get the model's predicted output (might be wrong initially)
5. Compare predicted output vs expected output → calculate the **loss** (error)
6. Use **Backpropagation** to send the error backwards through the network
7. Update the model's **weights** so next time it makes a better prediction

This is repeated millions of times on millions of sentences until the model learns to predict well.

**Analogy:** Like telling a child "2 + 2 = 5" and they say "wrong, it's 4" and you correct them. They remember "when asked 2+2, answer 4." That's learning.

### 🚀 Inference Phase (Using the Model)

This is when the model is **deployed and you're using it** — like the student taking the actual exam.

**How it works:**
- Same forward pass through the Transformer
- **BUT: No backpropagation** — we don't want to change the model's weights anymore
- The model uses what it learned during training to predict the next token
- Keeps repeating until [END OF STRING] is predicted

**Training Phase:** Forward pass + Loss Calculation + **Backpropagation** (weights change)
**Inference Phase:** Forward pass only (weights stay fixed, no learning happening)

---

## 13. Temperature — Controlling Creativity

You've seen "Temperature" as a setting in Google AI Studio, OpenAI Playground, etc. Now you know what it is.

**Temperature = the Softmax value that controls which token gets picked**

| Temperature | Behavior | Best For |
|---|---|---|
| **Low (near 0)** | Always picks highest probability token | Factual answers, code, precise tasks |
| **Medium (~0.7)** | Balanced between predictable and creative | General conversation |
| **High (near 2)** | Often picks lower-probability tokens | Creative writing, brainstorming |

**Why does high temperature = more creative?**

With high temperature, when the Linear layer says:
```
"F" → 0.90 probability
"G" → 0.05 probability
```

Instead of always picking "F", a high temperature might sometimes pick "G" — leading to more unexpected, creative outputs. Low temperature would always pick "F" — safe and predictable.

> 💡 Try this in Google AI Studio (free): Change the temperature slider and send the same "Hi" message multiple times. Lower temperature = same boring reply every time. Higher temperature = different, more creative replies.

---

## 14. Code Walkthrough — LLM in Action

Here's how to run a real LLM using HuggingFace Transformers library:

### Step 1 — Install and Import

```python
pip install transformers

from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
```

### Step 2 — Create Tokenizer

```python
model_name = "google/gemma-2b"
tokenizer = AutoTokenizer.from_pretrained(model_name)
```

### Step 3 — Tokenize Input

```python
input_text = "Write a Python code for adding two numbers"
input_tokens = tokenizer(input_text, return_tensors="pt")
print(input_tokens)  # shows input_ids (token numbers)
```

### Step 4 — Load the Model

```python
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.bfloat16
)
# This downloads ~2GB model
```

### Step 5 — Get Raw Predictions (All Probabilities)

```python
with torch.no_grad():
    out = model(input_ids=input_tokens['input_ids'])
# out contains raw logits (probabilities for every possible next token)
```

### Step 6 — Generate Actual Text (Best Token Each Time)

```python
gen_out = model.generate(
    input_ids=input_tokens['input_ids'],
    max_new_tokens=100  # how many tokens to generate
)
```

### Step 7 — Detokenize (Convert Tokens Back to Text)

```python
result = tokenizer.batch_decode(gen_out)
print(result)
# → "Write a Python code for adding two numbers\n\ndef add(x, y):\n    return x + y\n\nprint(add(1, 2))"
```

**What just happened in those 7 steps?**
1. Created a tokenizer (knows how this model converts text ↔ numbers)
2. Tokenized our prompt into token IDs
3. Loaded the pre-trained model weights (2GB of learned knowledge)
4. Fed tokens through the Transformer (all the attention, embeddings, etc.)
5. Got probability distributions for next tokens
6. Used `generate()` to run the prediction loop (picks best token → appends → repeats)
7. Converted the output token IDs back to readable text

**Why was output incomplete at first?** Because `max_new_tokens` was too small. When we increased it to 100, we got the full Python function.

---

## 15. Complete Summary — LLM in One Flow

Here is the entire LLM process from your input to the final output:

```
YOU TYPE: "How are you?"
              ↓
[1. TOKENIZATION]
Split text into tokens → map each to a number
"How" → 1234, "are" → 5678, "you" → 9012, "?" → 456
              ↓
[2. VECTOR EMBEDDINGS]
Each token ID → rich multi-dimensional vector (e.g., 1536 numbers)
Captures semantic meaning: similar words are nearby in vector space
              ↓
[3. POSITIONAL ENCODING]
Add position information to each embedding
"How" at position 1 gets a different marker than "you" at position 3
Ensures word order is preserved even in parallel processing
              ↓
[4. SELF-ATTENTION]
Every token's embedding is allowed to "talk to" every other token
Each word adjusts its embedding based on surrounding context
"bank" near "river" shifts its meaning away from "financial bank"
              ↓
[5. MULTI-HEAD ATTENTION]
Multiple self-attention passes happening in parallel
Each head focuses on different relationship types (grammar, semantics, etc.)
All heads' results combined → richer contextual understanding
              ↓
[6. FEED FORWARD + NORMALIZATION (Repeated N times)]
Non-linear transformations to capture complex patterns
Normalization for training stability
Each loop makes embeddings more refined
              ↓
[7. LINEAR LAYER]
Final embeddings → probability score for every token in vocabulary
"I" → 0.85, "We" → 0.07, "They" → 0.03, ... (30,000+ probabilities)
              ↓
[8. SOFTMAX]
Based on temperature, pick the next token
Low temp → always pick highest probability ("I")
High temp → sometimes pick less likely token (more creative)
Picks: "I"
              ↓
[LOOP BACK]
"How are you? I" → repeat entire process → "am"
"How are you? I am" → repeat → "fine"
"How are you? I am fine" → repeat → [END]
              ↓
FINAL OUTPUT: "I am fine"
```

---

## Key Terms — Quick Reference

| Term | Simple Meaning |
|---|---|
| **LLM** | Large Language Model — a Transformer trained on massive data to predict text |
| **GPT** | Generative Pre-trained Transformer — the architecture ChatGPT is based on |
| **Token** | A piece of text (roughly a word or part of a word), converted to a number |
| **Vocabulary** | Complete dictionary mapping all tokens to numbers (model-specific) |
| **Tokenization** | Converting text into token IDs using the model's vocabulary |
| **Vector Embedding** | A list of numbers representing a token's meaning in multi-dimensional space |
| **Semantic Meaning** | The actual meaning/relationship between words, captured in embeddings |
| **Positional Encoding** | Adding position information to embeddings so word order is not lost |
| **Self-Attention** | Allows tokens to influence each other's embeddings based on context |
| **Context Loss** | Problem in old RNN models where the meaning of a word in context was lost |
| **Multi-Head Attention** | Multiple self-attention passes in parallel, each looking at different relationships |
| **Feed Forward Network** | Applies non-linear transformations to further refine token embeddings |
| **Normalization** | Keeps embedding values in a stable range during training |
| **Linear Layer** | Converts final embeddings into probability scores for every possible next token |
| **Softmax** | Picks which token to generate based on probabilities and temperature |
| **Temperature** | Controls creativity — low = safe/predictable, high = creative/varied |
| **Training Phase** | When the model is learning — includes backpropagation and weight updates |
| **Inference Phase** | When you're using the model — no backpropagation, weights are frozen |
| **Backpropagation** | Algorithm that sends errors backward through the network to update weights |
| **Loss** | The error between what the model predicted and what the correct answer was |
| **Context Window** | Maximum number of tokens the model can consider at once |
| **HuggingFace Transformers** | Python library that makes it easy to load and use pre-trained models |
| **max_new_tokens** | Parameter controlling how many tokens the model generates before stopping |
| **Pre-training** | Training the model on massive data (internet, books) before release |

---

## As an Application Developer — What You Need to Know

Piyush makes an important point at the end:

> "As an application developer, you don't need to go into all these depths. A high-level understanding is enough. Unless you want to become an AI Research Engineer — in which case you'll need to go deep into all the math and matrix multiplications."

**The analogy he gives:** You know how Node.js works conceptually (event loop, non-blocking I/O), but you don't actually read Node.js's source code. That's fine — you can still build great apps with it.

Similarly with LLMs — understanding the flow (tokenize → embed → attend → generate) is enough to build powerful AI applications. The deep math is only for researchers.

---

*Notes compiled from Piyush Garg's Hindi video on "How LLMs Work" — GPT full form breakdown, tokenization with live code, vector embeddings, positional encoding, self-attention vs RNN context loss, multi-head attention, linear + softmax, training vs inference phase, temperature control, and HuggingFace code walkthrough — all in one clear English flow.*
