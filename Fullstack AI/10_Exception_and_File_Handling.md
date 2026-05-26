# 📘 Notes — Exception Handling & File Handling in Python

> **Section:** Exception Handling + File Handling
> **Why this matters:** Real programs always have things going wrong — bad inputs, missing files, broken database connections. This section teaches you to handle these problems gracefully so your program doesn't crash.

---

# PART A — EXCEPTION HANDLING

---

## 1. What Are Exceptions?

In a real-world chai shop, things can go wrong:
- Milk spills
- Missing ingredients
- Wrong brewing steps

Same happens in code. The difference is — in code, when things go wrong, your program **crashes** by default. We don't want that. We want to **gracefully handle errors**.

> **Exception handling** = Anticipating things that can go wrong, then dealing with them so your program continues running.

---

## 2. Common Built-in Exceptions

Python has many built-in error types. You'll meet these the most:

| Exception | When it happens |
|---|---|
| **`IndexError`** | Trying to access a list index that doesn't exist |
| **`KeyError`** | A key is missing in a dictionary |
| **`ZeroDivisionError`** | Dividing by zero |
| **`TypeError`** | Incompatible types (e.g., adding string + integer) |
| **`NameError`** | Using a variable that's never been defined |
| **`ValueError`** | A function receives a correct type but wrong value |
| **`FileNotFoundError`** | Trying to open a file that doesn't exist |

### Example: IndexError

```python
orders = ["masala", "ginger"]
print(orders[2])    # IndexError: list index out of range
```

### Example: KeyError

```python
chai_menu = {"masala": 30, "ginger": 40}
print(chai_menu["elaichi"])    # KeyError: 'elaichi'
```

### 💡 Don't try to memorize them all
Nobody remembers all of them. You'll learn by reading error messages. **Python 3.10+** has greatly improved error messages — they now actively suggest fixes.

---

## 3. The `try / except` Block — Catching Errors

The basic syntax for handling exceptions:

```python
try:
    # code that might fail
    risky_operation()
except SomeError:
    # what to do if SomeError happens
    handle_it()
```

### Example

```python
chai_menu = {"masala": 30, "ginger": 40}

try:
    print(chai_menu["elaichi"])      # this will fail
except KeyError:
    print("The key you are trying to access does not exist.")

print("Hello Chai code")    # ← this line STILL runs!
```

Without `try/except`, the program would crash on line 2 and `print("Hello Chai code")` would never run.

### 🎯 Key insight
Wrap **sensitive operations** (database calls, web requests, file reads) in `try/except` because they can fail for reasons outside your control.

---

## 4. The Full Try Block — `try / except / else / finally`

```python
try:
    # risky code
except SomeError as e:
    # handle the error, 'e' holds the error object
else:
    # runs ONLY if no error happened
finally:
    # ALWAYS runs — even if there's an error
```

### Real Example

```python
def serve_chai(flavor):
    try:
        print(f"Preparing {flavor} chai...")

        if flavor == "unknown":
            raise ValueError("We don't know that flavor.")

    except ValueError as e:
        print(e)                      # prints the error message

    else:
        print(f"{flavor} chai is served")    # only if no error

    finally:
        print("Next customer, please!")      # always runs

serve_chai("masala")
serve_chai("unknown")
```

### Output
```
Preparing masala chai...
masala chai is served
Next customer, please!

Preparing unknown chai...
We don't know that flavor.
Next customer, please!
```

### 🎯 Each block's purpose

| Block | When it runs |
|---|---|
| `try` | Always runs first — contains the risky code |
| `except` | Only if the matching error was raised |
| `else` | Only if NO error occurred |
| `finally` | **Always** runs — perfect for cleanup (closing files, DB connections) |

### Common confusion ⚠️
The `else` belongs to the **`try`** — not to any `if`. Indentation confirms this (same level as `try` and `except`).

---

## 5. Handling Multiple Exceptions

You can have **multiple `except` blocks** for different errors:

```python
def process_order(item, quantity):
    try:
        menu = {"masala": 20}
        price = menu[item]
        cost = price * quantity
        print(f"Total cost is {cost}")

    except KeyError:
        print("Sorry, that chai is not on the menu.")

    except TypeError:
        print("Quantity must be a number.")


process_order("ginger", 2)       # KeyError → ginger not in menu
process_order("masala", "two")   # potential TypeError (or operator overloading!)
```

### ⚠️ Watch out for operator overloading
The string `"two"` won't cause TypeError if multiplied with an integer (`20 * "two"` gives `"twotwotwotwotwotwo..."` — string repetition). So in real code, **also validate types explicitly** with `isinstance()`.

---

## 6. Raising Your Own Errors with `raise`

You can **trigger** an error yourself when something is wrong, using the `raise` keyword.

