# 📘 Notes — Data Types in Python

> **Section:** Data Types
> **What you'll learn:** Every kind of data Python deals with (numbers, strings, lists, tuples, sets, dictionaries) and one **super important concept** behind all of them — **mutability**.

---

## 1. Why Learn Data Types?

When learning ANY programming language, you only need to learn **2 things formally**:

1. **What type is the data?** → Is it a number? A name (string)? A decimal? A collection?
2. **How to manipulate that data?** → Add numbers, change name to uppercase, validate emails, etc.

This whole section covers **type 1** (the data types) + a fantastic concept called **mutability**.

---

## 2. The Most Important Concept: "Everything is an Object" 🌟

In Python, **everything is an object**. Numbers, strings, lists — all are objects.

### Every object has 3 properties:

| Property | Meaning | Tea Analogy |
|---|---|---|
| **Identity (id)** | A unique ID given by Python (like a fingerprint) | A unique tea blend code |
| **Type** | What kind of object it is | Black tea / Green tea / Herbal tea |
| **Value** | The actual data it holds | The tea itself (`2`, `"hitesh"`, etc.) |

---

## 3. ⭐ Mutable vs Immutable — The Most Misunderstood Concept

| Term | Meaning |
|---|---|
| **Mutable** | Can be **changed** in memory |
| **Immutable** | **Cannot be changed** in memory |

### 🚨 The Golden Rule
> **Never check mutability with the VALUE. Always check with the IDENTITY (id).**

Most beginners make this mistake → they look at the value changing and assume the object is mutable. **Wrong!**

### Example: Numbers are IMMUTABLE (but seem to change)

```python
sugar_amount = 2
print(f"Initial sugar: {sugar_amount}")

sugar_amount = 12
print(f"Second initial sugar: {sugar_amount}")
```

The value changed from `2` to `12` — so it looks mutable, right?
**Wrong!** Numbers are immutable. Behind the scenes:
- Python created a fresh number `12` somewhere in memory
- Your variable `sugar_amount` is just **pointing to a different memory location** now
- The original `2` was never modified — a new `12` was created

### Proof using `id()`

```python
print(f"id of 2 = {id(2)}")
print(f"id of 12 = {id(12)}")
```

The id of `2` and the id of `12` are **completely different** → they are two separate objects in memory. The variable just changed its **reference**, not the value.

### Example: Sets are MUTABLE (truly change)

```python
spice_mix = set()
print(f"Initial Spice Mix id: {id(spice_mix)}")

spice_mix.add("ginger")
spice_mix.add("cardamom")
print(f"After adding, Spice Mix id: {id(spice_mix)}")
```

Here, the `id` stays **exactly the same** before and after adding items → meaning the same object got modified in memory. ✅ This is true mutability.

### 🎯 Summary
- **Immutable** → Same value, but if you "change" it, a NEW object is created and the variable points to it. (numbers, strings, tuples)
- **Mutable** → The same object in memory gets modified. (lists, sets, dictionaries)
- **Always verify with `id()`, not value.**

---

# Part A — Numbers in Python

Python has 4 types of numbers:

| Type | What it is | Example |
|---|---|---|
| **int** (Integer) | Whole numbers | `5`, `100`, `-42` |
| **bool** (Boolean) | Only `True` or `False` | `True`, `False` |
| **float** (Real / Floating-point) | Decimal numbers | `3.14`, `95.5` |
| **complex** | Real + imaginary part | `2 + 3j` |

---

## 4. Integers (int)

Basic arithmetic example:

```python
# Comments use # (Ctrl+/ or Cmd+/ to comment a line)
black_tea_grams = 14
ginger_grams = 3

total_grams = black_tea_grams + ginger_grams
print(f"Total grams of base tea is {total_grams}")  # 17

remaining_tea = black_tea_grams - ginger_grams
print(f"Total grams of remaining tea is {remaining_tea}")  # 11
```

### The 4 division-related operators in Python

| Operator | Name | What it does | Example |
|---|---|---|---|
| `/` | True division | Normal division (gives decimal) | `7 / 4` → `1.75` |
| `//` | Floor division | Drops the decimal part | `7 // 4` → `1` |
| `%` | Modulo | Gives the **remainder** | `10 % 3` → `1` |
| `**` | Exponent | Power | `2 ** 3` → `8` (2×2×2) |

### Examples

**True division:**
```python
milk_liters = 7
servings = 4
milk_per_serving = milk_liters / servings
print(milk_per_serving)  # 1.75
```

