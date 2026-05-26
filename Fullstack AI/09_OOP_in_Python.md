# 📘 Notes — Object-Oriented Programming (OOP) in Python

> **Section:** OOP — also called OOPS (Object Oriented Programming Systems)
> **What you'll learn:** Classes, objects, namespaces, inheritance, composition, `super()`, MRO, static methods, class methods, property decorators.

---

## 1. What is Object-Oriented Programming?

**OOP** is a **paradigm** (style of writing code) where you organize code around **objects** that have **data** (attributes) and **behavior** (methods).

### Why was it invented?
- Evolved during the C era.
- Adopted by Java, JavaScript, Kotlin, Swift, and many more.
- Most production code today is a mix of **OOP + functional programming**.

### The Core Idea — Class vs Object

A **class** is a **blueprint**. An **object** is an **actual thing** built from that blueprint.

```
   CLASS (blueprint)
        │
        ├── Object 1 (small, blue)
        ├── Object 2 (different shape, blue)
        └── Object 3 (different color, purple)
```

Each object can be different from the others — but they all come from the same class.

---

## 2. Defining Your First Class

```python
class Chai:
    pass        # does nothing, but it's a valid class

print(type(Chai))           # <class 'type'>
```

### Rules:
- `class` is a **keyword**
- Class name should start with a **capital letter** (convention)
- No parentheses needed after the name (unless inheriting)
- `:` is required
- `pass` is a placeholder when there's no body yet

### Creating an Object from a Class

```python
class Chai:
    pass

ginger_tea = Chai()    # this creates an object
print(type(ginger_tea))   # <class '__main__.Chai'>
```

### Checking an object's class with `isinstance()`

```python
print(isinstance(ginger_tea, Chai))      # True
print(isinstance(ginger_tea, ChaiTime))  # False
```

### 🌟 Important: In Python, **everything is an object** — even classes themselves.
A class is internally an object of type `class`. (Often asked in interviews.)

---

## 3. Properties (Attributes) and Namespaces

### Adding properties to a class

```python
class SimpleChai:
    origin = "India"            # class-level property

SimpleChai.is_hot = True        # you can also add properties on the fly

print(SimpleChai.origin)        # India
print(SimpleChai.is_hot)        # True
```

> 🔑 **Terminology:** When variables go *inside* a class, we call them **properties** (or **attributes**).

### Each Object Has Its Own Namespace

When you create objects from a class, **each object gets its own independent space**.

```python
class SimpleChai:
    origin = "India"
    is_hot = True

masala = SimpleChai()
print(masala.origin)       # India  (from class)
print(masala.is_hot)       # True   (from class)

# Modify a property on the object
masala.is_hot = False

print(SimpleChai.is_hot)   # True   (class unchanged)
print(masala.is_hot)       # False  (only this object changed)
```

### Key takeaway
- Changing an object's property does **NOT** affect the class.
- Each object is **its own entity** — its own namespace.
- You can even **add new properties to an object** that don't exist in the class:

```python
masala.flavor = "Masala"   # this property only exists on this object
```

---

## 4. Attribute Shadowing

> **Attribute shadowing** = An object's property "shadows" the class property. If the object's property is removed, the class property is used as a fallback.

### Example

```python
class Chai:
    temperature = "hot"
    strength = "strong"

cutting = Chai()
print(cutting.temperature)   # "hot" (from class)

cutting.temperature = "mild"
print(cutting.temperature)   # "mild" (object's own)
print(Chai.temperature)      # "hot"  (class unchanged)

# Now delete the object's property
del cutting.temperature
print(cutting.temperature)   # "hot" — FALLS BACK to class property!
```

### What if the property was never in the class?

```python
cutting.cup = "small"     # only on the object
del cutting.cup
print(cutting.cup)        # AttributeError! No fallback in the class.
```

### 🎯 Rule
- If a property exists on the object → it's used.
- If not → Python falls back to the **class property**.
- If neither exists → `AttributeError`.

---

## 5. The `self` Parameter

When you write a **method** inside a class, the first parameter is always `self`.

### `self` = a reference to "the object that's calling this method"

```python
class ChaiCup:
    size = 150

    def describe(self):                      # self is mandatory
        return f"{self.size} ml of cup chai"

cup = ChaiCup()
print(cup.describe())                        # "150 ml of cup chai"
```

### Why is `self` needed?

When you do `cup.describe()`, Python automatically passes `cup` as `self`. Inside the method, you can access the object's properties via `self.size`, `self.x`, etc.

