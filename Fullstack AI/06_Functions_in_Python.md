# 📘 Notes — Functions in Python

> **Section:** Functions
> **What you'll learn:** Why functions exist, how to write them, scopes, parameters vs arguments, return values, types of functions, built-ins, and imports.

---

## 1. What is a Function?

A **function** is a **wrapper** — it wraps a block of code and makes it **reusable**.

Other names you'll hear: functions, methods, procedures. Same concept, name sometimes changes based on where it's defined.

### Why create functions? — 5 Reasons (one per mini-project)

1. **Reduce code duplication** — write once, use many times
2. **Split complex tasks** — break big jobs into small named pieces
3. **Hide implementation detail** — separation of concerns
4. **Improve readability** — self-explaining code
5. **Improve traceability** — fix bugs in one place, not everywhere

---

## 2. Defining a Function — Basic Syntax

```python
def function_name(parameter1, parameter2):
    # body
    # do something
```

- `def` → keyword (like `if`, `for`, `while`)
- After function name → `()` then `:` (mandatory)
- Body is **indented** (4 spaces)
- **Call** the function to actually run it

```python
def greet():
    print("Hello!")

greet()   # calling it
```

### ⭐ Parameters vs Arguments — Important terminology

| Term | Where | Meaning |
|---|---|---|
| **Parameter** | Inside `def func(param):` | A placeholder in the definition |
| **Argument** | Inside `func(value)` | The actual value you pass when calling |

```python
def print_order(name, chai_type):   # name, chai_type are PARAMETERS
    print(f"{name} ordered {chai_type} chai!")

print_order("Aman", "masala")       # "Aman", "masala" are ARGUMENTS
```

---

# 🧪 Mini Project 1: Reduce Code Duplication

### 📋 Problem
> A busy tea stall receives many orders. Print each customer's name and chai type. Write a function `print_order` — call it multiple times for different customers.

### Without a function (repeated code)
```python
print("Aman ordered masala chai!")
print("Hitesh ordered ginger chai!")
print("Jia ordered tulsi chai!")
```

If you want to change the message format, you have to edit **every single line**.

### With a function
```python
def print_order(name, chai_type):
    print(f"{name} ordered {chai_type} chai!")

print_order("Aman", "masala")
print_order("Hitesh", "ginger")
print_order("Jia", "tulsi")
```

Now if you add an `!` or change the format — you change it in **one place** and every call gets updated.

### 🎯 The key advantage
The function body could be 10, 50, or 100 lines. You still only write it once and reuse it everywhere.

---

# 🧪 Mini Project 2: Split Complex Tasks

### 📋 Problem
> Create a monthly cafe sales report. Instead of all logic in one place, break it down into: `fetch_sales`, `filter_valid_orders`, `summarize_data`, and `generate_report`.

```python
def fetch_sales():
    print("Fetching the sales data")

def filter_valid_orders():
    print("Filtering valid sales data")

def summarize_data():
    print("Summarizing sales data")

def generate_report():
    fetch_sales()
    filter_valid_orders()
    summarize_data()
    print("Report is ready!")

generate_report()   # call it here
```

### 🎯 Key Lesson
- Each function does **one job**.
- `generate_report` doesn't know *how* `fetch_sales` works — it just calls it. This is called **Separation of Concerns**.
- In teams, different developers can write different functions independently.

### ⚠️ Don't forget to call the function!
If you only write `def generate_report():` and never call it, **nothing runs**.

---

# 🧪 Mini Project 3: Hide Implementation Detail

### 📋 Problem
> Build a user registration system. Separate the concerns: get input → validate → save to DB.

```python
def get_user_input():
    print("Getting user input")

def validate_input():
    print("Validating user info")

def save_to_db():
    print("Saving to database")

def register_user():
    get_user_input()
    validate_input()
    save_to_db()
    print("User registration complete!")

register_user()
```

### 🎯 Key Lesson
You don't care *how* `validate_input()` works (maybe regex, maybe an API). You just call it. The **complexity is hidden** inside the function — this is the whole idea of abstraction.

---

# 🧪 Mini Project 4: Improve Readability (with `return`)

### 📋 Problem
> Tea stall with different cup sizes. Create `calculate_bill(cups, price_per_cup)` that **returns** the total bill.

### 🆕 New Concept: `print` vs `return`

