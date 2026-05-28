# GenAI & RAG — Full Course Notes
## Chapter 1: Understanding AI, ML, Deep Learning & LLMs

---

> These notes are written assuming you know nothing. Every concept is explained from scratch, in simple language, in one flow. Read it like a story.

---

## 1.1 — What is Artificial Intelligence?

Let's start from the most basic question.

**What is intelligence?**
Intelligence is the ability to take in information, understand it, and make a decision or take an action based on it.

A human sees dark clouds → understands it might rain → decides to carry an umbrella. That is intelligence.

**What is Artificial Intelligence?**
It is making a machine do the same thing. Take in information, understand it, and make a decision.

A simple example — a thermostat. It reads the temperature. If it is too cold, it turns on the heater. If it is warm enough, it turns off. That is the most basic form of AI.

But this thermostat is not really intelligent. Someone wrote exact rules for it — "if temperature < 20, turn on heater." It just follows those rules. It cannot learn. It cannot adapt.

**The real problem with rule-based systems:**

Imagine you want to build a system that can detect if an email is spam or not. You start writing rules:

- If the email contains the word "lottery" → spam
- If the email contains "free money" → spam
- If the email contains "click here" → spam

You write 100 rules. Then spammers change their words. Now they write "fr3e m0ney" instead of "free money." Your rules fail. You update your rules. They change again. This becomes an endless game.

The problem is — **you cannot write rules for everything manually.** The world is too complex.

**The solution → Machine Learning.**

---

## 1.2 — What is Machine Learning?

Instead of writing rules manually, what if the machine could **learn the rules on its own** by looking at examples?

That is Machine Learning.

You give the machine thousands of spam emails and thousands of non-spam emails. You tell it — "these are spam, these are not spam." The machine looks at all of them, finds patterns on its own, and creates its own rules internally.

Now when a new email arrives, it applies those learned rules to decide — spam or not spam.

You did not write any rules. The machine figured them out itself from the data.

**A simple real-life analogy:**

Think about how a child learns what a "dog" is. You don't give the child a rule sheet that says:
- 4 legs → might be dog
- Has fur → might be dog
- Barks → dog

No. You just show the child many dogs. "This is a dog. This is a dog. This is also a dog." Over time the child builds their own understanding of what a dog looks like. They can then identify a dog they have never seen before.

Machine Learning works the same way. Show it many examples. It builds its own internal understanding.

**So what is the difference between AI and ML?**

AI is the broad goal — making machines intelligent.
ML is one specific way of achieving that goal — by making machines learn from data.

All ML is AI. But not all AI is ML. (The thermostat is AI but not ML.)

---

## 1.3 — Types of Machine Learning (Brief Overview)

You will hear these terms a lot. Here is what they mean simply:

**Supervised Learning**
You give the machine data with correct answers attached.
- "This email → spam"
- "This email → not spam"
- "This house with these features → costs 50 lakhs"

The machine learns from labeled data. Most of what you will use in GenAI falls here.

**Unsupervised Learning**
You give the machine data with no answers. Just raw data.
- "Here are 10,000 customers. Find groups among them."

The machine finds patterns and groups on its own. You don't tell it what to look for.

**Reinforcement Learning**
The machine learns by doing and getting feedback.
- It tries something → gets reward if good → gets penalty if bad → learns over time.
- Like how you train a dog. Good behavior gets a treat. Bad behavior gets a "no."
- This is how ChatGPT was trained to be more helpful and safe (more on this later).

---

## 1.4 — What is Deep Learning?

Now, regular Machine Learning works well for simple problems. But for complex things — like understanding a sentence, recognizing a face in a photo, or understanding speech — it struggles.

**The problem with regular ML:**

Regular ML needs you to manually tell it which features to look at. For spam detection, a human had to say "look at these words, look at the sender, look at the subject line." The machine then works with those features.

But for a photo, how do you manually describe features? You cannot easily say "look at pixel 345 and pixel 892 together to identify a nose."

**The solution → Deep Learning (Neural Networks).**

Deep Learning uses something called a **neural network** — a system loosely inspired by how the human brain works.

Instead of you picking features manually, the neural network learns the features on its own, even for very complex inputs like images, audio, and text.

---

## 1.5 — What is a Neural Network? (The Core Idea)

You do not need to understand the math. Just understand the concept.

Think of a neural network as a series of filters or layers.

**Imagine this:**

You want to recognize if a photo has a cat in it.

- **Layer 1** looks at raw pixels. It learns to detect simple things — edges, lines, curves.
- **Layer 2** takes those edges and learns to detect shapes — circles, triangles, rectangles.
- **Layer 3** takes those shapes and learns to detect parts — ears, eyes, a nose.
- **Layer 4** takes those parts and says — yes, this is a cat.

Each layer builds on the previous one. The deeper you go, the more complex the concepts. That is why it is called **Deep** Learning — many layers deep.

**How does it learn?**

