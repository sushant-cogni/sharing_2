# GenAI & RAG — Full Course Notes
## Chapter 3: Working with LLM APIs in Python

---

> This is where you write actual code for the first time. By the end of this chapter you will have a working chatbot running on your machine — one that can hold a conversation, stream responses word by word, and call functions in your code. Read every section in order. Each one builds on the previous.

---

## 3.1 — Setting Up Your Python Environment

Before any code, you need to set up your workspace properly. This is a one-time setup.

### Step 1: Install Python

Make sure Python 3.9 or above is installed.

```bash
python --version
# Should show Python 3.9.x or higher
```

If not installed, download it from python.org.

### Step 2: Create a Project Folder

```bash
mkdir genai-course
cd genai-course
```

### Step 3: Create a Virtual Environment

**What is a virtual environment and why do you need it?**

The problem: If you install packages directly on your system, different projects may need different versions of the same package. This causes conflicts.

The solution: A virtual environment is an isolated Python environment for your project. Packages installed inside it do not affect anything outside it.

```bash
# Create the virtual environment
python -m venv venv

# Activate it
# On Mac/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

You will see `(venv)` appear at the start of your terminal prompt. This means you are inside the virtual environment. Always activate it when working on this project.

### Step 4: Install Required Packages

```bash
pip install openai anthropic python-dotenv
```

- `openai` — Python SDK to talk to OpenAI's API
- `anthropic` — Python SDK to talk to Anthropic's Claude API
- `python-dotenv` — loads environment variables from a `.env` file

### Step 5: Store Your API Key Safely

**The problem:** You need an API key to call LLM APIs. But you should never write your API key directly in your code. Why? Because if you upload your code to GitHub, your key becomes public. Anyone can use it and you will be charged.

**The solution:** Store the key in a separate `.env` file. Add that file to `.gitignore` so it never gets uploaded.

Create a file called `.env` in your project folder:

```
OPENAI_API_KEY=sk-your-actual-key-here
```

Create a `.gitignore` file:

```
.env
venv/
__pycache__/
```

Now your key is safe. Your code reads it from the environment, not hardcoded.

**How to get an API key:**
- OpenAI: Go to platform.openai.com → API Keys → Create new key
- Anthropic: Go to console.anthropic.com → API Keys → Create key

Both require a credit card. Costs are very low for learning — a few rupees for hundreds of calls.

---

## 3.2 — Your First API Call

Create a file called `first_call.py`:

```python
from openai import OpenAI
from dotenv import load_dotenv

# This loads the keys from your .env file into the environment
load_dotenv()

# Create the client — it automatically reads OPENAI_API_KEY from environment
client = OpenAI()

# Make the API call
response = client.chat.completions.create(
    model="gpt-4o-mini",          # Which model to use
    messages=[
        {
            "role": "system",
            "content": "You are a helpful assistant."
        },
        {
            "role": "user",
            "content": "What is the capital of France?"
        }
    ]
)

# Extract the text from the response
answer = response.choices[0].message.content
print(answer)
```

Run it:
```bash
python first_call.py
# Output: The capital of France is Paris.
```

That is your first API call. Let us now understand exactly what is happening.

---

## 3.3 — Understanding the Response Object

The `response` object has a lot more information than just the text. Let us look at it:

```python
print(response)
```

You will see something like:
```
ChatCompletion(
  id='chatcmpl-abc123',
  choices=[
    Choice(
      finish_reason='stop',
      index=0,
      message=ChatCompletionMessage(
        content='The capital of France is Paris.',
        role='assistant'
      )
    )
  ],
  model='gpt-4o-mini',
  usage=CompletionUsage(
    completion_tokens=8,
    prompt_tokens=24,
    total_tokens=32
  )
)
```

**Important fields:**

`response.choices[0].message.content` → The actual text reply from the model.

`response.usage.prompt_tokens` → How many tokens your input used.

`response.usage.completion_tokens` → How many tokens the model generated.

`response.usage.total_tokens` → Total tokens. This is what you are billed for.

`response.choices[0].finish_reason` → Why the model stopped generating:
- `"stop"` → model finished naturally
- `"length"` → hit the max token limit you set
- `"tool_calls"` → model wants to call a function (covered later)

---

## 3.4 — Key Parameters You Will Use

When making the API call, you can control several things:

```python
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[...],
    
    temperature=0.7,      # Creativity (0 = deterministic, 2 = very random)
    max_tokens=500,       # Maximum tokens in the response
    top_p=0.9,            # Alternative to temperature (usually leave at default)
)
```

**When to adjust temperature:**
- Factual answers, data extraction, classification → `temperature=0` or `0.1`
- Normal conversation, summaries → `temperature=0.7`
- Creative writing, brainstorming → `temperature=1.2`

**When to set max_tokens:**
- Always set it in production to avoid unexpectedly large (and expensive) responses.
- For a short answer: `max_tokens=100`
- For a detailed explanation: `max_tokens=1000`

---

## 3.5 — Multi-Turn Conversations (Chat History)

Right now you are making single-turn calls — one question, one answer. But for a real chatbot, you need the model to remember the conversation.

**The problem:** LLMs have no memory between API calls. Every call is completely fresh. The model does not remember the previous message.

**The solution:** You send the entire conversation history with every API call.

Each time the user sends a message, you:
1. Add their message to the history list
2. Send the whole history to the API
3. Get the response
4. Add the response to the history list
5. Repeat

```python
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI()

