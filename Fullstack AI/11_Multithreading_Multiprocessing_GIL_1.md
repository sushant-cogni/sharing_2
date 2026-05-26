# 📘 Notes — Multithreading, Multiprocessing & GIL in Python

> **Section:** Concurrency and Parallelism
> **What you'll learn:** The difference between concurrency and parallelism, how Python's GIL works, when to use threads vs processes, locks, queues, and shared values.

---

## 1. Concurrency vs Parallelism — The Big Picture

Both let your program do "more than one thing at a time," but they work very differently.

### Concurrency — Switching Tasks Fast
> **One worker rapidly switching between tasks.**

Like chatting with a friend while making tea — you don't actually do both at the same instant; you switch quickly between them.
- **One CPU core** handles everything.
- CPU is so fast at switching that it *feels* simultaneous.
- Used when tasks have **waiting time** (I/O, network, disk).

### Parallelism — Truly At The Same Time
> **Multiple workers doing different tasks simultaneously.**

Like two friends each making their own tea — they truly work at the same instant.
- **Multiple CPU cores** are used.
- Real simultaneous execution.
- Used when each task is heavy computation (image processing, math).

### Comparison Table

| Aspect | Concurrency | Parallelism |
|---|---|---|
| Cores used | 1 | Multiple |
| Tasks at same time | Switched rapidly | Truly simultaneous |
| Best for | I/O-bound work (network, files) | CPU-bound work (math, image processing) |
| Python tool | `threading.Thread`, `asyncio` | `multiprocessing.Process`, `concurrent.futures.ProcessPoolExecutor` |

### 🎯 Common misconception
> "Parallelism is always better than concurrency."
> **NO.** Each has its place. Parallelism has overhead (memory not shared, must wait for ALL workers). If one worker is slow, the whole result is delayed.

---

## 2. Python's Concurrency Toolbox

| Module / Class | Used for |
|---|---|
| `threading.Thread` | Concurrency (single-core, multi-thread) |
| `asyncio` | Concurrency (cooperative, single-thread) |
| `multiprocessing.Process` | Parallelism (multi-core) |
| `concurrent.futures.ProcessPoolExecutor` | Parallelism with thread/process pools |

---

# 🧵 PART A — THREADING (Concurrency)

---

## 3. Your First Threading Example

```python
import threading
import time

def take_orders():
    for i in range(1, 4):
        print(f"Taking order for #{i}")
        time.sleep(2)

def brew_chai():
    for i in range(1, 4):
        print(f"Brewing chai for #{i}")
        time.sleep(3)

# Create 2 threads
order_thread = threading.Thread(target=take_orders)
brew_thread = threading.Thread(target=brew_chai)

# Start them
order_thread.start()
brew_thread.start()

# Wait for them to finish
order_thread.join()
brew_thread.join()

print("All orders taken and chai brewed!")
```

### Key methods

| Method | What it does |
|---|---|
| `threading.Thread(target=func)` | Create a thread that will run `func` |
| `t.start()` | Start the thread |
| `t.join()` | Wait for the thread to finish before continuing |

### 🎯 Important note
Creating a thread alone doesn't run anything — you must call `.start()`. To make the program wait until threads finish, call `.join()`.

---

## 4. Passing Arguments to a Thread

```python
def prepare_chai(type_, wait_time):
    print(f"{type_} chai brewing...")
    time.sleep(wait_time)
    print(f"{type_} chai is ready!")

# Pass args as a tuple
t1 = threading.Thread(target=prepare_chai, args=("masala", 2))
t2 = threading.Thread(target=prepare_chai, args=("ginger", 3))

t1.start()
t2.start()
t1.join()
t2.join()
```

### ⚠️ `args` must be a **tuple**
Even for one argument:
```python
threading.Thread(target=fn, args=(value,))   # note the trailing comma
```

---

# 🔐 PART B — THE GLOBAL INTERPRETER LOCK (GIL)

---

## 5. What is the GIL?