| `print` | `return` |
|---|---|
| Shows the value on screen | Sends the value back to the caller |
| Value is gone after printing | Caller can store the value and use it |
| Inside function only | Can be caught outside |

### 💻 Code

```python
def calculate_bill(cups, price_per_cup):
    return cups * price_per_cup   # returns the value, does NOT print

# Way 1: Store in variable, then print
my_bill = calculate_bill(3, 15)
print(my_bill)          # 45

# Way 2: Use directly inside print
print(f"Order for table 2:", calculate_bill(2, 50))   # 100
```

### ⚠️ If you call a function that uses `return` but don't capture or print it:
```python
calculate_bill(3, 15)   # runs but output is lost
```

---

# 🧪 Mini Project 5: Improve Traceability

### 📋 Problem
> Your shop adds 10% VAT to every order. Compute final price for multiple orders. Tax rate should only be defined in ONE place.

```python
def add_vat(price, vat_rate):
    return price * (100 + vat_rate) / 100

orders = [100, 150, 200]

for price in orders:
    final_amount = add_vat(price, 10)
    print(f"Original: {price}, Final with VAT: {final_amount}")
```

### Output
```
Original: 100, Final with VAT: 110.0
Original: 150, Final with VAT: 165.0
Original: 200, Final with VAT: 220.0
```

### 🎯 Key Lesson
If VAT changes from 10% to 18%, you change it in **one place** (`vat_rate` argument), not in 100 different places. This is **traceability** — your logic is traceable to one function.

---

## 3. Scopes in Python (LEGB Rule)

**Scope** = where a variable is visible and accessible. Python looks for variables in this order:

```
L → Local (inside the current function)
E → Enclosing (outer function, if nested)
G → Global (top-level file)
B → Built-in (Python's reserved names like print, len)
```

This is called the **LEGB Rule** (also known as name resolution).

### Analogy: Cafe Notepads
- The owner has a **master notepad** (global scope).
- Each worker has their **own notepad** (local scope).
- Writing on a worker's notepad doesn't change the master notepad.

### 🔹 Local Scope — inside a function

```python
def serve_chai():
    chai_type = "Masala chai"       # local scope
    print(f"Inside function: {chai_type}")

chai_type = "Lemon"                 # global scope

serve_chai()
print(f"Outside function: {chai_type}")
```

Output:
```
Inside function: Masala chai
Outside function: Lemon
```

- Inside the function, `chai_type` refers to the **local** one.
- Outside, `chai_type` refers to the **global** one.
- They don't interfere.

### ⚠️ Local variable doesn't exist outside
```python
def serve_chai():
    chai_type = "Masala chai"   # only exists here

print(chai_type)   # Error! chai_type is not defined outside
```

### 🔹 Enclosing Scope — nested functions

```python
def chai_counter():
    chai_order = "Lemon"    # enclosing scope

    def order_details():
        print(f"Inner: {chai_order}")   # can access enclosing variable

    order_details()
    print(f"Outer: {chai_order}")

chai_order = "Tulsi"   # global scope
chai_counter()
print(f"Global: {chai_order}")
```

Output:
```
Inner: Lemon
Outer: Lemon
Global: Tulsi
```

Each scope is independent. The inner function can *read* variables from the enclosing scope.

### 🔹 Scope Diagram

```
+------------------------------------+
|  GLOBAL SCOPE (file level)         |
|                                    |
|   +------------------+             |
|   |  Function A      |             |
|   |  (local scope)   |             |
|   |   +-----------+  |             |
|   |   | Inner fn  |  |             |
|   |   | (local)   |  |             |
|   |   +-----------+  |             |
|   +------------------+             |
|                                    |
|   +------------------+             |
|   |  Function B      |             |
|   |  (local scope)   |             |
|   +------------------+             |
+------------------------------------+
```

Whatever is inside a function stays inside — like "whatever happens in the house stays in the house."

---

## 4. `nonlocal` and `global` Keywords

### `nonlocal` — modify a variable in the enclosing function

```python
def update_order():
    chai_type = "Elaichi"          # enclosing variable

    def kitchen():
        nonlocal chai_type         # tells Python: access the one just above
        chai_type = "Kesar"        # now modifies the enclosing one

    kitchen()
    print(f"After kitchen update: {chai_type}")   # "Kesar"

update_order()
```

### `global` — modify a variable at the global (file) level

