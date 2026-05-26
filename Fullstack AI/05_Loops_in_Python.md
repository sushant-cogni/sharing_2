# 📘 Notes — Loops in Python

> **Section:** Loops
> **Style:** Mini-projects (storytelling method, same as Conditionals)
> **What you'll learn:** How to make Python do something **again and again** using `for` and `while` loops, plus useful tools like `range`, `enumerate`, `zip`, `break`, `continue`, the **walrus operator**, and clever **dictionary-based control flow**.

---

## 1. What Are Loops?

So far we made Python take **decisions** (conditionals). Now we'll make Python **repeat tasks**.

### Why repeat tasks?
- A web request returns 5 books from a database → display each one.
- Heating water → check temperature again and again until it boils.
- A queue at a tea stall → serve every customer in line.

### Two main loops in Python:
| Loop | When to use |
|---|---|
| `for` | When you know what to iterate over (list, range, string) |
| `while` | When you keep going **until a condition becomes false** |

### 🚨 One Golden Rule (Reminder)
> In Python, indexing & ranges **always start at 0** and the **end is never inclusive**.

---

# 🧪 Mini Project 1: Token Dispenser (Tea Stall Queue)

### 📋 Problem
> A tea stall owner has a digital token display. For every customer, a token number from **1 to 10** is printed and chai is served.

### 🆕 New Concept: The `for` Loop

```python
for variable in iterable:
    # do something with variable
```

### 🆕 New Concept: `range(start, stop)`

`range()` generates numbers between `start` and `stop - 1` (stop is **exclusive**).

```python
range(1, 11)   # gives 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
```

Want 1 to 10? Write `range(1, 11)` — because `11` won't be included.

### 💻 Code

```python
for token in range(1, 11):
    print(f"Serving chai to token #{token}")
```

### How it works

```
Iteration 1 → token = 1 → "Serving chai to token #1"
Iteration 2 → token = 2 → "Serving chai to token #2"
...
Iteration 10 → token = 10 → "Serving chai to token #10"
Iteration 11 → would be 11, but 11 isn't in range → STOP
```

### ⚠️ Common Mistake
Forgetting the `f` in front of the f-string:
```python
print("Serving chai to token #{token}")   # prints literal text
print(f"Serving chai to token #{token}")  # correct
```

---

# 🧪 Mini Project 2: Batch Chai Maker

### 📋 Problem
> A chai shop makes tea in batches every 15 minutes. Simulate **4 batches** using a `for` loop and `range`.

### 💻 Code

```python
for batch in range(1, 5):
    print(f"Preparing chai for batch #{batch}")
```

### Output
```
Preparing chai for batch #1
Preparing chai for batch #2
Preparing chai for batch #3
Preparing chai for batch #4
```

### 💡 Notice
`range(1, 5)` gives `1, 2, 3, 4` — 4 numbers — perfect for 4 batches.

---

# 🧪 Mini Project 3: Tea Order Queue (Looping Over a List)

### 📋 Problem
> You received a list of names for chai orders. Print "Order ready for `<name>`" for each customer.

### 🆕 New Concept: Looping Over a List

You can loop over **any iterable** — including a list of names.

### 💻 Code

```python
orders = ["Hitesh", "Aman", "Becky", "Carlos"]

for name in orders:
    print(f"Order ready for {name}")
```

### Output
```
Order ready for Hitesh
Order ready for Aman
Order ready for Becky
Order ready for Carlos
```

### 🎯 Why this is powerful
- You don't need to know **how many** items are in the list.
- It could be 4 names, 40 names, or 400 — the loop just works.

### 🆕 Term: "Iterable"
An **iterable** is anything you can loop through:
- Lists, Strings, Tuples, Sets, Dictionaries, Range objects

You'll hear this word a LOT in Python.

---

# 🧪 Mini Project 4: Tea Menu Board (with `enumerate`)

### 📋 Problem
> Create a tea menu where each item is **numbered** (1. Green Chai, 2. Lemon Chai, etc.).

### The Plain Approach (no numbering)

```python
menu = ["Green", "Lemon", "Spiced", "Mint"]
for item in menu:
    print(f"Menu item: {item}")
```

### 🆕 New Concept: `enumerate()`