> **GIL = Global Interpreter Lock**
> A mutex (mutual exclusion lock) that ensures **only one thread can execute Python code at a time**, even if you have multiple threads.

### Why does it exist?
Python's memory management is **not thread-safe**. If two threads tried to modify the same object simultaneously, you'd get **race conditions** and corruption.

The GIL prevents this by giving only one thread access to memory at a time — like a single counter at a chai shop where only one barista can take an order at any moment.

### Visual

```
Memory location with value = 4
        │
   ┌────┴────┐
   ▼         ▼
Thread 1   Thread 2
(wants 5) (wants 3)
       \   /
        GIL
   "Only one of you, please."
```

### 🎯 Real-world analogy
A chai counter — no matter how many baristas you have, only **one order** can be processed at the counter at the same time.

---

## 6. GIL in Action — Threading is SLOW for CPU-bound Work

```python
import threading
import time

def brew_chai():
    name = threading.current_thread().name
    print(f"{name} started brewing...")
    count = 0
    for _ in range(10**7):    # CPU-heavy work
        count += 1
    print(f"{name} finished brewing")

t1 = threading.Thread(target=brew_chai, name="Barista-1")
t2 = threading.Thread(target=brew_chai, name="Barista-2")

start = time.time()
t1.start(); t2.start()
t1.join();  t2.join()
end = time.time()

print(f"Total time taken: {end - start:.2f} seconds")
```

### Output (rough)
Takes around **5+ seconds** — slow! Because both threads keep fighting for the GIL, only one runs at a time.

### 🎯 Conclusion
For **CPU-bound work**, threading does NOT speed things up due to the GIL.

---

## 7. Multiprocessing Bypasses the GIL

The same code as multiprocessing:

```python
from multiprocessing import Process
import time

def crunch_number():
    print("Started the count process...")
    count = 0
    for _ in range(10**7):
        count += 1
    print("Ended the count process")

if __name__ == "__main__":      # IMPORTANT for multiprocessing!
    start = time.time()
    p1 = Process(target=crunch_number)
    p2 = Process(target=crunch_number)
    p1.start(); p2.start()
    p1.join();  p2.join()
    end = time.time()
    print(f"Total time with multiprocessing: {end - start:.2f} seconds")
```

### Output (rough)
**~2.8 seconds** — almost half the time. Because each process has its OWN Python interpreter and GIL, they truly run in parallel.

### ⚠️ The `if __name__ == "__main__":` requirement
Multiprocessing **needs** this protection. Without it, you get:
```
RuntimeError: An attempt has been made to start a new process before
the current process has finished its bootstrap phase.
```
This wraps your entry point so processes know where to start. Threading doesn't need it; multiprocessing does.

---

# 🧵 PART C — DEEP DIVE INTO THREADS

---

## 8. When Threads ACTUALLY Shine — I/O-Bound Work

Threads are slow for CPU-bound work, but **excellent for I/O-bound work**:
- Reading/writing files (disk I/O)
- Making web requests (network I/O)
- Database queries

While one thread is **waiting** for the network/disk, another thread can start fetching — the GIL is released during these waits.

### Example: Downloading multiple images concurrently

```python
import threading
import requests
import time

def download(url):
    print(f"Starting download from {url}")
    response = requests.get(url)
    print(f"Finished downloading from {url} (size: {len(response.content)} bytes)")

urls = [
    "https://httpbin.org/image/jpeg",
    "https://httpbin.org/image/png",
    "https://httpbin.org/image/svg"
]

start = time.time()
threads = []

for url in urls:
    t = threading.Thread(target=download, args=(url,))
    t.start()
    threads.append(t)

for t in threads:
    t.join()

end = time.time()
print(f"All downloads done in {end - start:.2f} seconds")
```

### Why this works
Each thread waits for the server response. While waiting, the GIL is released → other threads can also start their requests. You get **real concurrency** for I/O.

### 🎯 The Rule

