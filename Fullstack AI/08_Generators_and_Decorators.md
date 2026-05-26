# 📘 Notes — Generators & Decorators in Python

> **Section:** Generators + Decorators
> **What you'll learn:** Generators (memory-efficient functions using `yield`) and Decorators (wrappers that add behaviour to functions without modifying them).

---

# PART A — GENERATORS

---

## 1. What is a Generator?

A **generator** is a special kind of function that produces values **one at a time**, instead of computing all of them at once and loading them into memory.

### 3 key ideas to always remember:

| Idea | Meaning |
|---|---|
| **Save memory** | Values are produced one at a time — not all stored at once |
| **Don't want results immediately** | Values are generated only when you ask for them |
| **Lazy evaluation** | Work is done only when needed (not upfront) |

### The magic keyword: `yield`

Every generator uses `yield` instead of `return`.

| `return` | `yield` |
|---|---|
| Exits the function completely | Pauses the function and saves its state |
| Returns one value, function is done | Returns one value, function resumes next time |
| Function starts fresh every call | Function continues exactly where it stopped |

---

## 2. Generator vs Normal Function — Side by Side

```python
# NORMAL FUNCTION
def get_chai_list():
    return ["cup one", "cup two", "cup three"]

# GENERATOR FUNCTION
def get_chai_gen():
    yield "cup one"
    yield "cup two"
    yield "cup three"
```

Both produce the same 3 values — but how they do it is very different.

```python
chai = get_chai_gen()
print(chai)
# <generator object get_chai_gen at 0x...>
```

A generator does **not** execute immediately. It just holds a reference. To actually get values, you use `next()`.

---

## 3. The `next()` Function — Getting Values from a Generator

```python
def serve_chai():
    yield "masala chai"
    yield "ginger chai"
    yield "elaichi chai"

stall = serve_chai()    # just a reference, nothing runs yet

print(next(stall))      # "masala chai"  → runs to 1st yield, pauses
print(next(stall))      # "ginger chai"  → resumes, runs to 2nd yield, pauses
print(next(stall))      # "elaichi chai" → resumes, runs to 3rd yield, pauses
print(next(stall))      # StopIteration! No more values to yield
```

### How execution actually flows

```
next(stall) call 1 → enters function → prints "masala chai" → PAUSES at yield
next(stall) call 2 → RESUMES from where it stopped → prints "ginger chai" → PAUSES
next(stall) call 3 → RESUMES → prints "elaichi chai" → PAUSES
next(stall) call 4 → RESUMES → nothing to yield → raises StopIteration
```

### Looping through a generator (easier than calling `next()` manually)

```python
stall = serve_chai()

for cup in stall:
    print(cup)
```

This is exactly what happens behind the scenes in a `for` loop — it keeps calling `next()` until `StopIteration`.

---

## 4. Infinite Generators

A generator with a `while True` loop that never stops — useful for **streams**, **real-time systems**, and **log feeds**.

```python
def infinite_chai():
    count = 1
    while True:
        yield f"Refill #{count}"
        count += 1
```

### ⚠️ You must control how many times you consume it

```python
refill = infinite_chai()

for _ in range(3):   # only get 3 refills
    print(next(refill))

# Refill #1
# Refill #2
# Refill #3
```

### Each generator object has its own independent state

```python
user1 = infinite_chai()   # user1's own stream
user2 = infinite_chai()   # user2's completely separate stream

for _ in range(3):
    print(next(user1))   # user1 gets refills 1, 2, 3

for _ in range(6):
    print(next(user2))   # user2 gets refills 1, 2, 3, 4, 5, 6
```

They don't interfere with each other.

### ⚠️ Warning
Infinite generators with `while True` can drain memory if not controlled. Use them only when you have a specific real-time or streaming use case.

---

## 5. Sending Data INTO a Generator (`.send()`)

This is a **rarely taught but important** feature. Normally we think of generators as output-only (we consume from them). But you can also **send data in** using `.send()`.

### The pattern

```python
def chai_customer():
    print("Welcome! What chai would you like?")
    while True:
        order = yield                  # pauses + waits to receive a value
        print(f"Preparing {order}")   # uses the received value
```

### How to use it

```python
stall = chai_customer()
next(stall)                  # MUST call next() first to start the generator
                             # runs until first yield, pauses there

stall.send("masala chai")    # sends "masala chai" → order gets that value
                             # prints "Preparing masala chai" → pauses at yield again
stall.send("lemon chai")     # sends next order
                             # prints "Preparing lemon chai"
```

### ⭐ Key rules for `.send()`
1. You **must call `next()` once first** to advance the generator to the first `yield`.
2. `send()` both delivers a value AND resumes the generator.
3. If there's no `order = yield` to receive the next value, the generator will loop infinitely with nothing to stop it.

### Execution flow diagram