```python
chai_type = "plain chai"      # global

def front_desk():
    def kitchen():
        global chai_type      # access the global one
        chai_type = "Irani"   # modifies the global

    kitchen()

front_desk()
print(f"Final global chai: {chai_type}")   # "Irani"
```

### Summary table

| Keyword | Accesses what | Use when |
|---|---|---|
| (none) | Local first, then up via LEGB | Normal usage |
| `nonlocal` | The enclosing (outer) function's variable | Nested function modifying outer function variable |
| `global` | The top-level file variable | Any function modifying a global variable |

### ⚠️ Be VERY cautious with `global`

If multiple developers write functions that all touch the same global variable, they can accidentally break each other's code. Avoid `global` whenever possible — it's a last resort.

---

## 5. Parameters and Arguments — Deep Dive

### Types of arguments

#### 1. Positional Arguments
Order matters — values go in based on position.

```python
def make_chai(tea, milk, sugar):
    print(tea, milk, sugar)

make_chai("Darjeeling", "yes", "low")
# Darjeeling → tea, yes → milk, low → sugar
```

#### 2. Keyword Arguments
You name each argument — order doesn't matter.

```python
make_chai(sugar="medium", tea="green", milk="no")
# still works correctly
```

#### 3. `*args` — Variable Positional Arguments
When you don't know how many unnamed arguments will come in:

```python
def special_chai(*ingredients):
    print(ingredients)   # comes in as a TUPLE

special_chai("cinnamon", "cardamom")
# ('cinnamon', 'cardamom')
```

`*args` can be named anything — `*ingredients`, `*items` — the `*` is the magic part.

#### 4. `**kwargs` — Variable Keyword Arguments
When you don't know how many named arguments will come in:

```python
def special_chai(**extras):
    print(extras)   # comes in as a DICTIONARY

special_chai(sweetener="honey", foam="yes")
# {'sweetener': 'honey', 'foam': 'yes'}
```

`**kwargs` can be named anything — `**extras`, `**options` — the `**` is the magic part.

#### Using both together

```python
def special_chai(*ingredients, **extras):
    print(f"Ingredients: {ingredients}")
    print(f"Extras: {extras}")

special_chai("cinnamon", "cardamom", sweetener="honey", foam="yes")
```

Output:
```
Ingredients: ('cinnamon', 'cardamom')
Extras: {'sweetener': 'honey', 'foam': 'yes'}
```

### 🎯 Quick cheat sheet

| Syntax | Name | Returns |
|---|---|---|
| `def f(x, y)` | Positional params | Individual values |
| `def f(*args)` | Variable positional | Tuple |
| `def f(**kwargs)` | Variable keyword | Dictionary |
| `def f(x=5)` | Default param | Individual value (or default) |

---

## 6. Default Parameter Trap ⚠️

```python
def chai_orders(order=[]):   # WRONG! Never use mutable default
    order.append("masala chai")
    print(order)

chai_orders()   # ['masala chai']
chai_orders()   # ['masala chai', 'masala chai']   <- Bug!
```

The mutable list `[]` is created **once** when the function is defined, not each time it's called. So it keeps appending.

### Fix: Use `None` as the default

```python
def chai_orders(order=None):   # correct
    if order is None:
        order = []
    order.append("masala chai")
    print(order)

chai_orders()   # ['masala chai']
chai_orders()   # ['masala chai']   <- works correctly now
```

---

## 7. The `return` Keyword — Full Details

### What `return` can do

| Case | Code | Result |
|---|---|---|
| Return nothing | `return` or no return statement | Implicitly returns `None` |
| Return one value | `return 120` | Returns that value |
| Return multiple values | `return 100, 20` | Returns a tuple |
| Early return | `return` inside `if` | Exits function immediately |

### Case 1: Implicit `None`

```python
def idle_chaiwala():
    pass   # no return

result = idle_chaiwala()
print(result)   # None
```

### Case 2: Return one value

```python
def sold_cups():
    return 120

total = sold_cups()
print(total)   # 120
```

### Case 3: Early return (short-circuiting)

```python
def chai_status(cups_left):
    if cups_left == 0:
        return "Sorry, chai over"
    return "Chai is ready"

print(chai_status(0))   # "Sorry, chai over"
print(chai_status(5))   # "Chai is ready"
```

Once a function hits `return`, **no more code runs** in that function. Everything after the return is "dead code."