### Without `self`, what happens?

If you call the method directly on the class:
```python
ChaiCup.describe()   # TypeError: missing 1 required positional argument: 'self'
```

You'd have to pass the object explicitly:
```python
ChaiCup.describe(cup)   # works
```

### 🔑 Method vs Function — terminology
- **Function** — defined outside a class
- **Method** — defined inside a class (gets `self` automatically when called on an object)

They behave the same. The name changes based on context.

---

## 6. The `__init__` Method — The Constructor

`__init__` is a **special method** that runs **automatically when an object is created**.

It's called the **constructor** — it "constructs" the initial state of every object.

### Syntax

```python
class ChaiOrder:
    def __init__(self, type_, size):
        self.type = type_       # creates a property using the argument
        self.size = size

    def summary(self):
        return f"{self.size}ml of {self.type} chai"

order1 = ChaiOrder("masala", 200)
order2 = ChaiOrder("ginger", 220)

print(order1.summary())   # 200ml of masala chai
print(order2.summary())   # 220ml of ginger chai
```

### How it works step-by-step

1. `ChaiOrder("masala", 200)` is called
2. Python automatically calls `__init__(self, "masala", 200)`
3. Inside `__init__`, `self.type = "masala"` and `self.size = 200`
4. The object is created with those properties

### Why `type_` with trailing underscore?
Because `type` is a built-in Python function. Using `type` as a variable name would override it. **Trailing underscore is a Python convention** to avoid clashes with reserved words.

Other examples: `class_`, `def_`, `id_`, etc.

---

## 7. Inheritance

**Inheritance** = One class **inherits** properties and methods from another class. Like a child inheriting from a parent.

### Syntax

```python
class BaseChai:
    def __init__(self, type_):
        self.type = type_

    def prepare(self):
        print(f"Preparing {self.type} chai....")

# MasalaChai inherits from BaseChai
class MasalaChai(BaseChai):
    def add_spices(self):
        print("Adding cardamom, ginger, and cloves!")
```

### Now `MasalaChai` automatically has everything from `BaseChai`:

```python
m = MasalaChai("masala")    # uses __init__ from BaseChai
m.prepare()                  # method from BaseChai
m.add_spices()              # its own method
```

### Key points
- Put the parent class **in parentheses** after the class name.
- Child class automatically gets all parent's methods and properties.
- Child can add its own methods.
- Child can override parent's methods (will see this later).

---

## 8. Composition (Less Talked About, Heavily Used)

**Composition** = Instead of inheriting from a class, you **hold a reference** to its objects inside another class.

> "Has-a" relationship vs "Is-a" relationship.
> - **Inheritance:** A MasalaChai **is a** Chai → use inheritance.
> - **Composition:** A ChaiShop **has a** chai → use composition.

### Composition Example

```python
class BaseChai:
    def __init__(self, type_):
        self.type = type_

    def prepare(self):
        print(f"Preparing {self.type} chai....")

class ChaiShop:
    chai_cls = BaseChai            # holds a reference to the class (no parentheses!)

    def __init__(self):
        self.chai = self.chai_cls("regular")   # creates an actual object

    def serve(self):
        print(f"Serving {self.chai.type} chai")
        self.chai.prepare()
```

### Key differences

| Inheritance | Composition |
|---|---|
| `class Child(Parent):` | `chai_cls = Parent` inside the class |
| Parentheses ARE used | NO parentheses (just a reference) |
| Gets ALL methods & properties | Must create an object to use them |
| "is-a" relationship | "has-a" relationship |

### Usage

```python
shop = ChaiShop()
shop.serve()
# Output:
# Serving regular chai
# Preparing regular chai....
```

### 🎯 Why care about composition?
- More flexible than inheritance.
- Avoids deep inheritance chains.
- Used heavily in production code, especially in frameworks.

---

## 9. Accessing the Base Class — 3 Ways

When a child class needs to use the parent's constructor or methods, there are 3 ways:

### Way 1 — Code Duplication (Don't do this)

```python
class Chai:
    def __init__(self, type_, strength):
        self.type = type_
        self.strength = strength

class GingerChai(Chai):
    def __init__(self, type_, strength, spice_level):
        # Copy-paste the parent's code
        self.type = type_
        self.strength = strength
        self.spice_level = spice_level
```

❌ Repetitive. If parent changes, you must update child too.

### Way 2 — Explicit Call to Parent