`enumerate()` adds a **counter** automatically.

```python
for index, item in enumerate(some_list):
    # index is the position
    # item is the value
```

Returns tuples like `(0, "Green")`, `(1, "Lemon")` — Python **unpacks** them.

### ⭐ Start counting from 1, not 0

```python
enumerate(menu, start=1)
```

### 💻 Full Code

```python
menu = ["Green", "Lemon", "Spiced", "Mint"]

for idx, item in enumerate(menu, start=1):
    print(f"{idx}. {item} Chai")
```

### Output
```
1. Green Chai
2. Lemon Chai
3. Spiced Chai
4. Mint Chai
```

### 🎯 When to use `enumerate`
Whenever you need **both the index AND the value** while looping.

---

# 🧪 Mini Project 5: Order Summary (with `zip`)

### 📋 Problem
> Two lists: customer names and their bill amounts. Print "Name paid Amount rupees" for each customer.

### 🆕 New Concept: `zip()`

`zip()` lets you loop over **multiple iterables in parallel**.

```python
zip(names, bills)
# Returns: ("Hitesh", 50), ("Mira", 70), ("Sam", 100), ("Ali", 55)
```

### 💻 Full Code

```python
names = ["Hitesh", "Mira", "Sam", "Ali"]
bills = [50, 70, 100, 55]

for name, amount in zip(names, bills):
    print(f"{name} paid {amount} rupees")
```

### Output
```
Hitesh paid 50 rupees
Mira paid 70 rupees
Sam paid 100 rupees
Ali paid 55 rupees
```

### 🎯 Knowledge stacks
- Project 3 → list looping
- Project 4 → multiple variables (with enumerate)
- Project 5 → `zip` for parallel looping

### 💡 Bonus — combine `enumerate` and `zip`
```python
for idx, (name, amount) in enumerate(zip(names, bills), start=1):
    ...
```

---

# 🧪 Mini Project 6: Tea Heating Simulator (the `while` Loop)

### 📋 Problem
> Tea starts at **40°C** and boils at **100°C**. Increase the temperature by **15** until it reaches/exceeds 100.

### 🆕 New Concept: The `while` Loop

```python
while condition:
    # keep doing this as long as condition is True
```

When to use:
- `for` → known structure (list, range)
- `while` → keep going **until** something becomes true/false

### 🆕 New Concept: Compound Assignment `+=`

```python
temperature = temperature + 15
temperature += 15           # shorthand
```

Works with `-=`, `*=`, `/=` too.

### 💻 Full Code

```python
temp = 40

while temp < 100:
    print(f"Current temperature: {temp}")
    temp += 15

print("Tea is ready to be served!")
```

### Output
```
Current temperature: 40
Current temperature: 55
Current temperature: 70
Current temperature: 85
Tea is ready to be served!
```

### Order Matters! 🔑
If you put `temp += 15` BEFORE the print:
```
Current temperature: 55
Current temperature: 70
Current temperature: 85
Current temperature: 100
```

> 🎯 **Lesson:** Code runs in the order you write it.

### ⚠️ Warning: Infinite Loops
If the condition **never becomes False**, the loop runs forever.
Always change something inside the loop that affects the condition.

---

# 🧪 Mini Project 7: Out of Stock / Discontinued (`continue` and `break`)

### 📋 Problem
> Some chai flavors are out of stock — **skip** those. Some are **discontinued** — **stop the loop entirely**.

```python
flavors = ["ginger", "out of stock", "lemon", "discontinued", "tulsi"]
```

### 🆕 New Concept: `continue` vs `break`

| Keyword | What it does |
|---|---|
| **`continue`** | Skip rest of THIS iteration. Move to next. |
| **`break`** | Stop the entire loop immediately. |

### Visual

```
Iteration 1
Iteration 2 → continue → skip rest, jump to next
Iteration 3
Iteration 4 → break → exit loop entirely
Iteration 5 → never runs
```

### 💻 Full Code

```python
flavors = ["ginger", "out of stock", "lemon", "discontinued", "tulsi"]

for flavor in flavors:
    if flavor == "out of stock":
        continue
    if flavor == "discontinued":
        break
    print(f"{flavor} item found")

print("Outside of loop")
```