**Floor division** (when you don't care about decimals):
```python
total_teabags = 7
pots = 4
bags_per_pot = total_teabags // pots
print(bags_per_pot)  # 1 (instead of 1.75)
```

**Modulo** (leftover / remainder):
```python
total_cardamom_pods = 10
pods_per_cup = 3
leftover_pods = total_cardamom_pods % pods_per_cup
print(leftover_pods)  # 1 (3 cups × 3 pods = 9, leftover = 1)
```

**Exponent (power):**
```python
base_flavor_strength = 2
scale_factor = 3
powerful_flavor = base_flavor_strength ** scale_factor
print(powerful_flavor)  # 8  (2 × 2 × 2)
```

### 🎁 Bonus — Underscores in Big Numbers (for readability)

```python
total_tea_leaves = 1_000_000_000   # 1 billion
print(total_tea_leaves)            # 1000000000
```

Python ignores the underscores — they're just for **human readability**. Very Pythonic!

---

## 5. Booleans (bool)

Booleans only have **two values**:
- `True`
- `False`

### Important rule
- `True` is treated as **1**
- `False` is treated as **0**

### Upcasting (when bool becomes a number)

```python
is_boiling = True
stir_count = 5
total_actions = stir_count + is_boiling   # True becomes 1
print(f"Total actions: {total_actions}")  # 6
```

This automatic conversion is called **upcasting**.

### Converting any value to bool using `bool()`

```python
print(bool(0))         # False
print(bool(1))         # True
print(bool(11))        # True (any non-zero number is True)
print(bool("Hitesh"))  # True (any non-empty string is True)
print(bool(None))      # False
```

### Values that become `False`:
- `0`
- `None`
- Empty strings `""`
- Empty collections `[]`, `{}`, `()`

### 🎯 Logical Operators (and, or, not)

| Operator | When True | Tea analogy |
|---|---|---|
| `and` | Both must be True | "Tea **and** biscuit" → need both |
| `or` | At least one must be True | "Tea **or** coffee" → either one |
| `not` | Flips True ↔ False | Negation |

### Real-world example

```python
water_hot = True
tea_added = False

can_serve_chai = water_hot and tea_added
print(can_serve_chai)  # False (tea hasn't been added yet)
```

You'll see this everywhere: "is user logged in AND has paid AND has card info?" before allowing checkout.

---

## 6. Floats (Real / Floating-Point Numbers)

Floats are decimal numbers — used for stock prices, temperatures, money, etc.

### ⚠️ The Precision Problem

```python
ideal_temp = 95.5
current_temp = 95.49999999999999

difference = ideal_temp - current_temp
print(difference)  # NOT 0.0... gives a weird tiny value
```

Why? Computers store floats in binary, and not every decimal can be represented exactly. This is a **fundamental limitation of floats** in every language.

### See your system's float info

```python
import sys
print(sys.float_info)
```
Shows max value, max exponent, etc. (varies by system).

### For higher precision → use `Decimal` or `Fraction`

```python
from decimal import Decimal as D
from fractions import Fraction
```

These are special tools (mostly used in scientific/financial computing). You don't need them now — just know they exist.

---

## 7. Complex Numbers (briefly)

Python supports complex numbers for math/scientific use:
```python
z = 2 + 3j   # j is the imaginary unit (iota)
```
🟡 Rarely used. Skip unless you're doing scientific computing.

---

# Part B — Strings (Immutable)

> **Strings are immutable** — they cannot be changed in memory. Any "modification" creates a NEW string.

A string is anything wrapped in quotes (single or double).

```python
chai_type = "ginger chai"
customer_name = "Priya"
print(f"Order for {customer_name}: {chai_type} please!")
# Output: Order for Priya: ginger chai please!
```

---

## 8. Indexing in Strings

Each character has a position number called **index**.

> **🚨 Indexing always starts at 0 in programming.**

For the string `"aromatic and bold"`:

| Index | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Char | a | r | o | m | a | t | i | c | (space) | a | n | d | (space) | b | o | l | d |

---

## 9. Slicing in Strings

Slicing = grabbing a portion of the string.

### Syntax: `string[start : end : step]`

> **🚨 The `end` index is NOT included.** (Very important — common beginner mistake.)

```python
chai_description = "aromatic and bold"

# Get the first word "aromatic" → indices 0 to 7 (so we write 0:8)
first_word = chai_description[0:8]
print(first_word)   # "aromatic"
```

### The `step` parameter

```python
# Every 2nd character
print(chai_description[0:8:2])  # "aoai"
```

### Pythonic Shortcuts

```python
chai_description[:8]    # Same as [0:8] — start from beginning
chai_description[12:]   # From index 12 till end → "bold"
```

### 🎁 Reverse a string with `[::-1]`

```python
print(chai_description[::-1])  # "dlob dna citamora"
```

The `-1` step means "go backwards". Very popular Python trick.

---

## 10. String Encoding (UTF-8)

When dealing with non-English characters (Hindi, Japanese, Spanish accents), strings need **encoding**.

```python
label_text = "chaiè special"   # 'è' is a special character

# Encode → store as bytes safely
encoded_label = label_text.encode("utf-8")
print(encoded_label)   # b'chai\xc3\xa8 special'  (looks weird, but safe)

# Decode → convert back to readable form
decoded_label = encoded_label.decode("utf-8")
print(decoded_label)   # "chaiè special"
```

### Why this matters
- Special characters in Mandarin, Japanese, etc. can break your program if not encoded properly.
- This is rarely taught but **crucial for real-world apps** (especially web apps). Instructor learned this the hard way working with a Japanese client.

---

# Part C — Tuples (Immutable Collection)

A **tuple** = an ordered collection of items that **cannot be changed**.

Defined using **parentheses `()`**.

### Bracket vocabulary (memorize this)
| Symbol | Name |
|---|---|
| `()` | Parentheses |
| `[]` | Brackets (square brackets) |
| `{}` | Braces (curly braces) |

---

## 11. Creating and Using Tuples

```python
masala_spices = ("cardamom", "clove", "cinnamon")
```

### Tuple Unpacking

```python
spice_one, spice_two, spice_three = masala_spices
print(f"Main masala spices: {spice_one}, {spice_two}, {spice_three}")
```

⚠️ The number of variables must match the number of items.

### 🎁 Multiple Assignment (powered by tuples)

```python
ginger_ratio, cardamom_ratio = 2, 1
```

Even though this doesn't look like a tuple, **behind the scenes Python uses tuples** to make this work. That's why Python feels so magical.

### Variable Swapping (no third variable needed!)

```python
ginger_ratio, cardamom_ratio = cardamom_ratio, ginger_ratio
# Values get flipped automatically
```

In other languages you'd need a temp variable. Python uses tuples to swap in one line. 🎩✨

---

## 12. Membership Testing with `in`

Check if something exists in a tuple:

```python
print("cinnamon" in masala_spices)  # True
print("Cinnamon" in masala_spices)  # False (case-sensitive!)
print("ginger" in masala_spices)    # False (not in tuple)
```

⚠️ **Case-sensitive.** `Cinnamon` ≠ `cinnamon`.

---

# Part D — Lists (Mutable Collection)

Lists are like tuples, **but mutable** — you can add, remove, modify items freely.

Defined using **square brackets `[]`**.

> 🟡 Note: In other languages this is called **array**. In Python we call it **list**, but they're conceptually the same.

---

## 13. Creating and Modifying Lists

```python
ingredients = ["water", "milk", "black tea"]

# Add at end
ingredients.append("sugar")
# Now: ["water", "milk", "black tea", "sugar"]

# Remove a specific value
ingredients.remove("water")
# Now: ["milk", "black tea", "sugar"]

print(f"Ingredients are: {ingredients}")
```

---

## 14. Important List Methods

### `.append(item)` → adds at the end
```python
chai_ingredients = ["water", "milk"]
chai_ingredients.append("ginger")
# ["water", "milk", "ginger"]
```

### `.extend(another_list)` → combine two lists
```python
chai_ingredients = ["water", "milk"]
spice_options = ["ginger", "cardamom"]
chai_ingredients.extend(spice_options)
# ["water", "milk", "ginger", "cardamom"]
```

### `.insert(index, item)` → add at a specific position
```python
chai_ingredients.insert(2, "black tea")
# Inserts at index 2; everything else shifts right
```

### `.pop()` → removes & returns the LAST item
```python
last_added = chai_ingredients.pop()
print(last_added)   # The removed item
```
Useful when you want to remove and *use* that value.

### `.reverse()` → reverses the list in place
```python
chai_ingredients.reverse()
```
⚠️ It returns `None`. It modifies the list directly because lists are mutable.

### `.sort()` → sorts the list in place
```python
chai_ingredients.sort()  # alphabetical order
```

### `max()` and `min()` → highest / lowest value
```python
sugar_levels = [1, 2, 3, 4, 5]
print(max(sugar_levels))  # 5
print(min(sugar_levels))  # 1
```

Useful in real apps (e.g., "show product with highest price").

---

## 15. Operator Overloading on Lists 🤯

When operators (`+`, `*`) do **more than their original job**, it's called **operator overloading**.

### `+` to combine lists

```python
base_liquid = ["water", "milk"]
extra_flavor = ["ginger"]

liquid_mix = base_liquid + extra_flavor
# ["water", "milk", "ginger"]
```

The `+` here isn't doing math — it's concatenating lists. That's overloading.

### `*` to repeat lists

```python
strong_brew = ["black tea"] * 3
# ["black tea", "black tea", "black tea"]
```

What about with multiple items?

```python
strong_brew = ["black tea", "water"] * 3
# ["black tea", "water", "black tea", "water", "black tea", "water"]
```

Notice the **order is maintained** — Python repeats the entire list 3 times in sequence.

---

## 16. Bonus: `bytearray` (Rarely Used)

Used to convert a string into a sequence of bytes that can be modified.

```python
raw_spice_data = bytearray(b"cinnamon")
raw_spice_data = raw_spice_data.replace(b"cinna", b"carda")
print(raw_spice_data)   # bytearray(b'cardamon')
```

> ⚠️ When you call `.replace()` on a bytearray, it **returns a new bytearray** — you must reassign it back. (Otherwise you keep printing the original.)

🟡 Rarely used. Just be aware it exists.

---

# Part E — Sets (Mutable, Unordered, Unique)

A **set** is a collection where:
- 🚫 **No duplicates allowed** (uniqueness is the main feature)
- 🔀 **Order doesn't matter**
- ✅ **Mutable**

Defined using **curly braces `{}`** (with values inside).

---

## 17. Set Theory (Quick Math Refresher)

If we have two sets A and B that overlap:

| Operation | Symbol | Meaning | Description |
|---|---|---|---|
| **Union** | `\|` | A ∪ B | Everything from both sets (no duplicates) |
| **Intersection** | `&` | A ∩ B | Only the common items |
| **Difference** | `-` | A − B | Items in A but NOT in B |

---

## 18. Set Operations in Python

```python
essential_spices = {"cardamom", "ginger", "cinnamon"}
optional_spices = {"clove", "ginger", "black pepper"}
```

### Union — combine, removing duplicates
```python
all_spices = essential_spices | optional_spices
print(all_spices)
# {'cardamom', 'ginger', 'cinnamon', 'clove', 'black pepper'}
# Notice: ginger appears only ONCE
```

### Intersection — find common
```python
common_spices = essential_spices & optional_spices
print(common_spices)   # {'ginger'}
```

### Difference — only in essential
```python
only_in_essential = essential_spices - optional_spices
print(only_in_essential)   # {'cardamom', 'cinnamon'}
```

---

## 19. Set Membership Testing

```python
print("cloves" in essential_spices)  # False
print("ginger" in optional_spices)   # True
```

Same `in` keyword as before — case-sensitive.

---

## 20. `frozenset` (briefly)

A `frozenset` = a **set that cannot be changed** (immutable version of a set).

```python
fs = frozenset(["a", "b", "c"])
```
Use it when you want all the uniqueness benefits of a set, but make it immutable. Rarely needed.

---

# Part F — Dictionary (Mutable, Key-Value Pairs)

In a list, items are accessed by **index (0, 1, 2)**. But what if you want to access them by **name** instead?

That's exactly what a **dictionary** is — a collection of `key: value` pairs.

Defined using **curly braces `{}`** with `key: value` syntax.

---

## 21. Creating Dictionaries

### Method 1: Using `dict()` (function)
```python
chai_order = dict(type="masala chai", size="large", sugar=2)
```

### Method 2: Using `{}` (most common)
```python
chai_order = {
    "type": "masala chai",
    "size": "large",
    "sugar": 2
}
```

> Order doesn't matter — you access values by **key name**, not position.

---

## 22. Adding & Accessing Data

```python
chai_recipe = {}            # empty dictionary
chai_recipe["base"] = "black tea"
chai_recipe["liquid"] = "milk"

print(chai_recipe["base"])   # "black tea"
```

---

## 23. Deleting from a Dictionary

Use the `del` keyword:

```python
del chai_recipe["liquid"]
print(chai_recipe)   # {'base': 'black tea'}
```

---

## 24. Membership Testing

```python
print("sugar" in chai_order)   # True
```

Tests whether the **key** exists.

---

## 25. Useful Dictionary Methods

```python
chai_order = {"type": "ginger chai", "size": "medium", "sugar": 1}

# Get all keys
print(chai_order.keys())     # dict_keys(['type', 'size', 'sugar'])

# Get all values
print(chai_order.values())   # dict_values(['ginger chai', 'medium', 1])

# Get all key-value pairs (as tuples!)
print(chai_order.items())
# dict_items([('type', 'ginger chai'), ('size', 'medium'), ('sugar', 1)])
```

> 🌟 Notice `.items()` returns a list of **tuples** — each tuple is a (key, value) pair. This is one of the most-used methods.

### `.pop(key)` — remove a specific key
```python
chai_order.pop("sugar")
```

### `.popitem()` — remove the last inserted item
```python
last_item = chai_order.popitem()
```

### `.update(another_dict)` — merge dictionaries
```python
extra_spices = {"cardamom": "crushed", "ginger": "sliced"}
chai_recipe.update(extra_spices)
# chai_recipe now contains both old + new keys
```

---

## 26. ⭐ Safely Accessing with `.get()` (Avoiding Crashes)

If you try to access a key that doesn't exist with `[]`, Python **crashes**:

```python
note = chai_order["customer_note"]   # 💥 KeyError → crash!
```

**Better way — `.get()`** returns a default value instead of crashing:

```python
note = chai_order.get("customer_note", "no note")
print(f"Customer note is: {note}")    # "no note"
```

✅ Use `.get()` when the key might not exist. Saves you from crashes in real apps.

---

# Part G — Advanced Data Types (Just Awareness)

> 🟡 **Disclaimer:** These need imports and aren't for beginners. The instructor included them just so you know they exist. Come back to them after 6+ months of Python.

These are NOT built-in by default — they need to be **imported** from external modules.

### Date & Time
```python
import arrow

brewing_time = arrow.utcnow()
roman_time = brewing_time.to("Europe/Rome")
```

### Collections module
The `collections` module gives you specialized data types:

| Type | What it does |
|---|---|
| `namedtuple` | Tuples where each element has a name |
| `deque` | Double-ended queue (fast adds/removes from both ends) |
| `Counter` | Counts how many times each item appears |
| `OrderedDict` | Dictionary that remembers insertion order |
| `defaultdict` | Dictionary with default values for missing keys |
| `ChainMap` | Combine multiple dicts into one view |

### Quick `namedtuple` example
```python
from collections import namedtuple

ChaiProfile = namedtuple("ChaiProfile", ["flavor", "aroma", "color"])
profile = ChaiProfile("strong", "spicy", "brown")

print(profile.flavor)   # "strong"
```

---

## 🎯 Master Summary Table

| Type | Mutable? | Brackets | Ordered? | Duplicates? | Access by |
|---|---|---|---|---|---|
| **int / float / bool** | ❌ No | — | — | — | — |
| **string** | ❌ No | `""` or `''` | ✅ Yes | ✅ Yes | Index |
| **tuple** | ❌ No | `()` | ✅ Yes | ✅ Yes | Index |
| **list** | ✅ Yes | `[]` | ✅ Yes | ✅ Yes | Index |
| **set** | ✅ Yes | `{}` | ❌ No | ❌ No | — |
| **frozenset** | ❌ No | `frozenset()` | ❌ No | ❌ No | — |
| **dict** | ✅ Yes | `{key: value}` | ✅ Yes (3.7+) | Keys: ❌ / Values: ✅ | Key |

---

## 🎯 Quick Recap

1. **Everything in Python is an object** — it has identity, type, and value.
2. **Mutability** — always check via `id()`, never via value.
3. **Numbers, strings, tuples → immutable.**
4. **Lists, sets, dicts → mutable.**
5. **Indexing starts at 0.** End index in slicing is **exclusive**.
6. **Tuple unpacking** powers many "magic" Python features (multiple assignment, variable swapping).
7. **Sets** = unique items, no order. Great for union/intersection/difference operations.
8. **Dictionary** = access by key name (not by index). Use `.get()` to avoid crashes.
9. **Operator overloading** (`+`, `*`) works differently on different types — same symbol, different action.

---

✅ End of Section 2 — Data Types. Next up: how to manipulate data with operations, conditionals, and loops!