```python
def example():
    return "done"
    print("this never runs")   # greyed out / dead code
```

### Case 4: Return multiple values

```python
def chai_report():
    return 120, 30, 10   # Python packs this into a TUPLE

sold, remaining, not_paid = chai_report()   # unpack it
print(sold)       # 120
print(remaining)  # 30

# If you don't need one value, use _ (underscore)
sold, remaining, _ = chai_report()   # _ means "I don't care about this one"
```

---

## 8. Types of Functions

### 🔹 Pure Function (Recommended)
- Only uses its own input parameters.
- Does NOT touch any outside/global variable.
- Same input → always same output.

```python
total_chai = 0   # global

def pure_chai(cups):
    return cups * 10   # doesn't touch total_chai
```

### 🔹 Impure Function (Avoid)
- Modifies a global or external variable.
- Harder to debug, harder to maintain.

```python
total_chai = 0

def impure_chai(cups):
    global total_chai
    total_chai += cups   # modifies global — impure!
```

> **Rule:** Prefer pure functions. Avoid modifying global state.

---

### 🔹 Recursive Function
A function that **calls itself**. Always has a **stopping condition** (base case) to avoid infinite loop.

```python
def pour_chai(n):
    if n == 0:
        return "All cups poured"
    print(f"Remaining: {n}")
    return pour_chai(n - 1)   # calls itself with smaller n

pour_chai(3)
```

Execution trace:
```
pour_chai(3) → prints 3 → calls pour_chai(2)
    pour_chai(2) → prints 2 → calls pour_chai(1)
        pour_chai(1) → prints 1 → calls pour_chai(0)
            pour_chai(0) → returns "All cups poured"
```

Recursion is a classic technique in data structures and algorithms.

---

### 🔹 Lambda (Anonymous Function)
A function **without a name**. Written in one line. Use it once, throw it away.

```python
# Regular function
def double(x):
    return x * 2

# Same thing as lambda
double = lambda x: x * 2
```

**Syntax:**
```
lambda parameters: expression
```

### Real use case — with `filter()`

```python
chai_types = ["light", "kadak", "ginger", "kadak"]

# Keep only "kadak" teas
strong_chai = list(filter(lambda chai: chai == "kadak", chai_types))
print(strong_chai)   # ['kadak', 'kadak']

# Keep everything EXCEPT "kadak"
mild_chai = list(filter(lambda chai: chai != "kadak", chai_types))
print(mild_chai)   # ['light', 'ginger']
```

`filter()` takes: `filter(function, iterable)` — returns items where the function returns `True`.

### 🎯 When to use lambda
- You need a simple function **once**, for a short time.
- Usually passed directly into `filter()`, `map()`, `sorted()`.
- Don't use for complex logic — create a real function instead.

---

## 9. Built-in Functions and Docstrings

### Docstring — Document your function

The **very first line** of a function body can be a triple-quoted string. This is called a **docstring**.

```python
def chai_flavor(flavor="masala"):
    """
    Returns the flavor of chai.

    :param flavor: Name of the chai flavor (default: masala)
    :return: The flavor string
    """
    return flavor
```

### Accessing docstrings — "Dunder" attributes

**Dunder** = Double UNDERscore. Python adds special attributes to every function.

```python
print(chai_flavor.__doc__)    # prints the docstring
print(chai_flavor.__name__)   # prints "chai_flavor"
```

### Why docstrings matter
- Production-level code should document what each function does.
- Tools like IDEs and documentation generators read docstrings automatically.
- `help(function_name)` uses the docstring.

### `help()` built-in

```python
help(len)   # shows Python's documentation for `len`
```

### Some commonly used Python Built-ins

| Function | What it does |
|---|---|
| `print()` | Output to screen |
| `input()` | Take user input |
| `len()` | Length of an iterable |
| `range()` | Generate number sequence |
| `type()` | Get type of a value |
| `int()`, `float()`, `str()` | Type conversion |
| `min()`, `max()` | Smallest/largest |
| `sorted()` | Return sorted list |
| `filter()` | Filter by condition |
| `zip()` | Pair iterables |
| `enumerate()` | Add index counter |
| `help()` | Show documentation |

You'll discover more built-ins as you build real projects.

---

## 10. Imports — Bringing Code from Other Files