### Output
```
ginger item found
lemon item found
Outside of loop
```

### What happened?
- `"ginger"` → no match → prints
- `"out of stock"` → matches → `continue` → skips print
- `"lemon"` → no match → prints
- `"discontinued"` → matches → `break` → exits
- `"tulsi"` → never reached

### 🎯 Key Lesson — Reading Indentation

```python
for flavor in flavors:        # loop block
    if flavor == "...":       # inside loop
        continue              # inside if
    print(...)                # inside loop, not in if
print("Outside of loop")      # completely outside loop
```

---

# 🧪 Mini Project 8: For-Else (Surprise Topic!)

### 📋 Problem
> Find a staff member eligible to manage (age ≥ 18). If nobody is eligible → print a fallback message.

```python
staff = [("Amit", 16), ("Zara", 17), ("Raj", 15)]
```

### 🆕 New Concept: `for-else`

Yes — Python lets you put `else` on a `for` loop!

```python
for item in things:
    if condition:
        do_something()
        break
else:
    print("No match found")
```

### ⭐ The Rule
> The `else` block runs **only if the loop completed without hitting `break`**.

If `break` fires → `else` is skipped.

### Example 1 — Nobody Eligible (else runs)

```python
staff = [("Amit", 16), ("Zara", 17), ("Raj", 15)]

for name, age in staff:
    if age >= 18:
        print(f"{name} is eligible to manage the staff")
        break
else:
    print("No one is eligible to manage the staff")
```

Output:
```
No one is eligible to manage the staff
```

Loop completed without break → `else` runs.

### Example 2 — Someone IS Eligible (else does NOT run)

Flip condition to `age <= 18`:
```python
for name, age in staff:
    if age <= 18:
        print(f"{name} is eligible to manage the staff")
        break
else:
    print("No one is eligible to manage the staff")
```

Output:
```
Amit is eligible to manage the staff
```

`break` fires → `else` skipped.

### 🎯 When to use `for-else`
Use it as a **"fallback search"** pattern:
- Loop through items searching for something
- If found → do action + `break`
- If never found → `else` block runs

### ⚠️ Common Confusion
The `else` belongs to the **for**, not to any `if` inside. Indentation gives it away — `else` is at the SAME level as `for`.

---

# 🧪 Mini Project 9: The Walrus Operator `:=`

> 🟡 Not strictly about loops, but often appears in loops. Available since Python 3.8.

### Background: Statement vs Expression

| Term | Meaning | Example |
|---|---|---|
| **Statement** | Does something. Returns nothing. | `x = 5` |
| **Expression** | Evaluates to a value. | `3 + 3` → `6` |

Walrus `:=` lets you **assign AND use** a value in one expression.

### Example 1 — Without Walrus

```python
value = 13
remainder = value % 5

if remainder:
    print(f"Not divisible, remainder is {remainder}")
```

### Example 2 — With Walrus

```python
value = 13

if (remainder := value % 5):
    print(f"Not divisible, remainder is {remainder}")
```

Now `remainder` is assigned AND used inside the `if`.

### Example 3 — Walrus Inside a `while` Loop

```python
flavors = ["masala", "ginger", "lemon", "mint"]
print(f"Available flavors: {flavors}")

while (flavor := input("Choose your flavor: ").lower()) not in flavors:
    print(f"Sorry, {flavor} is not available")

print(f"You chose {flavor} chai")
```

What's happening:
- `input()` asks the user
- Walrus stores input in `flavor`
- Same line checks if `flavor` is in the list
- Not in list → loop continues
- In list → exit, use `flavor` outside

Replaces the older pattern:
```python
while True:
    flavor = input(...).lower()
    if flavor in flavors:
        break
    print("Not available")
```

### ⚠️ Use sparingly
Walrus is powerful but **confusing to new readers**. Use only when it genuinely makes code cleaner.

---

# 🧪 Mini Project 10: Dictionary Case (Real-World Coupon System)

> 🌟 Production-level pattern. Replaces long `if/elif` chains using dictionaries.

### 📋 Problem
> A list of users with totals and coupon codes. Apply the correct discount.

```python
users = [
    {"id": "1", "total": 100, "coupon": "P20"},
    {"id": "2", "total": 150, "coupon": "F10"},
    {"id": "3", "total": 80,  "coupon": "P50"},
]
```