```
next(stall)           → prints welcome msg → pauses at "order = yield"
stall.send("masala")  → resumes → order = "masala" → prints "Preparing masala" → pauses at yield again
stall.send("lemon")   → resumes → order = "lemon" → prints "Preparing lemon" → pauses again
```

---

## 6. `yield from` — Delegating to Another Generator

When your generator needs to get values **from another generator**, use `yield from`.

```python
def local_chai():
    yield "masala chai"
    yield "ginger chai"

def imported_chai():
    yield "matcha"
    yield "oolong"

def full_menu():
    yield from local_chai()     # delegates to local_chai
    yield from imported_chai()  # then delegates to imported_chai

for chai in full_menu():
    print(chai)
```

Output:
```
masala chai
ginger chai
matcha
oolong
```

`yield from` is not just for getting values — it **delegates** the entire sub-generator task, including `send()` and `throw()` calls.

---

## 7. Closing a Generator (`.close()`)

When you're done with a generator (especially important with infinite ones or database connections), close it to **free memory** and prevent leaks.

```python
def chai_stall():
    try:
        while True:
            order = yield
            print(f"Preparing {order}")
    except GeneratorExit:
        print("Stall closed. No more chai.")

stall = chai_stall()
next(stall)                    # start generator
stall.send("masala chai")      # use it
stall.close()                  # gracefully shut it down
                               # triggers GeneratorExit inside the generator
```

### ⭐ Always close generators when done — especially with:
- Database connections
- File streams
- Long-running processes

---

## 8. Generator Methods — Full Summary

| Method | Purpose |
|---|---|
| `next(gen)` | Get the next yielded value (manually) |
| `gen.send(value)` | Send a value into the generator at the `yield` point |
| `gen.close()` | Gracefully stop the generator (triggers `GeneratorExit`) |
| `yield from other_gen()` | Delegate to another generator or iterable |

---

# PART B — DECORATORS

---

## 9. What is a Decorator?

A **decorator** is a function that **wraps another function** to add extra behaviour before and/or after it runs — without changing the original function's code.

### Coffee analogy
Think of decorators like sprinkling chocolate powder on a coffee. The coffee is still there, unchanged — the decoration just adds something on top.

### Visual

```
BEFORE: Function runs by itself
AFTER: Function is wrapped in a decorator
         +-----------------------+
         | DECORATOR             |
         |   (before logic)      |
         |   +---------------+   |
         |   | Original func |   |
         |   +---------------+   |
         |   (after logic)       |
         +-----------------------+
```

---

## 10. Writing a Basic Decorator

```python
def my_decorator(func):         # takes a function as input
    def wrapper():              # wraps it
        print("Before function runs")
        func()                  # runs the original function
        print("After function runs")
    return wrapper              # returns the wrapper

@my_decorator                   # applies the decorator
def greet():
    print("Hello from greet!")

greet()
```

Output:
```
Before function runs
Hello from greet!
After function runs
```

### How `@my_decorator` works

```python
@my_decorator
def greet():
    ...
```

This is exactly the same as:
```python
def greet():
    ...
greet = my_decorator(greet)
```

The `@` symbol is just syntactic sugar (a shortcut). Without it, you'd have to manually reassign the function.

---

## 11. The `functools.wraps` Problem and Fix

### The Problem

Without `functools.wraps`, decorators **change the identity** of the original function:

```python
print(greet.__name__)   # prints "wrapper" ← WRONG
```

The function's name, docstring, and other metadata get replaced by the wrapper's.

### The Fix: `functools.wraps`

```python
from functools import wraps

def my_decorator(func):
    @wraps(func)               # preserves original function's metadata
    def wrapper():
        print("Before")
        func()
        print("After")
    return wrapper

@my_decorator
def greet():
    """Greets the user"""
    print("Hello!")

print(greet.__name__)   # "greet" ← correct now
print(greet.__doc__)    # "Greets the user" ← correct
```

### ⭐ Rule: Always use `@wraps(func)` inside decorators — it's professional practice.

---

## 12. Decorator with Arguments (`*args`, `**kwargs`)

Real functions take arguments. Your decorator must handle them too, otherwise it only works on argument-less functions.

```python
from functools import wraps

def log_activity(func):
    @wraps(func)
    def wrapper(*args, **kwargs):    # accept any arguments
        print(f"Calling {func.__name__}")
        result = func(*args, **kwargs)   # pass them through
        print(f"Finished calling {func.__name__}")
        return result                # return the result
    return wrapper
```

Using `*args, **kwargs` makes the decorator **universal** — it works on any function regardless of how many arguments it takes.

### Full Logging Decorator

```python
from functools import wraps

def log_activity(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        print(f"🚀 Calling {func.__name__}")
        result = func(*args, **kwargs)
        print(f"✅ Finished calling {func.__name__}")
        return result
    return wrapper

@log_activity
def brew_chai(chai_type, milk="no"):
    print(f"Brewing {chai_type} with milk: {milk}")

brew_chai("masala chai")
brew_chai("ginger chai", milk="yes")
```