At first, all the filters are random. The network makes a guess — "this is a cat." It is usually wrong. Then it is shown the correct answer — "no, this is a dog." The error is calculated, and the network adjusts its filters slightly to do better next time.

This process happens millions of times with millions of examples. Gradually the network gets better and better. After enough training, the filters have been adjusted so precisely that the network can correctly identify cats it has never seen before.

This adjustment process is called **backpropagation** and the adjustments are guided by something called the **loss function** — but you do not need to go deep into this now. Just know that the network learns by making mistakes and correcting itself over and over.

---

## 1.6 — From Deep Learning to Language Models

So far we talked about images. But what about text and language?

For a long time, teaching machines to understand language was very difficult. Language is complex. The meaning of a word depends on its context. "Bank" means something different in "river bank" versus "bank account."

Earlier approaches processed words one by one in order. This was slow and struggled with long sentences because by the time it reached the end of a sentence, it had almost "forgotten" the beginning.

**The problem:**
Understanding a sentence requires understanding the relationship between all words, not just the ones next to each other.

In "The trophy didn't fit in the suitcase because it was too big" — what does "it" refer to? The trophy or the suitcase? Humans understand immediately. Old models struggled.

**The solution → The Transformer (2017)**

In 2017, Google researchers published a paper called "Attention Is All You Need." It introduced a new architecture called the **Transformer**.

The key idea: instead of reading words one by one, the Transformer looks at **all the words at once** and calculates how much each word should "pay attention" to every other word.

In the trophy sentence:
- The model looks at "it" and figures out it should pay a lot of attention to "trophy" based on the context.

This attention mechanism made Transformers extremely powerful at understanding language.

Almost every modern AI language model — GPT, Claude, Gemini, LLaMA — is built on the Transformer architecture.

---

## 1.7 — What is a Large Language Model (LLM)?

A **Large Language Model** is a very large neural network (Transformer-based) that has been trained on a massive amount of text.

When we say "large" — we mean:
- Trained on hundreds of billions of words (books, websites, code, articles, everything)
- Has billions of parameters (the adjustable numbers inside the network — GPT-4 is estimated to have over 1 trillion)

**What does an LLM actually learn to do?**

At its core, an LLM is trained to do one thing: **predict the next word.**

Given: "The sky is ___"
It predicts: "blue"

Given: "She opened the door and saw a ___"
It predicts: "man" or "cat" or "strange" etc.

That sounds too simple to be useful. But here is the surprising part — when you train a model to predict the next word on hundreds of billions of sentences about every topic humans have ever written about, something remarkable happens.

To predict the next word well in a medical text, the model must understand medicine. To predict the next word in a Python tutorial, it must understand programming. To predict the next word in a philosophical essay, it must understand philosophy.

So by simply learning to predict the next word, the model absorbs a deep understanding of language, knowledge, reasoning, and facts.

This is why you can ask ChatGPT or Claude anything and it gives a sensible answer. It was not programmed with answers. It learned patterns from vast human knowledge.

---

## 1.8 — Key Terms You Must Know

These are the words that will appear constantly. Learn them now.

---

### Tokens

A computer does not work with full words. It breaks text into small pieces called **tokens.**

The word "unhappiness" might be broken into: "un" + "happi" + "ness" → 3 tokens
The word "cat" → 1 token
A space + "the" → 1 token

**Why does this matter?**
Every LLM has a limit on how many tokens it can process at one time — called the **context window.** If the limit is 100,000 tokens, that is roughly 75,000 words.

Also, you are **charged** by token count when using AI APIs. More tokens = more cost.

---

### Context Window

This is the total amount of text the model can "see" at one time — your question, the conversation history, any documents you give it, all of it combined.

**The problem:**
If your conversation goes on too long and exceeds the context window, the model literally cannot see the earlier parts of the conversation anymore. It "forgets" them.

This is a real limitation of current LLMs. A lot of the techniques in this course (especially RAG) exist to work around this limitation.

---

### Parameters

These are the numbers inside the neural network. Every connection between neurons has a weight (a number). These numbers are what gets adjusted during training.

When someone says "a 7 billion parameter model" or "70B model" — they mean the model has 7 billion or 70 billion of these numbers inside it.

More parameters generally means the model can learn more complex patterns — but also needs more compute and memory to run.

---

### Inference vs Training

**Training** = the process of teaching the model. Feed it data, calculate errors, adjust parameters. This is done once (or periodically) and requires massive compute. OpenAI spends millions of dollars training GPT models.

**Inference** = using the already-trained model to get answers. When you type a question into ChatGPT and it replies, that is inference. This is what you will be doing as a developer — calling a trained model via API.

You will almost never train a model from scratch. You will use already-trained models.

---

### Temperature

When an LLM predicts the next word, it does not always pick the single most likely word. It samples from a distribution of possible words.

**Temperature controls how creative or random the output is.**

