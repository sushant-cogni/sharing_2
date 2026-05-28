# 🤖 Transformers — Complete Notes (Easy, One Flow)
> Explained from zero — word embeddings → attention → full architecture. Read this once and you'll truly understand Transformers.

---

## 📌 Table of Contents
1. [What is a Language Model?](#1-what-is-a-language-model)
2. [How Machines Read Words — Word Embeddings](#2-how-machines-read-words--word-embeddings)
3. [The Problem with Static Embeddings](#3-the-problem-with-static-embeddings)
4. [What We Actually Need — Contextual Embeddings](#4-what-we-actually-need--contextual-embeddings)
5. [Transformer Architecture — The Big Picture](#5-transformer-architecture--the-big-picture)
6. [BERT vs GPT — Which Uses What?](#6-bert-vs-gpt--which-uses-what)
7. [Step-by-Step Inside the Encoder](#7-step-by-step-inside-the-encoder)
8. [The Attention Mechanism — Made Simple](#8-the-attention-mechanism--made-simple)
9. [Query, Key, Value — The Core Idea](#9-query-key-value--the-core-idea)
10. [How Q, K, V Vectors Are Actually Built](#10-how-q-k-v-vectors-are-actually-built)
11. [The Attention Formula](#11-the-attention-formula)
12. [Multi-Head Attention — Why Multiple Heads?](#12-multi-head-attention--why-multiple-heads)
13. [Feed Forward Network — Why After Attention?](#13-feed-forward-network--why-after-attention)
14. [Putting It All Together — Full Encoder Flow](#14-putting-it-all-together--full-encoder-flow)
15. [The Decoder](#15-the-decoder)
16. [Cross Attention — What Makes Decoder Special](#16-cross-attention--what-makes-decoder-special)
17. [How the Model Gets Trained](#17-how-the-model-gets-trained)
18. [Quick Reference — All Key Terms](#18-quick-reference--all-key-terms)

---

## 1. What is a Language Model?

When you type in Gmail and it suggests the next word — that's a **language model**.

The **fundamental goal of any language model is:**
> Predict the next word in a sentence.

That's it. Sounds simple. But this one task, when done at scale, powers everything — ChatGPT, Google Translate, Gmail autocomplete, etc.

**How ChatGPT works at a high level:**
1. You type a question.
2. It predicts the next most likely word.
3. Takes your question + that word → predicts the next word again.
4. Repeats this until the full answer is formed.

It's doing next-word prediction repeatedly — and the result looks like magic.

**Examples of language models:**
- **BERT** (by Google) → powers hundreds of Google AI applications.
- **GPT** (by OpenAI) → powers ChatGPT. It's called a *Large* Language Model because it has billions of parameters and is trained on massive amounts of data.

Both are based on the same architecture — **Transformers**.

---

## 2. How Machines Read Words — Word Embeddings

Machines don't understand text. They only understand numbers.

So the first challenge is: **how do we convert words into numbers?**

### The Naive Approach (Bad)

You could just assign each word a number from a dictionary:
- King = 1, Queen = 2, Battle = 3...

But this is useless because the **numbers don't capture any meaning**. The model can't tell that King and Queen are related, or that King and Battle are very different things.

### The Smart Approach — Word Embeddings

Instead of one number, we represent each word as a **list of numbers (a vector)**.

Each number in the vector answers a question about that word. For example, imagine asking:

| Question | King | Queen | Horse | Battle |
|---|---|---|---|---|
| Has authority? | 1 | 1 | 0.1 | 0 |
| Has a tail? | 0 | 0 | 1 | 0 |
| Is rich? | 1 | 1 | 0 | 0 |
| Gender (M=-1, F=+1) | -1 | +1 | 0 | 0 |
| Is an event? | 0 | 0 | 0 | 1 |

So **King = [1, 0, 1, -1, 0]** as a vector.

> ⚠️ Important: In real life, we don't manually create these questions. A neural network is trained on huge text data (Wikipedia, books, internet) and it automatically learns what "questions" to ask. We don't know what each number means — we just know together they capture the word's meaning.

### The Magic of Word Vectors — You Can Do Math!

Once words are represented as vectors, you can **do math with words**:

```
King - Man + Woman = Queen
```

This actually works! Because Man and King are similar except for gender. Subtract the "maleness" and add "femaleness" → you get Queen.

More examples:
```
Russia - Moscow + Delhi = India   (country - capital + another capital = another country)
Uncle + gender_direction = Aunt
Father + gender_direction = Mother
```

This is called **word arithmetic** and it's only possible because of meaningful vector representations.

### Real Numbers

- **Google's Word2Vec** model uses **300 dimensions** per word.
- **GPT** uses **12,228 dimensions** per word!
- We can't visualize 300D space, but mathematically it works perfectly.

These static embeddings — where every word has one fixed vector — are created by models like **Word2Vec** and **GloVe**.

---

## 3. The Problem with Static Embeddings

Static embeddings have one big flaw: **one word, one fixed meaning, always**.

But in real language, words change meaning based on context.

**Example 1 — "track"**
- "The train will run on the **track**." → track = railway track
- "My package is late, help me **track** it." → track = monitor/follow

Both sentences use the word "track" but it means completely different things. A static embedding gives both the same vector — wrong!

**Example 2 — "dish"**
- "I made a cheese **dish**." → dish = food plate
- "I made a rice **dish**." → dish = different type of food

The meaning of "dish" subtly changes based on the adjective before it. With static embeddings, you'd predict the same next words for both — but in reality, after "cheese dish" you'd predict "pasta, pizza" and after "rice dish" you'd predict "biryani, idli".

### The Real-World Consequence

When predicting next words:
- "I made an Indian rice dish" → next word likely: *idli, biryani*
- "I made a sweet Indian rice dish" → next word likely: *kheer, pongal* (not biryani anymore!)

Every adjective changes the probability of what comes next. Static embeddings can't capture this because the word "dish" always has the same fixed vector no matter what surrounds it.

**Conclusion: Static embeddings are not enough. We need contextual embeddings.**

---

## 4. What We Actually Need — Contextual Embeddings

A **contextual embedding** is a vector for a word that **changes based on the sentence it's in**.

Think of it this way: the word "dish" starts with its static embedding. Then all the surrounding words (sweet, Indian, rice) influence and modify that embedding. The final vector for "dish" in this sentence is different from "dish" in a completely different sentence.

**Mathematically**, it's like:

```
contextual_embedding(dish) = static_embedding(dish)
                             + influence of "sweet"  (sweetness vector)
                             + influence of "Indian" (indianness vector)
                             + influence of "rice"   (riceness vector)
```

You're taking the base vector and **adding directional influences** from surrounding words.

**Another example to build intuition:**

*"D loves dosa, idli, and millet bread. B loves pasta and pizza. They went out for dinner. B said 'bro, we'll go to a restaurant you like.' They ended up in an _____ restaurant."*

How did you predict **Indian**?

- Because D loves dosa, idli, millet → all Indian food items.
- Because B said "you like" (referring to D's preferences).

Notice something: the word "Indian" is influenced by words that are **very far back** in the paragraph — not just the words immediately before it. Static or simple models can't do this. You need a mechanism that lets every word **attend to every other word** in the sentence.

That mechanism is called **Attention** — and it's the heart of Transformers.

---

## 5. Transformer Architecture — The Big Picture

The Transformer has two main components:

```
Input Sentence
      ↓
  [ENCODER]
      ↓
Contextual Embeddings
      ↓
  [DECODER]
      ↓
   Output Word
```

**Encoder's job:**
- Take the input sentence.
- Generate a contextual embedding for every word.
- "Understand" the full meaning of the sentence.

**Decoder's job:**
- Take the contextual embeddings from encoder.
- Produce the output word by word.

**Example 1 — Next Word Prediction:**
- Input: "I made a sweet Indian rice dish"
- Encoder produces contextual embeddings.
- Decoder predicts: "kheer"

**Example 2 — Language Translation (English → Hindi):**
- Input: "I made kheer"
- Encoder processes English sentence.
- Decoder starts with a special `[START]` token and produces Hindi words one by one: *"Maine"* → *"kheer"* → *"banai"*

---

## 6. BERT vs GPT — Which Uses What?

Both BERT and GPT are based on the Transformer architecture, but they use different parts of it.

| Feature | BERT | GPT |
|---|---|---|
| Architecture | Encoder only | Decoder only |
| Purpose | Understanding text (classification, QA, etc.) | Generating text (next word prediction) |
| Vocabulary size | ~30,522 tokens | ~50,000 tokens |
| Embedding size | 768 (base), 1024 (large) | 12,228 |
| Layers | 12 (base), 24 (large) | Many more |
| Attention heads | 12 (base) | 96 |
| Training | Masked language modeling (fill in blanks) | Causal language modeling (predict next word) |

> 💡 BERT = I understand text deeply. GPT = I generate text.

---

## 7. Step-by-Step Inside the Encoder

Let's trace exactly what happens when a sentence enters the encoder.

**Input sentence:** *"I made a sweet Indian rice dish"*

---

### Step 1 — Tokenization

First, the sentence is split into **tokens**. Tokens are roughly like words, but not exactly. A word like "called" might become two tokens: `call` + `ed`.

Special tokens are also added:
- `[CLS]` → added at the beginning (classification token)
- `[SEP]` → added between sentences or at the end (separator)

So the tokenized input looks like:
```
[CLS] I made a sweet Indian rice dish [SEP]
```

Each token is then converted to a **token ID** (its index in the vocabulary).

Example:
- "made" → token ID 2532 (means it's at position 2532 in BERT's 30,522-word vocabulary)

---

### Step 2 — Static Embedding Lookup

For each token ID, look up its **static embedding vector** from the **embedding matrix** (which was learned during training).

```
Token "dish" → embedding vector of size 768 (for BERT) or 12,228 (for GPT)
```

This is just a long list of numbers that represents the base meaning of that word.

---

### Step 3 — Add Positional Encoding

**Problem:** Transformers process all words **simultaneously** (in parallel), unlike older models (RNNs) which processed words one by one. Since all words are processed at the same time, the model has no idea which word came first, second, third, etc. But word order matters!

*"Dog bites man"* ≠ *"Man bites dog"*

**Solution: Positional Encoding** — add a small vector to each word's embedding that encodes its position in the sentence.

```
final_embedding = static_embedding + positional_encoding
```

The positional encoding for position 1 is different from position 2, position 3, etc. This way, even though all words are processed together, the model knows where each word sits in the sentence.

The formula for positional encoding uses sine and cosine functions (from the original Transformer paper) — the math isn't critical to understand, just know that **each position gets a unique vector**.

---

## 8. The Attention Mechanism — Made Simple

Now comes the most important part. The encoder needs to figure out: **for every word, which other words should influence its meaning?**

This is called **self-attention** — every word "pays attention" to every other word in the same sentence.

**Think of it like this:**

For the word **"dish"** in "I made a sweet Indian rice dish":
- "sweet" attends to "dish" by 36% → sweetness should modify the meaning of dish a lot
- "Indian" attends to "dish" by 14% → indianness also matters
- "rice" attends to "dish" by 18% → rice-ness matters
- "I" attends to "dish" by only 2% → the subject barely changes the meaning of "dish"
- "made" attends to "dish" by 4% → the action barely changes what kind of dish it is

*(These percentages are made up for illustration — the real numbers are computed mathematically.)*

**The insight:** "I" and "made" barely change what kind of dish it is. But "sweet", "Indian", "rice" massively change it. So their influence on the word "dish" should be stronger.

Once you know how much each word should influence "dish", you **combine their meanings** proportionally to get the contextual embedding for "dish".

---

## 9. Query, Key, Value — The Core Idea

This is where people get confused. Let's use a clear analogy first.

### 📚 Library Analogy

Imagine you go to a library looking for a book on **Quantum Computing**.

- **Query** = What you're looking for: *"I need a book on Quantum Computing"*
- **Key** = The labels/indexes on the bookshelves: *"Physics", "Computer Science", "History"*
- **Value** = The actual content inside the books

You compare your **query** to each **key**. The "Computer Science" shelf key matches your query well → you go there. The "History" shelf doesn't match → you don't go there. You pull the book (the **value**) from the shelf that matched best.

### 🎓 Professor and Students Analogy

A professor wants to write an essay on **Quantum Computing** and asks students for help.

| Student | What they know (Key) | What they write (Value) |
|---|---|---|
| Meera | "I know quantum mechanics" | Writes about quantum states... |
| Kathy | "I know computer science" | Writes about algorithms... |
| Bob | "I know philosophy" | Writes about ethics... |
| Moan | "I know linear algebra" | Writes about matrices... |

The professor (who has the **query**: "help me with Quantum Computing") reads each student's claim (**key**) and decides:
- Meera's claim matches query well → use **60%** of Meera's essay (value)
- Kathy's claim matches somewhat → use **29%** of Kathy's essay
- Bob's claim barely matches → use only **1%** of Bob's essay

**Final essay = 60% Meera's content + 29% Kathy's content + 1% Bob's + others**

This is exactly how attention works in Transformers.

---

### Applying This to Our Sentence

For the word **"dish"** (which is generating its contextual embedding):

- **Query** = "dish" asking: *"What are my modifiers? What changes my meaning?"*
- **Key** = each other word describing itself:
  - "I" says: *"I am the subject of the sentence"*
  - "made" says: *"I am a verb, an action"*
  - "sweet" says: *"I am an adjective describing taste"*
  - "Indian" says: *"I am an adjective describing origin"*
  - "rice" says: *"I am a noun describing type"*
- **Value** = what each word contributes to the meaning of "dish":
  - "sweet" contributes: *"the taste is sweet"*
  - "Indian" contributes: *"the origin/style is Indian"*
  - "rice" contributes: *"the base ingredient is rice"*

The **attention score** = how much query (dish) matches each key (other words).
High match → take more of that word's value.
Low match → take less.

**Contextual embedding of "dish"** = its static embedding + weighted sum of all values from other words.

---

## 10. How Q, K, V Vectors Are Actually Built

Here's the concrete math. Don't be scared — it's just matrix multiplication.

### The Special Matrices — WQ, WK, WV

During training, the model learns three special matrices:
- **WQ** → knows how to encode the "query" of any token
- **WK** → knows how to encode the "key" of any token
- **WV** → knows how to encode the "value" of any token

These matrices are learned during training (via backpropagation on millions of sentences). After training, they're fixed.

For **BERT**:
- Embedding size = 768
- WQ, WK, WV each have shape: 64 × 768

### Computing Q (Query Vector)

For word "dish" with static embedding E7 (a vector of size 768):

```
Q7 = WQ × E7
```

You're multiplying a 64×768 matrix with a 768-length vector → you get a **64-dimensional query vector**.

### Computing K (Key Vector)

For every other word in the sentence:

```
K1 = WK × E1   (key for word "I")
K2 = WK × E2   (key for word "made")
K3 = WK × E3   (key for word "a")
...and so on
```

### Computing V (Value Vector)

Similarly:

```
V1 = WV × E1   (value for word "I")
V2 = WV × E2   (value for word "made")
...and so on
```

All of these happen for every word, and all in **parallel** (which is what makes Transformers so fast).

---

## 11. The Attention Formula

Here's the complete formula:

```
Attention(Q, K, V) = softmax( Q × K^T / √dk ) × V
```

Let's break it down:

| Part | What It Does |
|---|---|
| `Q × K^T` | Computes dot product between query and all keys → gives raw attention score for each word |
| `/ √dk` | Scales down the values for numerical stability (dk = dimension of key vector, e.g., 64 for BERT, 128 for GPT) |
| `softmax(...)` | Converts raw scores to probabilities that sum to 1 (so you get percentages like 36%, 14%, etc.) |
| `× V` | Multiply each value vector by its attention probability → weighted sum |

**Result:** One contextual embedding for the word "dish" that now contains the influence of "sweet", "Indian", "rice", etc.

**Simple version in words:**
1. For "dish", compute a dot product with every other word (Q·K).
2. Scale and apply softmax → get attention percentages.
3. Multiply each word's value vector by its percentage.
4. Add all of them up → final contextual embedding for "dish".

---

## 12. Multi-Head Attention — Why Multiple Heads?

What we just described was **one attention head**. In reality, Transformers use **multiple attention heads in parallel**.

**Why?**

Because language has many different types of relationships between words — and one attention head can only capture one type at a time.

**Example — for the sentence "I made a sweet Indian rice dish":**

| Head | What it focuses on |
|---|---|
| Head 1 | Adjectives → finds "sweet", "Indian", "rice" modifying "dish" |
| Head 2 | Verbs → finds "made" describing the action |
| Head 3 | Pronouns → finds "I" as the subject |
| Head 4 | Order/syntax → focuses on grammatical structure |
| Head 5 | Semantic similarity → groups related concepts |

Each head has its **own WQ, WK, WV matrices** and produces its own contextual embedding.

**After all heads finish:**
- Concatenate all heads' outputs (join them side by side).
- Multiply by a final matrix Wo to blend them together.
- Result = final, rich contextual embedding that captures multiple relationship types simultaneously.

**Numbers:**
- GPT has **96 attention heads**.
- BERT base has **12 attention heads**.
- Each head works on a portion of the embedding dimension: e.g., GPT's 12,228 / 96 = 128 dimensions per head.

**Analogy:** Multi-head attention is like having 96 experts reading the same sentence simultaneously, each looking for different things (grammar, meaning, tone, context, etc.) and then combining their insights.

---

## 13. Feed Forward Network — Why After Attention?

After multi-head attention, you'd think we're done. But there's one more layer: a **Feed Forward Neural Network (FFN)**.

Why? Here's the clear reason:

**Attention captures relationships** — it figures out which words should influence which other words (linear relationships). But **language is non-linear**. There are complex patterns, idioms, nuances that can't be captured by simple weighted sums.

The FFN adds **non-linearity** to each word's embedding independently. It's like a "finishing touch" that refines the contextual embedding further.

**Structure:**
```
Input (e.g., 768 dimensions)
     ↓
Hidden Layer (larger, e.g., 3072 neurons) with ReLU activation
     ↓
Output (same as input, e.g., 768 dimensions)
```

Note: Every word goes through the **same** FFN independently (not all together). The FFN processes each word's embedding separately.

The FFN's weights are also learned during training via backpropagation.

---

## 14. Putting It All Together — Full Encoder Flow

Now let's trace the complete journey of one word through the encoder. Let's use "dish" as our example.

```
"I made a sweet Indian rice dish"
         ↓
[Step 1] Tokenize the sentence
         ↓
[Step 2] Get Token ID for each word
         → "dish" = token ID 4982 (example)
         ↓
[Step 3] Look up Static Embedding
         → "dish" = 768-dimensional vector [0.23, -1.4, 0.87, ...]
         ↓
[Step 4] Add Positional Encoding
         → "dish" is at position 7 → add position-7 vector
         → result = [0.41, -1.1, 0.95, ...] (slightly modified)
         ↓
[Step 5] Layer Normalization
         → Normalize values to stable range (zero mean, unit variance)
         ↓
[Step 6] Multi-Head Attention (e.g., 12 heads)
         → Each head computes Q, K, V using WQ, WK, WV
         → Each head produces its own contextual embedding
         → All heads' outputs are concatenated and blended
         → "dish" now has contributions from "sweet", "Indian", "rice"
         ↓
[Step 7] Residual Connection (Add)
         → Add the output of attention to the original positional embedding
         → This helps gradient flow during training
         ↓
[Step 8] Layer Normalization again
         ↓
[Step 9] Feed Forward Network
         → Applies non-linear transformation to "dish" embedding
         → Captures complex patterns
         ↓
[Step 10] Residual Connection (Add again)
         → Add FFN output to the input of FFN
         ↓
[Step 11] Layer Normalization
         ↓
[REPEAT Steps 5-11 for N more blocks]
         → BERT base: 12 blocks total
         → BERT large: 24 blocks total
         → Each block further refines the embedding
         ↓
[FINAL OUTPUT]
"dish" now has a fully contextual, richly informed embedding
— it "knows" it's a sweet, Indian rice dish
```

**What are residual connections?**
After each major operation (attention or FFN), you **add the original input back** to the output:
```
output = LayerNorm(x + Attention(x))
output = LayerNorm(x + FFN(x))
```
This ensures that even if the attention/FFN output is noisy or unhelpful, the original information is not lost. It also helps gradients flow smoothly during training (prevents vanishing gradient problem).

**What is Layer Normalization?**
After each residual connection, normalize the values to have zero mean and unit variance. This stabilizes training and prevents values from becoming too large or too small as they flow through many layers.

---

## 15. The Decoder

The decoder's job is to **generate output word by word** using the contextual embeddings produced by the encoder.

**For next-word prediction:**
- Encoder processes: "I made a sweet Indian rice dish"
- Decoder predicts: "kheer" (next word)

**For language translation (English → Hindi):**
- Encoder processes: "I made kheer" (English)
- Decoder produces: "Maine" → "kheer" → "banai" → [END] (Hindi, word by word)

**How the decoder generates word by word:**
1. Starts with a special `[START]` token.
2. Produces probabilities over the entire vocabulary (~30,000 words for BERT, ~50,000 for GPT).
3. Picks the word with highest probability → "Maine".
4. Takes `[START] + "Maine"` as new input → produces next word "kheer".
5. Takes `[START] + "Maine" + "kheer"` as input → produces "banai".
6. Continues until `[END]` token is produced.

---

## 16. Cross Attention — What Makes Decoder Special

Inside the decoder, there are two types of attention:

### Self-Attention (Masked)
The decoder words attend to **each other** — but with a twist. It's **masked** so that when predicting word 3, the decoder can only see words 1 and 2 (not word 4 onwards). This makes sense because during generation, you don't know future words yet.

### Cross Attention ← This is the special one

In cross attention, the decoder's words attend to the **encoder's output** (the contextual embeddings of the input sentence).

**The key difference:**
```
Self-Attention:  Q, K, V all come from the SAME sentence
Cross-Attention: Q comes from DECODER (translated words so far)
                 K and V come from ENCODER (original sentence embeddings)
```

**Why cross attention?**

When translating "I made kheer" to Hindi:
- The decoder generates "Maine" first.
- Now it needs to generate the next word. Its **query** is: "I've said 'Maine' (I), now what part of the English sentence should I focus on next?"
- It looks at the **keys and values** from the encoder (which represents the full English sentence).
- The encoder's key for "made" matches this query strongly → decoder attends to "made" → produces "banai" (made).

This is why it's called **cross** attention — the query comes from one side (decoder/Hindi) and keys/values from the other side (encoder/English).

```
Encoder Output (English embeddings)
         ↓
    K and V ──────────────────────┐
                                  ↓
[DECODER]  Q from "Maine" → Cross Attention → produces "kheer"
                                  ↓
           Q from "Maine kheer" → Cross Attention → produces "banai"
```

---

## 17. How the Model Gets Trained

Everything we described above — the WQ, WK, WV matrices, the FFN weights, the static embeddings — all of these are **learned during training**.

### The Training Data (Self-Supervised)

You don't need manually labeled data! You just take raw text from:
- Wikipedia
- Books
- Internet crawl data

And create training pairs automatically:

| Input (X) | Target (Y) |
|---|---|
| "Developing an advanced crude" | "spacecraft" |
| "SI engaging both alliances and" | "hostilities" |
| "I made a sweet Indian rice" | "dish" |

The model predicts the next word. If it's wrong, error is calculated and backpropagated through the entire architecture (updating WQ, WK, WV, FFN weights, embedding matrix, etc.).

After processing **millions of such sentences**, the model learns:
- After "crude" → high probability of "spacecraft", "oil"
- After "alliances" → high probability of "hostilities", "negotiations"
- After "Indian rice" → high probability of "dish", "curry"

### What Gets Updated During Training?

1. **Static Embedding Matrix** → better word representations
2. **WQ, WK, WV matrices** → better attention computation
3. **FFN weights** → better non-linear transformations
4. **Layer normalization parameters** → better stability

After training is complete, all these are **frozen** (fixed). This trained model is then used for inference (making predictions on new sentences).

---

## 18. Quick Reference — All Key Terms

| Term | Simple Meaning |
|---|---|
| **Language Model** | A model that predicts the next word in a sentence |
| **Token** | A piece of text (roughly a word, sometimes part of a word) |
| **Vocabulary** | The complete list of all tokens the model knows (~30K-50K tokens) |
| **Static Embedding** | A fixed vector for each word — doesn't change based on context |
| **Contextual Embedding** | A vector for a word that changes based on surrounding words |
| **Word2Vec / GloVe** | Models that generate static embeddings |
| **Self-Attention** | Each word attending to all other words in the same sentence |
| **Query (Q)** | What a word is "asking for" from other words |
| **Key (K)** | What each word "claims about itself" |
| **Value (V)** | What each word actually "contributes" to the query |
| **WQ, WK, WV** | Learned weight matrices that produce Q, K, V from embeddings |
| **Attention Score** | How much one word should influence another (0-100%) |
| **Softmax** | Converts raw scores to probabilities that sum to 1 |
| **Multi-Head Attention** | Multiple attention computations in parallel, each focusing on different relationships |
| **Positional Encoding** | Small vectors added to embeddings to tell the model word order |
| **Residual Connection** | Adding the original input back to the output to preserve information and help gradient flow |
| **Layer Normalization** | Normalizing values after each block for stable training |
| **Feed Forward Network (FFN)** | A small fully connected neural network after attention — adds non-linearity |
| **Encoder** | Processes input sentence to produce contextual embeddings |
| **Decoder** | Uses encoder output to generate output words one by one |
| **Cross Attention** | Decoder's attention where Q comes from decoder, K/V come from encoder |
| **BERT** | Transformer with encoder only — for understanding tasks |
| **GPT** | Transformer with decoder only — for generation tasks |
| **Pre-training** | Training on massive text data to learn embeddings and weights |
| **Inference** | Using the trained model to make predictions on new data |
| **NX Layers** | The Transformer block is stacked N times (e.g., 12 for BERT base, 24 for BERT large) |
| **dk** | Dimension of key vector (used in attention formula for scaling) |

---

## The Complete Mental Model — One Final Summary

Read this once and you'll have the whole picture:

```
1. Every word in your sentence becomes a NUMBER VECTOR (embedding).
   These vectors capture meaning so well, you can do math: King - Man + Woman = Queen.

2. But fixed vectors aren't enough — "dish" in "cheese dish" ≠ "dish" in "rice dish".
   We need contextual vectors that change based on surroundings.

3. The Transformer's ENCODER does this with ATTENTION:
   → For each word, figure out which other words matter most.
   → Mathematically done with Query, Key, Value vectors.
   → Q·K gives attention score → softmax makes it a percentage → multiply by V → add up.
   → "dish" now absorbs meaning from "sweet", "Indian", "rice".

4. MULTI-HEAD ATTENTION does this many times in parallel:
   → Each head focuses on a different type of relationship (adjectives, verbs, pronouns...).
   → All outputs combined = rich, multi-dimensional understanding.

5. FEED FORWARD NETWORK adds non-linearity:
   → Captures complex patterns that attention alone can't.

6. This ENCODER BLOCK (attention + FFN + normalization) is stacked 12-24 times.
   → Each stack further refines the contextual embedding.

7. DECODER uses these contextual embeddings to generate output:
   → For translation: it attends to encoder output (cross attention) while generating.
   → For next-word prediction: it predicts one word at a time.

8. All of this is TRAINED on millions of sentences:
   → Predict next word → compare with actual → calculate error → backpropagate.
   → WQ, WK, WV, FFN weights, embeddings all get updated.
   → After training: frozen. Ready for use.
```

---

*Notes compiled from the Transformers video — explained in a clear, one-flow format from word embeddings to full encoder-decoder architecture. Key insight: everything comes down to one idea — letting every word "pay attention" to every other word to understand context.*
