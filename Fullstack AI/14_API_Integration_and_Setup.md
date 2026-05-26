# 📘 Notes — API Integration & Setup (OpenAI + Gemini)

> **Section:** Calling LLMs from Python — your first AI API integration
> **What you'll learn:** Setting up OpenAI and Gemini accounts, making your first API call, using `.env` files for secrets, and the trick to use Gemini with the OpenAI SDK.
> **Interview-ready:** API integration with LLMs is fundamental to building AI applications.

---

## 1. Why API Integration Matters

So far you've **understood** LLMs and Transformers conceptually. Now it's time to **actually call them from code** — this is where AI app development begins.

### Two big players we'll use
| Provider | Model | Cost |
|---|---|---|
| **OpenAI** | GPT-4o, GPT-4.1, GPT-o3 | Paid (min $5 to add credits) |
| **Google Gemini** | Gemini 2.5, Gemini 2.5 Pro | Free (as of today) |

---

## 2. Setting Up OpenAI Account

### Steps
1. Go to **`platform.openai.com`** and sign up (Google login works).
2. Click **Dashboard** in the top-right.
3. From the dashboard, you can access:
   - **Chat / Prompts** — create and save prompts
   - **Playground** — play with models interactively
   - **Usage** — track input/output tokens, costs
   - **API Keys** — generate keys for code

### Important: Add credits ($5 minimum)
OpenAI's API is **not free**. You must add at least $5 to your account.

- Go to **Settings → Billing**
- Click **Add credits**
- Link your card and pay $5

> 💡 **$5 is more than enough** for an entire course of experiments — typical use is just a few cents.

### Generate an API Key
1. Go to **API Keys** section.
2. Click **Create new secret key**.
3. Name it (e.g., `test_api_key`).
4. **Copy the key immediately** — you can't see it again later.
5. **Revoke old keys** when done (security best practice).

### 🎯 Security rule
> **NEVER commit API keys to GitHub.** Always store them in a `.env` file and add `.env` to your `.gitignore`.

---

## 3. Your First OpenAI API Call

### Step 1 — Install the SDK
```bash
pip install openai
pip freeze > requirements.txt    # save dependencies
```

### Step 2 — Set up project structure
```
your_project/
├── venv/                    # virtual environment
├── .env                     # API keys (NEVER commit)
├── hello_world/
│   └── main.py              # your code
└── requirements.txt
```

### Step 3 — Create `.env` file
```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ The name MUST be **exactly** `OPENAI_API_KEY` — that's what the SDK looks for.

### Step 4 — Write the code

```python
from openai import OpenAI

client = OpenAI()

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "user", "content": "Hey there"}
    ]
)

print(response.choices[0].message.content)
```

### Step 5 — Run it
```bash
python main.py
```

You'll likely see an error:
```
OpenAIError: The api_key client option must be set...
```

Why? Because the `.env` file isn't being loaded automatically.

### Step 6 — Load `.env` with `python-dotenv`
```bash
pip install python-dotenv
```

```python
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()        # ⭐ loads .env into environment variables

client = OpenAI()    # automatically reads OPENAI_API_KEY

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "user", "content": "Hey, I am Piyush. Nice to meet you."}
    ]
)

print(response.choices[0].message.content)
```

### Output
```
Nice to meet you, Piyush! How can I assist you today?
```

🎉 You just made your first LLM API call!

---

## 4. Understanding the OpenAI API Call

Let's break down the `chat.completions.create()` call:

```python
client.chat.completions.create(
    model="gpt-4o",                      # which LLM to use
    messages=[                            # the conversation history
        {"role": "user", "content": "..."}
    ]
)
```

### Parameters explained

| Parameter | Meaning |
|---|---|
| `model` | The LLM to call (e.g., `"gpt-4o"`, `"gpt-4o-mini"`, `"gpt-4.1"`) |
| `messages` | A list of message dictionaries — each has a `role` and `content` |
| `role` | Who is speaking: `"user"`, `"assistant"`, `"system"`, or `"tool"` |
| `content` | The actual text |

### Response structure

```python
response.choices[0].message.content
```

- `choices` → a list (LLMs can return multiple completions)
- `[0]` → first choice (usually only one)
- `.message.content` → the actual text the model generated

### Common model choices

| Model | Use case | Cost |
|---|---|---|
| `gpt-4o` | Best balance of speed + quality | Medium |
| `gpt-4o-mini` | Lightweight, cheap | Low |
| `gpt-4.1` | High quality | Higher |
| `gpt-o3-mini` | Reasoning model (lightweight) | Medium |

---

## 5. Setting Up Gemini Account (Free Alternative)

### Steps
1. Go to **`aistudio.google.com`**.
2. Sign in with Google.
3. Click **Get API key** in the left sidebar.
4. Click **Create API key** → choose a project.
5. Copy the key.

### No billing required
Gemini is **free as of today** (no card needed, no credits to add).

> ⚠️ **Disclaimer:** Free today doesn't mean free forever. Google may change this at any time.

---

## 6. Calling Gemini from Python (Native SDK)

### Install the SDK
```bash
pip install google-genai
```

### Code
```python
from google import genai

