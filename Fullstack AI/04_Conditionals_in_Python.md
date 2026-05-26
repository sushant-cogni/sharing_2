# 📘 Notes — Conditionals in Python

> **Section:** Conditionals
> **Style:** Mini-projects (storytelling-based learning — instructor's signature method)
> **What you'll learn:** How to make Python take **decisions** based on conditions using `if`, `elif`, `else`, ternary operators, and `match-case`.

---

## 1. What Are Conditionals?

We've learned **what data types are**. From here onwards the rest of the course is about **how to process data**.

The first tool for processing → **conditionals**.

### The Simple Idea
> Programs make decisions based on conditions. The condition evaluates to **True** or **False**, and based on that, the program takes different actions.

### Tea Leaves Example 🍵

> "Do I have tea leaves at home?"

```
                 ┌──────────────────────┐
                 │ Tea leaves at home?  │
                 └──────────┬───────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
            YES                          NO
              │                           │
              ▼                           ▼
        Do nothing /              Go buy some
        Make some tea             tea leaves
```

This is the **core idea** of every conditional:
- A question that has a **True or False** answer
- Different actions depending on the answer

---

## 2. The `if` Statement — Basic Syntax

```python
if condition:
    # do something
```

### Key rules
- `if` is a **keyword** — you can't use it as a variable name.
- After the condition → **colon `:`** is mandatory.
- The code below MUST be **indented** (Python uses **4 spaces** automatically).
- The condition must evaluate to a **Boolean** (`True` or `False`).

> ⚠️ Python is **very strict about indentation**. Even one space off can cause errors or wrong behavior.

---

# 🧪 Mini Project 1: Smart Kettle Notification

### 📋 Problem Statement
> Create a notification system for a smart kettle. It should remind the user **only when the kettle has finished boiling**.

**Task:**
- A variable `kettle_boiled = True`
- If boiled → show `"Kettle done! Time to make chai"`

### 💻 Code

```python
kettle_boiled = True

if kettle_boiled:
    print("Kettle done! Time to make chai")
```

### What happens
- When `kettle_boiled = True` → prints the message.
- When `kettle_boiled = False` → does nothing (no `else` block, so nothing happens).

### 💡 Naming tip
You'll often see variables like `is_kettle_boiled` instead of `kettle_boiled`. Adding `is_` makes it obvious it holds a True/False value. **Good variable names = Rule #1 of writing clean Python.**

---

# 🧪 Mini Project 2: Snack Suggestion System

### 📋 Problem Statement
> A local cafe wants a program that suggests a snack.
> - If user asks for **cookies** or **samosa** → confirm the order.
> - Otherwise → say "sorry, we only serve cookies or samosa".

This is actually **how recommendation systems were built before AI** — simple one-to-one mappings.

### 🆕 New Concept #1: Taking Input from the User

```python
snack = input("Enter your preferred snack: ")
```

- `input()` shows a message and **waits for the user to type something**.
- Whatever the user types gets stored in the variable.

> ⚠️ **`input()` always returns a string** — even if the user types a number, it comes as a string `"40"`, not the integer `40`.

### 🆕 New Concept #2: Normalizing Input with `.lower()`

The user might type `"Samosa"`, `"SAMOSA"`, `"sAmOsA"`. We don't want to write conditions for every variation.

```python
snack = input("Enter your preferred snack: ").lower()
```

`.lower()` converts everything to lowercase. So whether the user types `"Samosa"` or `"SAMOSA"`, the variable will always hold `"samosa"`.

### 🆕 New Concept #3: `==` vs `=`

| Operator | Meaning | Example |
|---|---|---|
| `=` | **Assignment** → puts the value on the right INTO the variable on the left | `x = 5` |
| `==` | **Comparison** → checks if two values are equal (returns True/False) | `x == 5` |

> ⚠️ Beginners often confuse these. `=` stores, `==` compares.

### 🆕 New Concept #4: Logical Operators in Conditions

You can combine conditions:
- `or` → at least one must be True
- `and` → both must be True

### 💻 Full Code

```python
snack = input("Enter your preferred snack: ").lower()
print(f"User said: {snack}")

if snack == "cookies" or snack == "samosa":
    print(f"Great choice! We'll serve you {snack}")
else:
    print("Sorry, we only serve cookies or samosa with tea.")
```

### Example runs
```
Enter your preferred snack: Burger
User said: burger
Sorry, we only serve cookies or samosa with tea.
```

```
Enter your preferred snack: SaMosA
User said: samosa
Great choice! We'll serve you samosa
```

---

# 🧪 Mini Project 3: Chai Price Calculator

### 📋 Problem Statement
> A tea stall offers different prices for different cup sizes:
> - **Small** → ₹10
> - **Medium** → ₹15
> - **Large** → ₹20
>
> Write a program that asks for the size and shows the price. If invalid → "Unknown cup size".

### 🆕 New Concept: `elif` (else if)

When you have **more than 2 conditions** to check, `if...else` isn't enough. You use `elif`.

### Syntax

```python
if condition1:
    # do this
elif condition2:
    # do this
elif condition3:
    # do this
else:
    # do this if none of the above match
```

> Python checks conditions **top to bottom** and runs the first one that matches. The rest are skipped.

### 💻 Full Code

```python
user_input_cup = input("Choose your cup size (small / medium / large): ").lower()

if user_input_cup == "small":
    print("Your price is 10 rupees")
elif user_input_cup == "medium":
    print("Your price is 15 rupees")
elif user_input_cup == "large":
    print("Your price is 20 rupees")
else:
    print("Unknown cup size")
```

### 🎯 Why this matters
Real-world problems rarely have just yes/no answers. They have **multiple paths**. `elif` is the tool for that.

---

# 🧪 Mini Project 4: Smart Thermostat Alert System

### 📋 Problem Statement
> Build a smart thermostat alert system.
> - **If** device status is **active** **AND** temperature is **above 35** → "High temperature alert!"
> - **Else** (still active, but temperature normal) → "Temperature is normal"
> - **If** device is **off** → "Device is offline"

### 🆕 New Concept: Nested `if` Statements

You can put an `if` block **inside** another `if` block. This is called **nesting**.

```
if device is active:
    if temperature > 35:
        warn
    else:
        normal
else:
    offline
```

The **indentation level** tells Python which block an `if` belongs to. Look at the indentation carefully — the inner `else` belongs to the inner `if`, the outer `else` belongs to the outer `if`.

### 🆕 New Concept: The `pass` Keyword

Sometimes you want to write the structure first, fill in the logic later. If you leave an `if` body empty, Python will throw an error.

Solution → use `pass` (means "do nothing for now"):

```python
if device_status == "active":
    pass   # I'll write this later
else:
    print("Device is offline")
```

✅ This silences the error. You can come back later to fill it in.

### 💻 Full Code

```python
device_status = "active"
temperature = 38

if device_status == "active":
    if temperature > 35:
        print("High temperature alert!")
    else:
        print("Temperature is normal")
else:
    print("Device is offline")
```

### 🔑 Reading the structure

| Level | Block | Belongs to |
|---|---|---|
| Outer `if` | Checks device status | — |
| Inner `if` | Checks temperature | Runs only when device is active |
| Inner `else` | Temperature normal | Belongs to inner `if` |
| Outer `else` | Device offline | Belongs to outer `if` |

> 💡 You can nest as many levels as you want — but deep nesting becomes hard to read. Keep it shallow when possible.

---

# 🧪 Mini Project 5: Delivery Fees Waiver (Online Tea Store)

### 📋 Problem Statement
> An online tea store: If the order amount is more than ₹300, **delivery is free**. Otherwise, it costs **₹30**.
>
> **Task:** Use a **ternary operator** to decide the delivery fees.

### 🆕 New Concept #1: Input Always Returns a String

```python
order_amount = input("Enter the order amount: ")
print(f"Order amount: {order_amount}, type: {type(order_amount)}")
```

Run this and you'll see:
```
Order amount: 40, type: <class 'str'>
```

Even though we typed a number, Python stored it as a string `"40"`. **Strings can't be compared with numbers using `>`**, so we have a problem.

### 🆕 New Concept #2: Type Casting with `int()`

To convert a string into an integer, wrap it with `int()`:

```python
order_amount = int(input("Enter the order amount: "))
```

Now `order_amount` is a real integer.

### Casting functions
| Function | Converts to |
|---|---|
| `int(x)` | Integer |
| `float(x)` | Decimal |
| `str(x)` | String |

> ⚠️ If `int()` can't convert (e.g., the user types "hitesh"), the program will **crash**. We'll learn to handle this with **error handling** later.

### 🆕 New Concept #3: The Ternary Operator

A **shortcut** for writing simple if/else in **one line**.

#### The long way (regular if/else):
```python
if order_amount > 300:
    delivery_fees = 0
else:
    delivery_fees = 30
```

#### The short way (ternary):
```python
delivery_fees = 0 if order_amount > 300 else 30
```

### Ternary syntax breakdown
```
variable = <value_if_true>  if  <condition>  else  <value_if_false>
```

Read it like English: *"delivery_fees is 0 if order_amount is greater than 300, else 30"*.

### 💻 Full Code

```python
order_amount = int(input("Enter the order amount: "))

delivery_fees = 0 if order_amount > 300 else 30

print(f"Delivery fees is: {delivery_fees}")
```

### Example runs
```
Enter the order amount: 100
Delivery fees is: 30
```
```
Enter the order amount: 400
Delivery fees is: 0
```

> 💡 Ternary is great for simple 2-choice decisions. For complex logic, stick with regular if/else.

---

# 🧪 Mini Project 6: Train Seat Information System

### 📋 Problem Statement
> Build a ticket info system for a railway app. Based on seat type, show its features:
> - **Sleeper** → No AC, beds available
> - **AC** → Air conditioned, comfy ride
> - **General** → Cheapest option, no reservation
> - **Luxury** → Premium seats with meals
> - **Anything else** → "Invalid seat type"

You could do this with `if/elif/elif/elif/else`. But there's a cleaner way → **`match-case`**.

### 🆕 New Concept: `match-case` (Pattern Matching)

When you have **many discrete values** to check against, `match-case` is more readable than long `if/elif` chains.

### Syntax

```python
match variable:
    case value1:
        # do something
    case value2:
        # do something
    case _:           # _ is the "default" case (like else)
        # do something
```

### Behind the scenes
Each `case value:` is essentially doing `variable == value`. So:
```python
case "sleeper":
```
is the same as:
```python
elif seat_type == "sleeper":
```
…but cleaner.

### The wildcard `_`
The underscore `_` is the **catch-all** case — runs when no other case matches. It's like the `else` block.

### 💻 Full Code

```python
seat_type = input(
    "Enter seat type (sleeper / ac / general / luxury): "
).lower()

match seat_type:
    case "sleeper":
        print("No AC, beds available")
    case "ac":
        print("Air conditioned, comfy ride")
    case "general":
        print("Cheapest option, no reservation")
    case "luxury":
        print("Premium seats with meals")
    case _:
        print("Invalid seat type")
```

### Example runs
```
Enter seat type: AC
Air conditioned, comfy ride
```
```
Enter seat type: bus
Invalid seat type
```

### 🎯 When to use `match-case` vs `if/elif`

| Use `if/elif` when… | Use `match-case` when… |
|---|---|
| Conditions involve **ranges** (`x > 10`, `y < 5`) | You're matching **exact values** |
| Conditions are **complex** (multiple variables) | You're matching one variable against many values |
| You have **2-3 conditions** | You have **many discrete options** |

---

## 🎯 Master Summary — All Conditional Tools

| Tool | When to use | Example |
|---|---|---|
| `if` | Single condition → maybe do something | `if x > 5: ...` |
| `if/else` | Two paths (yes/no) | `if x > 5: ... else: ...` |
| `if/elif/else` | Multiple conditions | `if .../ elif .../ else ...` |
| Nested `if` | A condition INSIDE another condition | `if active: if hot: ...` |
| Ternary | Quick 2-choice in one line | `fee = 0 if amount > 300 else 30` |
| `match/case` | Match one variable against many values | `match seat: case "ac": ...` |
| `pass` | Empty placeholder block | `if x: pass` |

---

## 🔑 Key Learnings From This Section

1. **Conditionals = decisions** — the condition evaluates to True/False.
2. **Indentation is law in Python** → use 4 spaces, stay consistent.
3. `=` assigns, `==` compares — never mix them up.
4. `input()` **always returns a string** — cast with `int()` or `float()` if you need a number.
5. **Always `.lower()` user input** when matching strings — saves you from case-sensitivity bugs.
6. Use `or` / `and` to combine conditions inside one `if`.
7. **`elif` is your friend** when you have more than 2 paths.
8. Nested `if`s let you ask deeper questions — read by indentation level.
9. **Ternary operator** = one-line if/else, great for simple value assignments.
10. **`match-case`** is cleaner than long `if/elif` chains for exact-value matching.
11. **`pass`** keeps Python happy when a block is empty.

---

## 💡 Final Thought from the Instructor

> "The best way to learn programming isn't to memorize syntax — it's to **solve real-world problems** through small projects. Each project teaches you something new that you'd never get from a syntax tutorial."

This is exactly why this section was structured as 6 mini-projects instead of dry syntax lectures.

---

✅ **End of Section 3 — Conditionals.** Next up: **Loops** — repeating actions until a condition is met!