### Why imports?
You've written a perfect masala chai recipe in `masalachai.py`. You don't want to rewrite it in every new file. You **import** it.

### Three Ways to Import

#### Method 1: Import the whole module

```python
import masalachai

masalachai.brew()   # use dot notation to access methods
```

You bring the whole "recipe book" and flip through it.

#### Method 2: Named import (from ... import)

```python
from masalachai import brew

brew()   # call directly, no dot notation needed
```

You bring only the specific page you need.

#### Method 3: Import with alias

```python
from masalachai import brew as start_brewing

start_brewing()   # use your chosen name
```

### What about built-in and third-party libraries?

```python
from datetime import datetime    # built-in module
import requests                  # third-party (needs pip install)
```

### Importing from nested folders (Package imports)

If your project looks like:
```
chai_business/
    main.py
    recipes/
        flavors.py
    utils/
        discounts.py
```

From `main.py`:
```python
# Method 1: full module
import recipes.flavors
recipes.flavors.elaichi_chai()

# Method 2: named import
from recipes.flavors import ginger_chai
ginger_chai()
```

### ❌ What NOT to do: Star import

```python
from masalachai import *   # NEVER do this
```

This imports everything blindly. You don't know what's coming in, and it can overwrite your existing variables silently.

### `__init__.py` — what is it?

- In Python 2 and early Python 3, an empty `__init__.py` file inside a folder was required to make that folder a **Python package** (so you could import from it).
- In **Python 3.3+, this file is no longer required**. Python handles this automatically.
- You'll still see it in a lot of codebases because it was the standard for years.
- You can still use it if you want (it can contain initialization code), but it's no longer mandatory.

---

## 🎯 Master Summary — Functions

| Concept | What it means |
|---|---|
| `def` | Defines a function |
| Parameter | Placeholder in the definition |
| Argument | Actual value passed when calling |
| `return` | Send value back to caller |
| `None` | Returned implicitly when nothing is returned |
| Local scope | Variable only accessible inside the function |
| Enclosing scope | Outer function's variable (for nested functions) |
| Global scope | Top-level file variable |
| `nonlocal` | Modify the enclosing function's variable |
| `global` | Modify the file-level variable (use carefully) |
| `*args` | Variable number of positional arguments → tuple |
| `**kwargs` | Variable number of keyword arguments → dict |
| Default param trap | Never use mutable defaults like `[]`; use `None` |
| Pure function | Only uses own inputs; doesn't touch global state |
| Impure function | Modifies global state; avoid when possible |
| Recursive function | Calls itself; needs a stopping condition |
| Lambda | Anonymous, one-line, throwaway function |
| Docstring | First triple-quoted string in function body |
| Dunder | `__name__`, `__doc__` etc — Python's special attributes |
| `import module` | Bring in a whole module |
| `from m import f` | Named import — bring only what you need |
| `from m import f as x` | Import with alias |

---

## 🔑 Key Learnings

1. **Functions wrap code** to make it reusable and readable.
2. **`def` keyword** defines a function; calling it runs it.
3. **Parameters** are in the definition; **arguments** are what you pass.
4. **`return` sends value back**; `print` just displays it. They are NOT the same.
5. **Once a function hits `return`, it stops** — everything after is never reached.
6. **Returning multiple values** produces a tuple automatically.
7. **LEGB rule** — Python looks for variables: Local → Enclosing → Global → Built-in.
8. **`nonlocal`** for enclosing, **`global`** for file-level — both should be used carefully.
9. **Default mutable arguments are dangerous** — always use `None` as default for lists/dicts.
10. **`*args` → tuple**, **`**kwargs` → dict**.
11. **Pure functions** are safer and preferred. Avoid touching globals.
12. **Lambdas** are anonymous, one-shot functions used with `filter()`, `map()`, `sorted()`.
13. **Docstrings** are accessed via `__doc__` — write them for production code.
14. **Never use star imports** (`from x import *`).
15. **`__init__.py`** is no longer required in Python 3.3+ but you'll still see it everywhere.

---

## 💡 Final Thought from the Instructor

> "You don't realize it, but we've covered so much in-depth about functions — readability, separation of concerns, return vs print, scopes, args/kwargs, types of functions, and imports. The key to mastering functions is to use them on real problems. Every time you find yourself copying code, that's your signal to create a function."

---

End of Section 5 — Functions. Next up: Object-Oriented Programming (OOP)!