```python
class GingerChai(Chai):
    def __init__(self, type_, strength, spice_level):
        Chai.__init__(self, type_, strength)   # explicit call to parent's __init__
        self.spice_level = spice_level
```

✅ Works, but tightly couples the child to the parent's name.

### Way 3 — `super()` (Recommended ⭐)

```python
class GingerChai(Chai):
    def __init__(self, type_, strength, spice_level):
        super().__init__(type_, strength)   # cleanest way
        self.spice_level = spice_level
```

✅ Standard, clean, and works with multiple inheritance.

### 🎯 Always prefer `super()`.

---

## 10. Multiple Inheritance and MRO (Method Resolution Order)

A class can inherit from **multiple parent classes** by separating them with commas:

```python
class D(B, C):
    pass
```

### The Problem
When both parents have the same method, which one wins?

### Example

```python
class A:
    label = "A - Base"

class B(A):
    label = "B - Masala Blend"

class C(A):
    label = "C - Herbal Blend"

class D(B, C):
    pass

cup = D()
print(cup.label)        # "B - Masala Blend"
```

### Why B and not C?

Python uses the **MRO (Method Resolution Order)** — it checks classes from **left to right** in the inheritance list.

```python
D → B → C → A → object
```

If you swap the order to `class D(C, B)`, the result becomes `"C - Herbal Blend"`.

### See the MRO yourself

```python
print(D.__mro__)
# (<class 'D'>, <class 'B'>, <class 'C'>, <class 'A'>, <class 'object'>)
```

### 🎯 Why this matters
- Most production code only uses 1 or 2 inheritances.
- MRO becomes important when manipulating frameworks like FastAPI or SQLAlchemy internals.
- Always be aware of the **order** when using multiple inheritance.

---

## 11. Static Methods (`@staticmethod`)

A **static method** is a method that doesn't need `self` or the class — it's like a regular function, but **grouped inside a class** for organization.

### When to use
- Utility functions related to the class.
- No need to access object data or class data.

### Syntax

```python
class ChaiUtils:
    @staticmethod
    def clean_ingredients(text):
        return [item.strip() for item in text.split(",")]
```

### Calling it — no object needed!

```python
raw = " water , milk , ginger , honey "
cleaned = ChaiUtils.clean_ingredients(raw)
print(cleaned)
# ['water', 'milk', 'ginger', 'honey']
```

### 🎯 Key points
- Use the `@staticmethod` decorator.
- **No `self` parameter** in the method.
- Call it on the **class itself** — no object creation needed.
- Acts like a "utility function" that happens to live inside a class.

---

## 12. Class Methods (`@classmethod`)

A **class method** receives the **class itself** as the first argument (`cls`), not an object.

### Why use it?
- To create **alternative constructors** — different ways to build an object.
- A regular `__init__` is just one way; class methods let you have more.

### Example: 3 ways to create a ChaiOrder

```python
class ChaiOrder:
    def __init__(self, tea_type, sweetness, size):
        self.tea_type = tea_type
        self.sweetness = sweetness
        self.size = size

    # Alternative constructor #1: From a dictionary
    @classmethod
    def from_dict(cls, order_data):
        return cls(order_data["tea_type"], order_data["sweetness"], order_data["size"])

    # Alternative constructor #2: From a string
    @classmethod
    def from_string(cls, order_string):
        tea_type, sweetness, size = order_string.split("-")
        return cls(tea_type, sweetness, size)
```

### Three ways to create objects now:

```python
# Way 1: Normal constructor
order1 = ChaiOrder("masala", "medium", "large")

# Way 2: From dictionary
order2 = ChaiOrder.from_dict({"tea_type": "masala", "sweetness": "medium", "size": "large"})

# Way 3: From string
order3 = ChaiOrder.from_string("ginger-low-small")
```

### How it works
- `@classmethod` makes the method receive `cls` (the class itself) as the first argument.
- Inside, calling `cls(...)` is the same as calling the class normally (which triggers `__init__`).

---

## 13. Static Method vs Class Method — Comparison

| Feature | `@staticmethod` | `@classmethod` |
|---|---|---|
| First argument | None | `cls` (the class) |
| Access to class | ❌ No | ✅ Yes |
| Access to instance | ❌ No | ❌ No |
| Use case | Utility functions | Alternative constructors / class-level operations |
| Decorator required | `@staticmethod` | `@classmethod` |

---

## 14. The `__dict__` Dunder

Every object has a built-in `__dict__` that shows all its properties as a dictionary.