- **Temperature = 0** → always pick the most likely next word. Very predictable, very consistent. Good for factual answers.
- **Temperature = 1** → normal sampling, a good balance.
- **Temperature = 2** → very random, unpredictable, creative (but can become nonsensical).

Think of it as a creativity dial.

---

### Hallucination

This is one of the most important problems with LLMs.

Because the model is always predicting the next most likely word, sometimes it generates text that sounds very confident and correct — but is completely made up. This is called **hallucination.**

Ask an LLM about a real but obscure person, and it might invent fake publications, fake quotes, fake dates — all in a confident tone.

**Why does this happen?**
The model does not "know" facts like a database does. It learned patterns. When asked something it does not have clear patterns for, it generates the most likely-sounding words, which may be wrong.

This is a fundamental problem. Much of what you will build in this course — especially RAG — exists to solve or reduce hallucination.

---

### Embeddings

This is the most important concept for everything that comes later.

Computers cannot understand the meaning of words directly. Everything must be converted to numbers.

An **embedding** is a way of converting text (a word, sentence, or paragraph) into a list of numbers (called a **vector**) such that similar meanings end up as similar numbers.

For example:
- "king" → [0.2, 0.8, 0.1, 0.9, ...]
- "queen" → [0.2, 0.8, 0.1, 0.85, ...] ← very similar numbers
- "bicycle" → [0.9, 0.1, 0.7, 0.3, ...] ← very different numbers

The idea is: **meaning is preserved in the numbers.** Words or sentences that mean similar things have vectors that are close to each other in mathematical space.

This allows a computer to understand that "happy" and "joyful" are similar — not because they share letters, but because their vectors are mathematically close.

You will use this concept heavily when building RAG systems — where you need to find documents that are semantically similar to a user's question.

---

## 1.9 — The Landscape of LLMs Today

Not all LLMs are the same. Here is a quick map:

**Closed / Proprietary Models** (accessed via API, you cannot see or modify them)
- **GPT-4o** — by OpenAI. The most widely used.
- **Claude 3.5 / Claude 4** — by Anthropic. Known for being safe and good at reasoning.
- **Gemini 1.5 / 2.0** — by Google. Very large context window.

**Open Source Models** (you can download and run them yourself)
- **LLaMA 3** — by Meta. The most popular open source model.
- **Mistral / Mixtral** — lighter, very capable models.
- **Phi-3** — by Microsoft. Surprisingly capable small model.

For this course, you will mostly use closed APIs (OpenAI or Anthropic) because they are the easiest to start with. Later chapters will also show how to run open source models locally using a tool called **Ollama.**

---

## 1.10 — How an LLM API Call Works (Conceptual)

Before you write any code, understand the flow.

1. You write a **prompt** (a message or question).
2. You send it to the LLM via an **API call** (a network request).
3. The LLM processes it and generates a response token by token.
4. The response comes back to you.

The API is just a way to talk to the model over the internet. You send text in, you get text out.

```
Your Application
      |
      | (API call with your prompt)
      ↓
  LLM Server (OpenAI / Anthropic / Google)
      |
      | (response with generated text)
      ↓
Your Application shows the answer
```

That is it at the high level. The complexity is in what you put in the prompt, how you process the response, and what you build around it.

---

## 1.11 — Why Does This Matter for What You Are Building?

Here is the summary of the problems you now understand:

| Problem | What it means |
|---|---|
| LLMs hallucinate | They make up facts confidently |
| Context window limit | They cannot read infinite text at once |
| Training data has a cutoff | They don't know recent events |
| They don't know your private data | They were trained on public internet, not your documents |

**RAG (Retrieval-Augmented Generation) — which is the main thing you are learning — solves all four of these problems.**

Instead of asking the LLM to remember everything, you:
1. Store your documents in a searchable database
2. When a user asks a question, retrieve the relevant document parts
3. Send those parts along with the question to the LLM
4. The LLM answers based on the documents, not its memory

This way the LLM is grounded in real data. It hallucinates less. It knows your private data. It does not have a knowledge cutoff for your content.

This is the core idea. Everything that follows in this course builds toward building this system, and building it well.

---

## Chapter 1 Summary

- **AI** = making machines intelligent
- **ML** = machines learning rules from data instead of rules being written manually
- **Deep Learning** = ML using many-layered neural networks, great for complex inputs
- **Transformers** = the architecture that made modern language AI possible
- **LLM** = a very large Transformer trained on massive text, learns by predicting next word
- **Tokens** = how text is broken into pieces for the model
- **Context window** = how much text a model can see at once
- **Temperature** = creativity dial for LLM output
- **Hallucination** = model generating confident but wrong information
- **Embeddings** = converting text into numbers that preserve meaning

---

## What Is Coming Next

**Chapter 2 — Prompt Engineering**

Now that you understand what an LLM is and how it works, you will learn how to talk to it effectively. The same question asked in different ways gives very different results. Prompt Engineering is the skill of asking LLMs in the right way to get reliable, accurate, useful answers. This is the first practical skill you will build.

---

*End of Chapter 1*