# This list holds the entire conversation
conversation_history = [
    {
        "role": "system",
        "content": "You are a helpful assistant. Be concise."
    }
]

def chat(user_message):
    # Add the user's message to history
    conversation_history.append({
        "role": "user",
        "content": user_message
    })
    
    # Send the full history to the API
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=conversation_history,
        temperature=0.7
    )
    
    # Get the assistant's reply
    assistant_reply = response.choices[0].message.content
    
    # Add the reply to history so next call remembers it
    conversation_history.append({
        "role": "assistant",
        "content": assistant_reply
    })
    
    return assistant_reply


# Test the conversation
print(chat("My name is Arjun."))
# Output: Nice to meet you, Arjun! How can I help you today?

print(chat("What is my name?"))
# Output: Your name is Arjun.
```

The model remembered your name because you sent the full history including the previous exchange.

**The context window problem again:**

If the conversation goes on for a very long time, the history grows larger and larger. Eventually it will exceed the model's context window limit. When that happens, you will get an error.

Solutions (for when you need them):
- **Sliding window:** only keep the last N messages
- **Summarization:** periodically summarize older messages and replace them with a summary
- **RAG-based memory:** store and retrieve relevant past context (covered later)

For now, the simple history list is fine for learning.

---

## 3.6 — Streaming Responses

**The problem:** When you make an API call, you wait until the model finishes generating the entire response before you get anything back. For a long response, this could be 5–10 seconds of waiting while staring at a blank screen.

**The solution → Streaming.**

With streaming, tokens are sent back to you as they are generated — one by one. You can start showing the text to the user immediately, just like ChatGPT does.

```python
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI()

# Notice stream=True
stream = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "user", "content": "Explain how the internet works in simple terms."}
    ],
    stream=True
)

# Print each chunk as it arrives
for chunk in stream:
    # Each chunk may or may not have content
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="", flush=True)

print()  # New line at the end
```

**What is happening here:**
- Instead of waiting for the full response, you get a stream of chunks
- Each chunk has a small piece of text (`delta.content`)
- `end=""` prevents Python from adding a newline after each piece
- `flush=True` forces the output to appear immediately instead of buffering

The user sees the text appearing word by word — much better experience.

---

## 3.7 — Using Anthropic's Claude API

Everything above used OpenAI. Using Anthropic's Claude is very similar. Here is the equivalent code:

Add to your `.env`:
```
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
```

```python
import anthropic
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=1000,
    system="You are a helpful assistant.",   # System prompt is separate here
    messages=[
        {"role": "user", "content": "What is the capital of France?"}
    ]
)