Output:
```
🚀 Calling brew_chai
Brewing masala chai with milk: no
✅ Finished calling brew_chai

🚀 Calling brew_chai
Brewing ginger chai with milk: yes
✅ Finished calling brew_chai
```

The decorator keeps working even when the function gains new parameters.

---

## 13. Real-World Decorator — Role-Based Access (Auth Decorator)

A common real-world pattern in Django, FastAPI, and other frameworks.

```python
from functools import wraps

def require_admin(func):
    @wraps(func)
    def wrapper(user_role):
        if user_role != "admin":
            print("Access Denied. Admins only.")
            return None          # always explicitly return something
        return func(user_role)   # proceed if admin
    return wrapper

@require_admin
def access_tea_inventory(user_role):
    print("Access granted to tea inventory!")

access_tea_inventory("user")    # Access Denied. Admins only.
access_tea_inventory("admin")   # Access granted to tea inventory!
```

### 🎯 Why this pattern matters
- Frameworks like Django use `@login_required`, `@permission_required`, etc. — these are ALL decorators.
- The actual function (`access_tea_inventory`) doesn't care about auth — the decorator handles it.
- **Separation of concerns**: business logic stays clean, cross-cutting concerns (auth, logging) go in decorators.

---

## 14. Decorator Structure Template (memorize this)

```python
from functools import wraps

def my_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        # --- BEFORE ---
        print("before")

        # --- ORIGINAL FUNCTION ---
        result = func(*args, **kwargs)

        # --- AFTER ---
        print("after")

        return result          # always return the result
    return wrapper             # always return the wrapper
```

---

## 🎯 Master Summary

### Generators

| Concept | Key point |
|---|---|
| `yield` | Pauses + resumes function; produces one value at a time |
| Generator object | Just a reference; nothing runs until you consume it |
| `next(gen)` | Get the next value; raises `StopIteration` when exhausted |
| `for item in gen:` | Convenient way to consume all values |
| `while True + yield` | Creates an infinite generator |
| `gen.send(value)` | Sends data into the generator at the yield point |
| `yield from other()` | Delegates to another generator |
| `gen.close()` | Gracefully shuts down; triggers `GeneratorExit` |
| When to use | Large datasets, streaming, database connections, real-time feeds |

### Decorators

| Concept | Key point |
|---|---|
| Decorator | A function that wraps another function |
| `@decorator` | Syntactic sugar for `func = decorator(func)` |
| `from functools import wraps` | Always use this to preserve original function metadata |
| `@wraps(func)` | Fixes `__name__`, `__doc__` being replaced by wrapper's |
| `*args, **kwargs` in wrapper | Makes decorator work with any function signature |
| `return result` | Always return the result inside the wrapper |
| `return wrapper` | Always return the wrapper from the decorator |
| Common use cases | Logging, auth/permissions, timing, caching, rate-limiting |

---

## 🔑 Key Learnings

**Generators:**
1. Generators use `yield` instead of `return` — this is what makes them generators.
2. A generator object is just a **reference** — nothing runs until you call `next()`.
3. `yield` **pauses** the function, preserving all its state. `next()` **resumes** from exactly where it stopped.
4. Once all values are yielded, `next()` raises `StopIteration`.
5. `for` loops handle `StopIteration` automatically.
6. `while True + yield` creates **infinite generators** — control how many you consume.
7. `.send()` is bidirectional — it both resumes the generator AND passes a value in.
8. Always call `next()` once before using `.send()` for the first time.
9. `yield from` delegates to another generator (cleaner than a nested loop).
10. Always `.close()` generators when done — prevents memory leaks.

**Decorators:**
1. A decorator = a function that takes a function and returns a modified function.
2. `@my_decorator` above a function is equivalent to `func = my_decorator(func)`.
3. **Always import and use `@wraps(func)`** — without it, `func.__name__` and `func.__doc__` get lost.
4. Use `*args, **kwargs` in the wrapper to make decorators work with any function.
5. **Always return the result** from the wrapper — otherwise the original function's return value is lost.
6. **Always return the wrapper** from the decorator.
7. Decorators shine for cross-cutting concerns: logging, auth, timing, caching.
8. In Django/FastAPI you'll use many built-in decorators (`@login_required`, `@app.get(...)`, etc.).

---

## 💡 Instructor's Final Thoughts

> **On generators:** "As you write more use cases — especially connecting with databases, closing database connections — generators are super useful. You'll see them a lot in FastAPI."

> **On decorators:** "There is nothing more to decorators than this — it's just a wrapper function that takes your function, executes it, and probably adds something. People spend an hour on this but the core foundation is exactly this."

---

End of Section 7 — Generators & Decorators. Next up: OOP (Object-Oriented Programming)!