```python
def brew_chai(flavor):
    flavors = ["masala", "ginger", "elaichi"]

    if flavor not in flavors:
        raise ValueError("Unsupported chai flavor...")

    print(f"Brewing {flavor} chai")

brew_chai("mint")    # ValueError: Unsupported chai flavor...
```

### Why raise errors?
- To enforce rules in your function (e.g., only certain flavors allowed)
- To make problems **immediately visible** rather than silently produce wrong results
- Sometimes crashing the program **is the right thing to do** (e.g., if your e-commerce site can't connect to the database, better to crash and alert devs than show broken pages)

---

## 7. Creating Custom Exception Classes

Built-in exceptions aren't always enough. You can create your **own exception class** by inheriting from `Exception`.

```python
class OutOfIngredientsError(Exception):
    pass     # nothing else needed — just inherit from Exception
```

### Using it

```python
def make_chai(milk, sugar):
    if milk == 0 or sugar == 0:
        raise OutOfIngredientsError("Missing milk or sugar!")
    print("Chai is ready...")

make_chai(0, 1)
# OutOfIngredientsError: Missing milk or sugar!
```

### 🎯 Why custom exceptions matter
- More **descriptive** — `OutOfIngredientsError` is clearer than a generic `ValueError`.
- Lets users of your code **catch specific exceptions**.
- This is exactly how frameworks like **FastAPI** and **Django** create their own error types.

### One-liner shortcut
For empty custom exceptions, you can write it on a single line:
```python
class InvalidChaiError(Exception): pass
```

---

## 8. Putting It All Together — Complete Bill App

A real-world example using everything we've learned.

```python
class InvalidChaiError(Exception): pass

def bill(flavor, cups):
    menu = {"masala": 20, "ginger": 40}

    try:
        # check 1: valid flavor
        if flavor not in menu:
            raise InvalidChaiError("That chai is not available.")

        # check 2: cups must be an integer
        if not isinstance(cups, int):
            raise TypeError("Number of cups must be an integer.")

        # calculation
        total = menu[flavor] * cups
        print(f"Your bill for {cups} cups of {flavor} chai is rupees {total}")

    except Exception as e:                # catches ANY exception
        print(f"Error: {e}")

    finally:
        print("Thank you for visiting Chai code!\n")


bill("mint", 2)         # invalid flavor
bill("masala", "three") # invalid quantity type
bill("ginger", 3)       # valid order
```

### Output
```
Error: That chai is not available.
Thank you for visiting Chai code!

Error: Number of cups must be an integer.
Thank you for visiting Chai code!

Your bill for 3 cups of ginger chai is rupees 120
Thank you for visiting Chai code!
```

### 🎯 Key patterns used here
1. **Custom exception** for domain-specific errors (`InvalidChaiError`).
2. **Multiple validation checks** using `raise`.
3. **`isinstance()`** to validate types.
4. **Catch-all `except Exception as e`** for any unexpected errors.
5. **`finally`** for the closing message — always runs.

### ⚠️ About `except Exception`
- Catches **any** exception that inherits from `Exception` (which is almost all of them).
- Convenient but **be careful** — it can hide bugs by catching errors you didn't expect.
- In production, prefer **specific exception types** for known errors and only use `Exception` as a last resort.

---

# PART B — FILE HANDLING

---

## 9. Why File Handling Matters

Python is used to work with many file types:
- PDFs, CSVs, JSONs, Excel files, text files, images, and more

Most of these need **external libraries** (Pandas for CSVs/Excel, Pillow for images, etc.). But you should still know **native file handling** because:
- It's the foundation underneath every library.
- You need to understand what can go wrong.

---

## 10. The `open()` Function

The most basic way to open a file:

```python
file = open("order.txt", "w")
```

Two arguments:
1. The **filename** (or full path)
2. The **mode**

### Common Modes

| Mode | Meaning |
|---|---|
| `"r"` | Read (default) |
| `"w"` | Write (overwrites existing content) |
| `"a"` | Append (add to the end) |
| `"x"` | Create new file (fails if it exists) |
| `"r+"` / `"w+"` | Read AND write |
| `"b"` | Binary mode (added to others like `"rb"`, `"wb"`) |

Nobody remembers all of them — `"r"`, `"w"`, `"a"` cover most cases.

---

## 11. The Problem with Plain `open()`

```python
file = open("order.txt", "w")
file.write("masala chai - 2 cups")
file.close()
```

This **works**, but it has a serious problem.

### What happens behind the scenes?
1. The file is loaded into **memory** (RAM).
2. You write to it.
3. The file is saved back to **disk**.
4. The memory is freed.

If your program **crashes between steps 2 and 4**, the file might:
- Get **corrupted**
- Stay locked in memory
- Affect other programs

You're in a **sensitive zone** — any crash here is bad.

---

## 12. Solution 1 — `try / finally` for File Handling

Wrap the risky operation in `try/finally` so the file always gets closed:

```python
try:
    file = open("order.txt", "w")
    file.write("masala chai - 2 cups")
finally:
    file.close()       # ALWAYS closes, even on error
```

The `finally` block guarantees the file is closed no matter what happens.

This works, but it's **verbose**.

---

## 13. Solution 2 — The `with` Statement (Modern, Recommended ⭐)

Python provides the `with` keyword that **automatically handles cleanup**:

```python
with open("order.txt", "w") as file:
    file.write("ginger tea - 4 cups")

# File is automatically closed here — no need to call file.close()
```

### Why this is the best way
- **No manual `close()`** — handled automatically.
- **No try/finally needed** — exception safety is built-in.
- **Cleaner, shorter, easier to read.**
- This is what every modern Python codebase uses.

---

## 14. Behind the Scenes — The Dunders `__enter__` and `__exit__`

The `with` statement works because of **two dunders** on the file object:

| Dunder | When it runs |
|---|---|
| `__enter__` | When you enter the `with` block — opens/loads the file |
| `__exit__` | When you leave the `with` block — closes the file (even on error) |

This is called the **context manager protocol** in Python. You can write your own classes that support `with` by implementing these two methods.

---

## 15. When NOT to Use Plain `open()`

For **text files** → `open()` is fine.

For everything else, use the right library:

| File type | Best library |
|---|---|
| Images | **Pillow (PIL)** |
| CSV / Excel | **Pandas** |
| PDFs | **PyPDF2**, **pdfplumber** |
| JSON | Python has a built-in `json` module |
| Binary files | Read with `"rb"` mode + appropriate library |

> Don't reinvent the wheel — pick the right tool for the job.

---

## 🎯 Master Summary

### Exception Handling

| Concept | Key idea |
|---|---|
| `try` | Wrap risky code in here |
| `except` | Handle specific errors |
| `except SomeError as e` | Get the error object as `e` |
| `else` | Runs only if no error occurred |
| `finally` | Always runs — for cleanup |
| `raise` | Trigger your own error manually |
| Custom exception | Class that inherits from `Exception` |
| `isinstance(x, int)` | Type check; works well with manual validation |
| Multiple `except` blocks | Handle different errors differently |
| `except Exception as e` | Catch-all — use sparingly |

### File Handling

| Concept | Key idea |
|---|---|
| `open(filename, mode)` | Opens a file; returns a file object |
| `"r"`, `"w"`, `"a"` | Read, write, append modes |
| `file.write(...)` | Write content to file |
| `file.read()` | Read content from file |
| `file.close()` | Free the file from memory |
| `try / finally` pattern | Old way to guarantee cleanup |
| `with open(...) as f:` | Modern way — auto-cleanup ⭐ |
| `__enter__`, `__exit__` | Dunders that power `with` |

---

## 🔑 Key Learnings

**Exception Handling:**
1. Things WILL go wrong in real code — that's normal. Plan for it.
2. `try / except` lets your program continue running after errors.
3. Always handle **specific** exceptions when possible (`KeyError`, `TypeError`), not just generic `Exception`.
4. The `finally` block is perfect for **cleanup** that must always happen.
5. The `else` block runs only when no error occurred — useful for confirmation actions.
6. **`raise` your own errors** to enforce rules in your code.
7. **Custom exception classes** make your errors more meaningful — inherit from `Exception`.
8. Sometimes **crashing IS the right answer** — better to fail fast than show broken behavior.
9. `isinstance()` is a great way to manually validate types **before** doing operations.
10. Watch out for **operator overloading** — operations may "succeed" but produce wrong results.

**File Handling:**
11. Files live on **disk**; they're loaded into **memory** when opened — this is a sensitive operation.
12. Always close files when done — leaving them open can cause corruption and memory leaks.
13. The `try/finally` pattern guarantees closing, but it's verbose.
14. **`with open(...) as f:` is the modern, recommended way** — it's automatic and safe.
15. The `with` statement works through the `__enter__` and `__exit__` dunders.
16. For non-text files (CSV, PDF, images, Excel), **use a proper library** instead of raw `open()`.

---

## 💡 Instructor's Final Thoughts

> "Crashing the program isn't always bad. If your e-commerce home page can't connect to the database, **it's better to crash now** so developers can fix it — rather than show users a broken page."

> "Beyond knowing native file handling, you should be exploring libraries like Pandas and Pillow. You know the syntax now, you know what dunders are involved, you know the gotchas. **That's enough.** The libraries do the heavy lifting."

---

End of Section 9 — Exceptions & Files. Next up: more advanced Python topics!