### The Trick: Store Discount Logic in a Dictionary

Instead of:
```python
if coupon == "P20":
    ...
elif coupon == "F10":
    ...
```

Use a lookup dictionary:

```python
discounts = {
    "P20": (0.20, 0),   # 20% off, no flat
    "F10": (0.50, 0),   # 50% off, no flat
    "P50": (0.0, 10),   # no %, flat 10 rupees
}
```

Each value is a **tuple**: `(percent_off, flat_off)`.

### 🆕 Concept: `.get(key, default)` for Safety

`dict.get("key", default_value)` safely fetches a value. If the key doesn't exist → returns the default (instead of crashing).

```python
discounts.get(coupon, (0, 0))   # if not found, no discount
```

### 💻 Full Code

```python
users = [
    {"id": "1", "total": 100, "coupon": "P20"},
    {"id": "2", "total": 150, "coupon": "F10"},
    {"id": "3", "total": 80,  "coupon": "P50"},
]

discounts = {
    "P20": (0.20, 0),
    "F10": (0.50, 0),
    "P50": (0.0, 10),
}

for user in users:
    percent, fixed = discounts.get(user["coupon"], (0, 0))
    discount = user["total"] * percent + fixed
    print(
        f"User {user['id']} paid {user['total']} "
        f"and got a discount of rupees {discount} for next visit"
    )
```

### Output
```
User 1 paid 100 and got a discount of rupees 20.0 for next visit
User 2 paid 150 and got a discount of rupees 75.0 for next visit
User 3 paid 80 and got a discount of rupees 10 for next visit
```

### 🎯 Why this beats `if/elif`

| `if/elif` chain | Dictionary lookup |
|---|---|
| Add a new branch for each option | Just add a new key |
| Code grows as options grow | Code stays the same length |
| Hard to maintain | Easy to maintain |
| Hard to load from a database | Easy to load from a database |

This is **table-driven design** — how production code handles coupons, pricing tiers, role permissions, status mappings, etc.

---

## 🎯 Master Summary — All Looping Tools

| Tool | Purpose | Example |
|---|---|---|
| `for ... in ...` | Loop over an iterable | `for x in [1,2,3]:` |
| `while condition:` | Loop until False | `while temp < 100:` |
| `range(start, stop)` | Generate numbers | `range(1, 11)` |
| `enumerate(it, start=)` | Add an index counter | `for i, x in enumerate(menu, start=1):` |
| `zip(a, b)` | Loop two iterables in parallel | `for n, b in zip(names, bills):` |
| `continue` | Skip current iteration | inside loop |
| `break` | Exit the loop | inside loop |
| `for-else` | Fallback if no `break` | `for ...: else: ...` |
| `+=` | Shorthand for `x = x + value` | `temp += 15` |
| Walrus `:=` | Assign + use in one expression | `if (x := compute()):` |
| Dict lookup | Replace long if/elif chains | `discounts.get(code, default)` |

---

## 🔑 Key Learnings From This Section

1. **`for` and `while`** are the two main loops — choose based on the structure you have.
2. **`range` is non-inclusive on the right** — `range(1, 11)` gives 1 through 10.
3. **Any iterable can be looped over** — lists, strings, ranges, dicts, sets, tuples.
4. **`enumerate` for "I need the index too"**, **`zip` for "two lists in parallel"**.
5. **`continue` skips one round; `break` exits the loop entirely.**
6. **Indentation defines structure** — `else` on a `for` is at the same level as `for`.
7. **Walrus `:=`** combines assignment + expression, useful in `if`/`while` headers.
8. **Dictionary lookups beat long `if/elif` chains** in real-world code.
9. **Watch for infinite loops** — make sure something inside `while` changes the condition.
10. **Order of statements matters** — `print` before vs after `temp += 15` gives different output.

---

## 💡 Final Thought from the Instructor

> "I don't want to show you just toy applications. Sometimes it's a lot, but this is the real-world code. Once you can read and write loops with `enumerate`, `zip`, and dictionary lookups, you're writing code at a **production level** — not tutorial level."

---

End of Section 4 — Loops. Next up: Functions — packaging logic into reusable boxes!