| Work type | Use |
|---|---|
| **I/O-bound** (network, disk, DB) | **Threading** ✅ |
| **CPU-bound** (math, image processing) | **Multiprocessing** ✅ |

---

## 9. Thread Locks — Safely Modify Shared Data

When multiple threads modify the **same variable**, you can get **race conditions**. Solution: use a `Lock`.

### Example: Safe counter

```python
import threading

counter = 0
lock = threading.Lock()

def increment():
    global counter
    for _ in range(100_000):
        with lock:           # only one thread can be in here at a time
            counter += 1

threads = [threading.Thread(target=increment) for _ in range(10)]

for t in threads:
    t.start()
for t in threads:
    t.join()

print(f"Final counter: {counter}")
```

### What `with lock:` does
1. Acquires the lock (other threads must wait).
2. Runs the code inside.
3. Releases the lock automatically when done — even on errors.

This prevents two threads from corrupting `counter` by writing at the same instant.

### 🎯 Without a lock
Two threads might both read `counter = 5`, both add 1, both write `6` — you "lose" one increment. Multiplied by 100,000 iterations × 10 threads, errors add up.

### 💡 Note
Python's GIL sometimes "protects" you accidentally, so the bug may not always show. But **always use locks** for shared data — don't rely on luck.

---

# ⚙️ PART D — DEEP DIVE INTO PROCESSES

---

## 10. Why Processes? The Memory Problem

Each process has its **own memory** — they cannot share variables like threads can.

```
THREADS:           PROCESSES:
[Shared Memory]    [Memory P1] [Memory P2] [Memory P3]
   |   |   |          |          |          |
  T1  T2  T3          P1         P2         P3
                  (isolated)  (isolated)  (isolated)
```

So how do processes share data? Through special tools: **Queue** and **Value** (and others).

---

## 11. The `Queue` — Sharing Data Between Processes

A `Queue` is a thread-and-process-safe data structure for sharing information.

```python
from multiprocessing import Process, Queue

def prepare_chai(q):
    q.put("Masala chai is ready")    # put data into the queue

if __name__ == "__main__":
    q = Queue()
    p = Process(target=prepare_chai, args=(q,))
    p.start()
    p.join()
    print(q.get())     # get data from the queue
```

### Common Queue methods

| Method | What it does |
|---|---|
| `q.put(item)` | Add an item to the queue |
| `q.get()` | Remove and return an item |
| `q.empty()` | Check if queue is empty |
| `q.full()` | Check if queue is full |

You can put any data type in: dictionaries, lists, strings, numbers.

---

## 12. Shared `Value` — Lightweight Shared State

For sharing a single value (number, char, etc.) between processes, use `Value`.

```python
from multiprocessing import Process, Value

def increment(counter):
    for _ in range(100_000):
        with counter.get_lock():    # built-in lock for safety
            counter.value += 1

if __name__ == "__main__":
    counter = Value("i", 0)         # "i" = integer type, 0 = initial value
    processes = [Process(target=increment, args=(counter,)) for _ in range(4)]

    for p in processes:
        p.start()
    for p in processes:
        p.join()

    print(f"Final counter value: {counter.value}")    # 400_000
```

### Notes
- `Value("i", 0)` — `"i"` means integer type, `0` is initial value.
- `.value` is how you access/modify the actual data.
- `.get_lock()` returns a built-in lock — no need to create one manually.

### Other typecodes for Value
| Code | Type |
|---|---|
| `"i"` | int |
| `"d"` | double (float) |
| `"f"` | float |
| `"b"` | byte |
| `"c"` | char |

---

## 13. Other Shared State Tools (in `multiprocessing`)

Quick mention of what else is available:
- `Array` — like a list with shared memory
- `Pipe` — two-way communication between processes
- `Manager` — for complex shared objects (dicts, lists)
- `Pool` — pool of worker processes
- `Lock`, `Semaphore`, `Condition` — synchronization

You don't need them all — pick what fits your problem.

---

## 14. Threading vs Multiprocessing — Decision Guide