client = genai.Client(api_key="YOUR_GEMINI_API_KEY")

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Explain how AI works in few words"
)

print(response.text)
```

### Output
```
AI learns patterns from data to make intelligent decisions.
```

---

## 7. The Clever Trick — Using Gemini with OpenAI SDK ⭐

> Google made Gemini **OpenAI-compatible** — meaning you can call Gemini using the **same OpenAI SDK code** you wrote earlier.

### Why does this matter?
- The course uses OpenAI SDK throughout.
- If you want to follow along without paying for OpenAI, you can **redirect** OpenAI SDK calls to Gemini.
- One SDK, multiple providers — **portable code**.

### How — just two parameter changes:

```python
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_GEMINI_API_KEY",                                   # use Gemini key
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"    # redirect to Google
)

response = client.chat.completions.create(
    model="gemini-2.5-flash",        # ⚠️ must use a Gemini model name now
    messages=[
        {"role": "user", "content": "Who are you?"}
    ]
)

print(response.choices[0].message.content)
```

### Output
```
I am a large language model, trained by Google.
```

### 🎯 What's happening behind the scenes
The OpenAI SDK normally sends requests to OpenAI's servers. By changing the `base_url`, you redirect those requests to Google's servers — which **accept OpenAI-format requests** and respond with OpenAI-format responses. The SDK doesn't care; the protocol matches.

### ⚠️ Things to watch out for
1. **Model name must match the provider** — `gpt-4o` won't work; use `gemini-2.5-flash` instead.
2. **Free today ≠ free tomorrow** — Google might change pricing.
3. **99% feature parity, 1% gotchas** — most things work, but advanced features may behave differently.

---

## 8. Best Practices for API Integration

### Security
1. **Use `.env` files** for API keys — never hardcode them.
2. **Add `.env` to `.gitignore`** — never commit secrets.
3. **Revoke unused keys** regularly.
4. **Use different keys** for dev/staging/production.

### Cost Management
1. **Track your usage** in the dashboard.
2. **Set spending limits** if available.
3. **Use cheaper models** for development/testing (e.g., `gpt-4o-mini`).
4. **Reuse responses where possible** — don't re-call for the same query.

### Error Handling
1. **Wrap API calls in try/except** — networks fail, rate limits hit.
2. **Handle rate limits** with exponential backoff.
3. **Log errors** to debug issues.
4. **Have a fallback** — try Gemini if OpenAI is down, or vice versa.

### Example with error handling
```python
from openai import OpenAI, OpenAIError
from dotenv import load_dotenv

load_dotenv()
client = OpenAI()

try:
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": "Hello!"}]
    )
    print(response.choices[0].message.content)
except OpenAIError as e:
    print(f"API error: {e}")
except Exception as e:
    print(f"Unexpected error: {e}")
```

---

## 9. Project Structure Template

A typical AI project structure:

```
my_ai_project/
├── venv/                         # virtual environment (don't commit)
├── .env                          # secrets (don't commit)
├── .env.example                  # template for others
├── .gitignore                    # ignore venv, .env, __pycache__
├── requirements.txt              # dependencies
├── README.md                     # project documentation
├── src/
│   ├── __init__.py
│   ├── main.py                   # entry point
│   ├── llm_client.py             # LLM API wrapper
│   └── utils.py                  # helpers
└── tests/
    └── test_main.py