print(response.content[0].text)
```

**Key differences from OpenAI:**
- The system prompt is a separate parameter, not part of the messages list
- Response text is at `response.content[0].text` (not `response.choices[0].message.content`)
- `max_tokens` is required in Anthropic (not optional)

**Streaming with Anthropic:**

```python
with client.messages.stream(
    model="claude-sonnet-4-5",
    max_tokens=1000,
    messages=[{"role": "user", "content": "Explain quantum computing simply."}]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

For this course, you can use either OpenAI or Anthropic. Both work the same way conceptually. Pick one and stick with it while learning.

---

## 3.8 — Function Calling (Tool Use)

This is one of the most powerful features of modern LLMs — and it is the foundation of AI agents.

**The problem:**
An LLM only knows what it was trained on. It cannot:
- Get live data (weather, stock prices)
- Access your database
- Do precise math
- Know what time it is right now
- Run code

**The solution → Function Calling.**

You define functions in your code and tell the LLM they exist. When the LLM decides it needs one of those functions to answer a question, it does not call the function itself — it tells you "I need to call this function with these arguments." You then call the function, get the result, and send it back to the LLM. The LLM uses that result to form its final answer.

**The flow:**

```
User: "What is the weather in Mumbai right now?"
     ↓
LLM: "I need to call get_weather(city='Mumbai')"
     ↓
Your code: calls get_weather("Mumbai") → returns {"temp": 32, "condition": "Sunny"}
     ↓
LLM: "The weather in Mumbai is currently 32°C and Sunny."
```

The LLM never calls the function directly. It only tells you which function to call and with what arguments. You are always in control.

**Code example:**

```python
from openai import OpenAI
from dotenv import load_dotenv
import json

load_dotenv()
client = OpenAI()

# Step 1: Define your actual Python function
def get_weather(city: str) -> dict:
    # In a real app, this would call a weather API
    # For this example, we are returning fake data
    fake_weather = {
        "Mumbai": {"temperature": 32, "condition": "Sunny", "humidity": "75%"},
        "Delhi": {"temperature": 28, "condition": "Hazy", "humidity": "60%"},
        "Bangalore": {"temperature": 24, "condition": "Cloudy", "humidity": "70%"},
    }
    return fake_weather.get(city, {"error": "City not found"})


# Step 2: Describe the function to the LLM in a specific format
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the current weather for a given city",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {
                        "type": "string",
                        "description": "The name of the city, e.g. Mumbai"
                    }
                },
                "required": ["city"]
            }
        }
    }
]

messages = [
    {"role": "user", "content": "What is the weather in Mumbai right now?"}
]

# Step 3: First API call — LLM decides if it needs to call a function
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=messages,
    tools=tools
)

# Step 4: Check if the LLM wants to call a function
if response.choices[0].finish_reason == "tool_calls":
    
    tool_call = response.choices[0].message.tool_calls[0]
    function_name = tool_call.function.name
    function_args = json.loads(tool_call.function.arguments)
    
    print(f"LLM wants to call: {function_name} with args: {function_args}")
    # Output: LLM wants to call: get_weather with args: {'city': 'Mumbai'}
    
    # Step 5: Actually call the function
    result = get_weather(**function_args)
    
    # Step 6: Add the function result back into the messages
    messages.append(response.choices[0].message)  # Add LLM's tool call message
    messages.append({
        "role": "tool",
        "tool_call_id": tool_call.id,
        "content": json.dumps(result)
    })
    
    # Step 7: Second API call — LLM forms the final answer using the result
    final_response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        tools=tools
    )
    
    print(final_response.choices[0].message.content)
    # Output: The weather in Mumbai right now is 32°C with Sunny conditions and 75% humidity.
```

**Why is this so powerful?**

Because now you can give the LLM the ability to do anything your code can do — query your database, call any API, run calculations, write to files, send emails. The LLM becomes the "brain" that decides what to do, while your code does the actual work.

This is the exact pattern that powers AI agents. Instead of one function, agents have many tools. The LLM decides which tool to use, in what order, to complete a complex task.

---

## 3.9 — Error Handling

In production, API calls can fail. You must handle errors properly.

Common errors:
- **Rate limit error** — you sent too many requests too quickly
- **Invalid API key** — key is wrong or expired
- **Context length exceeded** — your messages are too long for the model
- **Server error** — OpenAI/Anthropic having issues (rare)

```python
from openai import OpenAI, RateLimitError, AuthenticationError, BadRequestError
from dotenv import load_dotenv
import time

load_dotenv()
client = OpenAI()

def safe_chat(user_message, retries=3):
    for attempt in range(retries):
        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": user_message}],
                max_tokens=500
            )
            return response.choices[0].message.content
            
        except RateLimitError:
            if attempt < retries - 1:
                print(f"Rate limit hit. Waiting 20 seconds before retry {attempt + 2}...")
                time.sleep(20)
            else:
                return "Error: Rate limit exceeded. Please try again later."
                
        except AuthenticationError:
            return "Error: Invalid API key. Please check your .env file."
            
        except BadRequestError as e:
            return f"Error: Bad request — {str(e)}"

result = safe_chat("Explain Python generators simply.")
print(result)
```

For a learning project, a simple try/except is enough. In production apps you would use more sophisticated retry logic.

---

## 3.10 — Tracking Token Usage and Cost

When building real applications, you need to track how many tokens you are using — both to understand cost and to make sure you are not wasting tokens.

```python
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI()

# Approximate cost per 1000 tokens (check current pricing at platform.openai.com)
COST_PER_1K_INPUT_TOKENS = 0.00015   # gpt-4o-mini input
COST_PER_1K_OUTPUT_TOKENS = 0.00060  # gpt-4o-mini output

def chat_with_cost_tracking(user_message):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": user_message}]
    )
    
    usage = response.usage
    
    input_cost = (usage.prompt_tokens / 1000) * COST_PER_1K_INPUT_TOKENS
    output_cost = (usage.completion_tokens / 1000) * COST_PER_1K_OUTPUT_TOKENS
    total_cost = input_cost + output_cost
    
    print(f"Tokens used — Input: {usage.prompt_tokens}, Output: {usage.completion_tokens}")
    print(f"Estimated cost: ${total_cost:.6f}")
    
    return response.choices[0].message.content

answer = chat_with_cost_tracking("What is a transformer in machine learning?")
print(answer)
```

gpt-4o-mini is extremely cheap for learning. A typical question costs less than $0.001 (less than 0.1 paise). You can make thousands of calls for a dollar.

---

## 3.11 — Putting It All Together: A Working Chatbot

Here is a complete, working command-line chatbot combining everything from this chapter:

```python
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI()

def run_chatbot():
    print("Chatbot is ready. Type 'quit' to exit.\n")
    
    conversation_history = [
        {
            "role": "system",
            "content": (
                "You are a helpful and friendly assistant. "
                "Be concise but thorough. "
                "If you don't know something, say so honestly."
            )
        }
    ]
    
    while True:
        # Get user input
        user_input = input("You: ").strip()
        
        if user_input.lower() in ["quit", "exit", "bye"]:
            print("Chatbot: Goodbye!")
            break
        
        if not user_input:
            continue
        
        # Add to history
        conversation_history.append({
            "role": "user",
            "content": user_input
        })
        
        # Stream the response
        print("Assistant: ", end="", flush=True)
        
        full_response = ""
        
        stream = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=conversation_history,
            stream=True,
            temperature=0.7,
            max_tokens=500
        )
        
        for chunk in stream:
            if chunk.choices[0].delta.content is not None:
                text_piece = chunk.choices[0].delta.content
                print(text_piece, end="", flush=True)
                full_response += text_piece
        
        print()  # New line after response
        
        # Add full response to history
        conversation_history.append({
            "role": "assistant",
            "content": full_response
        })

if __name__ == "__main__":
    run_chatbot()
```

Run it:
```bash
python chatbot.py
```

You will have a working, streaming, multi-turn chatbot in the terminal.

---

## 3.12 — Your Project for This Chapter

Build this on your own. It will reinforce everything.

**Project: Personal Study Assistant**

A chatbot that acts as a study assistant for any topic of your choice.

Requirements:
1. Has a system prompt that defines its role (e.g., "You are a patient teacher who explains concepts in simple language with examples")
2. Holds full multi-turn conversation
3. Streams responses
4. When the user types "summary", the assistant summarizes the entire conversation so far
5. When the user types "quit", the conversation ends

**Hint for the summary feature:**

When the user types "summary", instead of the user message being "summary", send this message to the API:
`"Please summarize our entire conversation so far into bullet points."`

The model already has the conversation history, so it can do this easily.

---

## Chapter 3 Summary

- Set up a Python project with virtual environment and `.env` for API keys
- Made your first API call to OpenAI and Anthropic
- Understood the response object — content, tokens, finish reason
- Managed multi-turn conversation using a history list
- Streamed responses token by token for better user experience
- Used function calling — gave the LLM the ability to trigger code
- Handled errors gracefully
- Built a complete working chatbot

---

## What Is Coming Next

**Chapter 4 — Embeddings and Vector Databases**

This is the chapter where everything changes. You will learn how text is converted into numbers that carry meaning, and how those numbers are stored and searched in a vector database. This is the most important technical concept before RAG. Understanding this chapter deeply will make RAG click immediately.

---

*End of Chapter 3*