| Question | Answer | Use |
|---|---|---|
| Is the work I/O-bound (waiting on network/disk)? | Yes | **Threading** |
| Is the work CPU-bound (heavy math/computation)? | Yes | **Multiprocessing** |
| Need to share data easily? | Yes | **Threading** (shared memory) |
| Need true parallelism on multi-core CPU? | Yes | **Multiprocessing** |
| Need lightweight (less memory overhead)? | Yes | **Threading** |
| Working with frameworks like FastAPI? | Yes | Often **asyncio** (next section) |

---

## 15. Common Pitfalls and Best Practices

### ⚠️ Threading pitfalls
1. **Don't expect speedup for CPU-bound work** — GIL prevents it.
2. **Race conditions** — always use locks for shared mutable state.
3. **Deadlock** — two threads waiting for each other's locks. Be careful.

### ⚠️ Multiprocessing pitfalls
1. **`if __name__ == "__main__":` is mandatory** — otherwise you'll see bootstrap errors.
2. **Higher memory cost** — each process has its own Python interpreter.
3. **Slower to start** — process creation has overhead.
4. **Sharing data is harder** — use Queue, Value, etc.
5. **All workers must finish** before you can use the result — slowest worker delays everyone.

---

## 🎯 Master Summary

### Concurrency vs Parallelism

| | Concurrency | Parallelism |
|---|---|---|
| How | Rapidly switching tasks | Truly running tasks at the same time |
| Cores | 1 | Many |
| Best for | I/O-bound | CPU-bound |
| Python tool | `threading`, `asyncio` | `multiprocessing` |

### Threading

| Method | Purpose |
|---|---|
| `threading.Thread(target=f, args=(...,))` | Create a thread |
| `t.start()` | Start the thread |
| `t.join()` | Wait for it to finish |
| `threading.Lock()` | Create a lock for safe shared data |
| `with lock:` | Acquire & release lock automatically |

### Multiprocessing

| Method | Purpose |
|---|---|
| `Process(target=f, args=(...,))` | Create a process |
| `p.start()` | Start it |
| `p.join()` | Wait for finish |
| `Queue()` | Share data between processes |
| `Value("i", 0)` | Share a single value with built-in lock |
| `if __name__ == "__main__":` | Required entry-point guard |

---

## 🔑 Key Learnings

1. **Concurrency ≠ Parallelism.** Concurrency = task switching on 1 core. Parallelism = real simultaneous execution on multiple cores.
2. **The GIL** is Python's mutex that only allows one thread to execute Python bytecode at a time.
3. The GIL exists for **thread safety** — prevents memory corruption.
4. **Threading is great for I/O-bound work** because the GIL is released while waiting for network/disk.
5. **Threading is BAD for CPU-bound work** — the GIL serializes everything.
6. **Multiprocessing bypasses the GIL** by creating separate Python processes with their own memory.
7. Always **`start()` then `join()`** for both threads and processes.
8. Multiprocessing **requires `if __name__ == "__main__":`** for entry-point protection.
9. **Use `Lock`** when multiple threads modify the same variable — `with lock:` is the cleanest syntax.
10. **Processes can't share memory** like threads can — use `Queue`, `Value`, `Array`, etc.
11. **Slowest worker delays everyone** in parallel processing — design for balance.
12. **Pass args as a tuple**, with a trailing comma if there's only one: `args=(value,)`.
13. **Image processing, ML training, big math** → use multiprocessing.
14. **Web requests, file reading, DB queries** → use threading.
15. **AsyncIO** (next section) is yet another way — single-threaded but very efficient for I/O.

---

## 💡 Instructor's Final Thoughts

> "Parallelism looks better on paper, but it's not a silver bullet. If one core gets lazy, your entire response waits. Each tool has its place."

> "Threading shines for **I/O-bound** work. Multiprocessing shines for **CPU-bound** work. **Knowing when to use which** is what separates good Python developers from average ones."

---

End of Section 10 — Multithreading, Multiprocessing & GIL. Next up: AsyncIO!