```

### Sample `.gitignore`
```
# Virtual env
venv/
env/
.venv/

# Secrets
.env
*.env

# Python
__pycache__/
*.pyc
*.pyo
.pytest_cache/

# IDE
.vscode/
.idea/
```

### Sample `.env.example`
```
OPENAI_API_KEY=your-key-here
GEMINI_API_KEY=your-key-here
```

---

## 🎯 Master Summary

| Topic | Key idea |
|---|---|
| **OpenAI setup** | Sign up at `platform.openai.com`, add $5 credits, generate API key |
| **Gemini setup** | Free at `aistudio.google.com`, no card needed |
| **`.env` file** | Stores API keys outside your code |
| **`python-dotenv`** | Loads `.env` into environment variables — call `load_dotenv()` first |
| **`OPENAI_API_KEY`** | Exact name expected by OpenAI SDK |
| **Chat completion** | `client.chat.completions.create(model, messages)` |
| **Response structure** | `response.choices[0].message.content` |
| **`messages` format** | List of `{"role": "...", "content": "..."}` dicts |
| **Roles** | `user`, `assistant`, `system`, `tool` |
| **Gemini SDK** | `google.genai` — different API style |
| **OpenAI-compatible Gemini** | Use `base_url` param to redirect OpenAI SDK to Google |
| **Security** | Never commit `.env`; add to `.gitignore` |
| **Cost control** | Use cheaper models in dev; track usage in dashboard |

---

## 🔑 Key Learnings

1. **OpenAI requires payment** — minimum $5 to use the API.
2. **Gemini is free today** — great for learning and prototyping.
3. **API keys MUST be secret** — store in `.env`, never in code.
4. **`load_dotenv()`** must be called BEFORE creating the client.
5. **OPENAI_API_KEY** is the exact env variable name the SDK expects.
6. **`messages` is a list of dicts** with `role` and `content`.
7. **Roles matter**: `user` (you), `assistant` (LLM), `system` (instructions), `tool` (function results).
8. **Response is nested**: `response.choices[0].message.content`.
9. **Gemini works with OpenAI SDK** by setting `base_url` to Google's OpenAI-compatible endpoint.
10. **Model name must match provider** when switching between providers.
11. **Always handle errors** — networks, rate limits, model errors happen.
12. **Reuse the OpenAI SDK style** — most providers (Mistral, Groq, Anthropic with adapters) follow it.

---

## 📌 Interview Cheat Sheet

| Question | Answer |
|---|---|
| **How do you call an LLM from Python?** | Install SDK (`pip install openai`), set API key in `.env`, use `client.chat.completions.create()`. |
| **Why use a `.env` file?** | To keep secrets like API keys out of source code and away from version control. |
| **What does `load_dotenv()` do?** | Reads the `.env` file and loads variables into `os.environ` so SDKs can find them. |
| **What is the format of `messages`?** | A list of dicts, each with `"role"` and `"content"` keys. |
| **What roles exist?** | `user`, `assistant`, `system`, `tool`. |
| **How do you switch between OpenAI and Gemini easily?** | Use OpenAI SDK with `base_url` pointing to Gemini's OpenAI-compatible endpoint. |
| **Why use OpenAI SDK for Gemini?** | Code portability — one SDK style works across providers. |
| **How do you protect API keys?** | Store in `.env`, add to `.gitignore`, never commit to Git. |
| **How do you choose a model?** | Based on cost, quality needs, and speed — `gpt-4o-mini` for cheap, `gpt-4o` for balance. |
| **What's `response.choices[0].message.content`?** | The first generated response from the LLM (LLMs can return multiple completions). |

---

## 💡 Instructor's Final Thoughts

> "$5 is more than enough for this entire course. We've experimented a lot of projects and only used a few cents."

> "Throughout this course, I'll use the OpenAI SDK. If you want to follow along with Gemini for free, just set the `base_url` — your code stays almost identical."

> "Gemini is free today, but I can't guarantee it will be free in the future. And 99% of features work the same, but 1% might fail in edge cases."

---

End of Section — API Integration & Setup. Next up: Building real AI agents and workflows!