```python
order = ChaiOrder("masala", "medium", "large")
print(order.__dict__)
# {'tea_type': 'masala', 'sweetness': 'medium', 'size': 'large'}
```

Great for debugging or inspecting an object's state.

---

## 15. Property Decorators (`@property`)

### The Problem
Sometimes you want to **control** how properties are read and written — adding validation, formatting, etc.

By default, anyone can read and write any property. Users could set an age to `-10` or write garbage in.

### The Solution — Property Decorators

```python
class TeaLeaf:
    def __init__(self, age):
        self._age = age          # underscore = "this is special, don't touch directly"

    @property
    def age(self):               # GETTER — controls how value is READ
        return self._age + 2     # adds 2 for some reason

    @age.setter
    def age(self, age):          # SETTER — controls how value is WRITTEN
        if 1 <= age <= 5:
            self._age = age
        else:
            raise ValueError("Tea leaf age must be between 1 and 5 years")
```

### Usage

```python
leaf = TeaLeaf(2)
print(leaf.age)        # 4   (getter adds 2)

leaf.age = 4           # uses setter — valid, accepts
print(leaf.age)        # 6

leaf.age = 6           # ValueError! Setter rejected
```

### 🔑 Key points
1. **Underscore prefix** (`_age`) is a Python convention meaning "this is internal, access via property."
2. `@property` makes a method behave like a property — you access it without parentheses.
3. `@age.setter` lets you control how the value is set (validation, transformation).
4. Method name must **exactly match** the property name.
5. Used heavily in production for **encapsulation** and **data validation**.

### Terminology
- The `@property` method = **getter**
- The `@age.setter` method = **setter**

---

## 🎯 Master Summary — OOP Concepts

| Concept | Key idea |
|---|---|
| **Class** | A blueprint for creating objects |
| **Object** | An instance of a class — has its own namespace |
| **Properties / Attributes** | Variables inside a class/object |
| **Methods** | Functions inside a class |
| **`self`** | Reference to "the current object" — first arg of every method |
| **`__init__`** | Constructor — runs when an object is created |
| **Attribute Shadowing** | Object attributes shadow class attributes; deletion falls back |
| **Inheritance** | Child class gets parent's properties/methods (`class Child(Parent):`) |
| **Composition** | A class holds a reference to another class — "has-a" relationship |
| **`super()`** | Cleanest way to call parent class methods |
| **Multiple Inheritance** | One class inherits from multiple parents (comma-separated) |
| **MRO** | Method Resolution Order — left-to-right priority |
| **`@staticmethod`** | Method that needs no `self` or `cls` — like a regular function in a class |
| **`@classmethod`** | Method that receives `cls` — used for alternative constructors |
| **`@property`** | Make method-based access look like attribute access (getter) |
| **`@x.setter`** | Control how a property is written (setter) |
| **`__dict__`** | Dunder showing all properties of an object |

---

## 🔑 Key Learnings

1. **Everything in Python is an object** — even classes.
2. **Each object has its own namespace** — changing one doesn't affect others or the class.
3. **`self` is mandatory** in every method — it represents the current object.
4. **`__init__`** runs automatically when an object is created.
5. **Inheritance with `()`** — composition WITHOUT parentheses.
6. **Always use `super()`** to call parent class methods/constructors.
7. **MRO matters** when there's diamond inheritance — order is left to right.
8. **`@staticmethod`** = utility function inside a class. No `self`, no `cls`.
9. **`@classmethod`** = alternative constructor. Receives `cls`.
10. **`@property` + `@x.setter`** = controlled access with validation.
11. **Single underscore** (`_age`) is a convention saying "treat me as private — access via property."
12. **Trailing underscore** (`type_`) avoids clashing with Python built-ins.
13. **Avoid code duplication** — use `super()` instead of copying parent's logic.
14. **Composition is often better than inheritance** — used in real production frameworks.
15. **OOP is one paradigm**, not the only one. Modern code blends OOP + functional.

---

## 💡 Instructor's Final Thoughts

> "Inheritance is taught everywhere. **Composition is rare** in video courses but used quite a lot in production. I brought it up for you."

> "MRO is usually an advanced topic. **Nobody covers it** until you mess with internals of FastAPI or SQLAlchemy. But here we cover it because our foundation must be strong."

> "Property decorators look fancy but are simple — they're a **secret handshake in the Python world**: underscore means 'use getters and setters.'"

---

End of Section 8 — OOP. Next up: Errors and Exception Handling!
