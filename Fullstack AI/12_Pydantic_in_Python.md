# 📘 Notes — Pydantic in Python

> **Section:** Pydantic — Data Validation & Settings Management
> **What you'll learn:** Why Pydantic exists, BaseModel basics, advanced field types, validators (field + model), computed properties, nested models, recursive models, and serialization.
> **Interview-ready:** Pydantic is one of the most asked topics for backend, AI, and FastAPI roles.

---

## 1. What is Pydantic?

> **Pydantic = a Python library for data validation and settings management using Python type hints.**

### Interview-ready definition
> "Pydantic is a Python library that uses type annotations to validate data at runtime. It ensures the data flowing into your application matches the expected types and constraints, raising clear errors when validation fails."

### Other developers compare it to:
- **Zod** in the JavaScript ecosystem
- **TypeScript** of the Python ecosystem

### What does Pydantic do?
| Use case | What it does |
|---|---|
| **Data validation** | Ensures fields are the correct types (string stays string, integer stays integer) |
| **Settings management** | Loads configuration from env files, configs (common in FastAPI) |
| **Data parsing** | Converts data between formats (string ↔ int when possible) |
| **API development** | Validates incoming/outgoing API data — heavy use in FastAPI |
| **Configuration management** | Type-safe config files |
| **Data serialization** | Converts models to JSON, dictionaries |

### Why use Pydantic?
Without Pydantic, this is legal Python:
```python
name = "Hitesh"
name = 87        # Now it's an integer — no error!
```

With Pydantic, you can't accidentally change a field's type — you'll get a clear validation error.

---

## 2. Setup

```bash
# Create project folder
mkdir 14_pydantic
cd 14_pydantic

# Create virtual environment
python -m venv venv

# Activate it (Mac/Linux)
source venv/bin/activate
# Windows: venv\Scripts\activate

# Install Pydantic
pip install pydantic
```

---

## 3. Your First Pydantic Model — `BaseModel`

Every Pydantic model inherits from `BaseModel`.

```python
from pydantic import BaseModel

class User(BaseModel):
    id: int
    name: str
    is_active: bool

# Input data as a dictionary
input_data = {"id": 101, "name": "chai code", "is_active": True}

# Create a user from the data — use ** to UNPACK the dictionary
user = User(**input_data)

print(user)
# id=101 name='chai code' is_active=True
```

### 🎯 Key rules
1. **Always inherit from `BaseModel`** — this is mandatory.
2. **Use type annotations** (`int`, `str`, `bool`) — non-negotiable.
3. **Use `**` to unpack** the dictionary — don't pass it directly: `User(input_data)` won't work.

### Automatic validation
If you change `is_active: True` to `is_active: 23`:
```
ValidationError: Input should be a valid boolean,
unable to interpret input
```

### 🎯 Important: Pydantic tries to convert types
If you pass `id="101"` (string), Pydantic **converts it to int** automatically. But if you pass `id="101A"`, it can't convert → raises an error.

> "Pydantic does type coercion when possible — but only when it makes sense. Don't rely on it blindly."

---

## 4. Default Values

You can give fields default values using `=`.

```python
class Product(BaseModel):
    id: int
    name: str
    price: float
    in_stock: bool = True       # default value

# Now you don't HAVE to pass in_stock
p = Product(id=1, name="laptop", price=999.99)
# uses in_stock=True automatically
```

### Missing required fields → error
```python
Product(name="keyboard")
# ValidationError: id - Field required
# ValidationError: price - Field required
```

---

## 5. Advanced Field Types (Mixing Pydantic + `typing` module)

For complex types like lists or optional fields, you bring tools from `typing`.

```python
from pydantic import BaseModel
from typing import List, Dict, Optional

class Cart(BaseModel):
    user_id: int
    items: List[str]                  # a list of strings
    quantities: Dict[str, int]        # dict with str keys and int values

class BlogPost(BaseModel):
    title: str
    content: str
    image_url: Optional[str] = None   # optional - can be string OR None
```

### Common typing imports

| Type | Meaning |
|---|---|
| `List[str]` | A list of strings |
| `Dict[str, int]` | A dictionary with str keys, int values |
| `Optional[str]` | A string OR `None` |
| `Union[str, int]` | Either a string OR an int |

### 🎯 Interview answer
> "Pydantic models combine the validation capabilities of Pydantic with the type system from Python's built-in `typing` module. This lets you express complex schemas naturally — like `List[str]` for a list of strings or `Optional[int]` for a nullable integer."

---

## 6. The `Field()` Function — Advanced Validations

Just type annotations aren't always enough — sometimes you need more constraints (min length, max value, descriptions). That's where `Field()` comes in.

```python
from pydantic import BaseModel, Field
from typing import Optional

class Employee(BaseModel):
    id: int
    name: str = Field(
        ...,                            # ... means REQUIRED
        min_length=3,
        max_length=50,
        description="Employee name",
        example="Hitesh"
    )
    department: Optional[str] = "general"
    salary: float = Field(
        ...,
        ge=10000,                       # greater than or equal to 10000
        le=1000000,                     # less than or equal to 1,000,000
        description="Annual salary in USD"
    )
```

### Field parameters cheat sheet

| Parameter | Meaning |
|---|---|
| `...` (Ellipsis) | Required field |
| `min_length` / `max_length` | String/list length bounds |
| `gt` | Greater than |
| `ge` | Greater than or equal |
| `lt` | Less than |
| `le` | Less than or equal |
| `description` | Documentation for the field |
| `example` | Example value (for API docs) |
| `regex` / `pattern` | Regex validation |

### Real example with regex
```python
import re
from pydantic import BaseModel, Field

class User(BaseModel):
    email: str = Field(..., pattern=r"^[\w\.-]+@[\w\.-]+\.\w+$")
    phone: str = Field(..., pattern=r"^\+?[1-9]\d{1,14}$")
    age: int = Field(..., ge=0, le=150, description="Age in years")
    discount: float = Field(..., ge=0, le=100, description="Discount percentage")
```

### 🎯 Interview-ready
> "The `Field()` function gives you fine-grained control over individual fields — you can set validation constraints like `min_length`, numeric bounds (`ge`, `le`), regex patterns, and metadata like descriptions and examples. This metadata is also used by FastAPI to auto-generate API documentation."

---

## 7. Field Validators — Custom Field Validation

When `Field()` isn't enough, use `@field_validator` for custom logic.

```python
from pydantic import BaseModel, field_validator

class User(BaseModel):
    username: str

    @field_validator("username")
    def username_length(cls, v):
        if len(v) < 4:
            raise ValueError("Username must be at least 4 characters")
        return v          # ⚠️ ALWAYS return the value
```

### How it works
| Part | Meaning |
|---|---|
| `@field_validator("username")` | Decorator targeting the `username` field |
| `cls` | The class itself (like `self` for class methods) |
| `v` | The value being validated |
| `raise ValueError(...)` | How to reject invalid data |
| `return v` | **Must return** — otherwise validation chain breaks |

### Validate multiple fields with one validator
```python
@field_validator("first_name", "last_name")
def names_must_be_capitalized(cls, v):
    if not v.istitle():
        raise ValueError("Names must be capitalized")
    return v
```

### Data transformation pattern (normalizing emails)
```python
@field_validator("email")
def normalize_email(cls, v):
    return v.lower().strip()
```

---

## 8. Model Validators — Validate Across Multiple Fields

When you need to compare or validate using **multiple fields together**, use `@model_validator`.

```python
from pydantic import BaseModel, model_validator

class SignupData(BaseModel):
    password: str
    confirm_password: str

    @model_validator(mode="after")
    def passwords_match(cls, values):
        if values.password != values.confirm_password:
            raise ValueError("Passwords do not match")
        return values        # ⚠️ Must return values
```

### `mode` parameter

| Mode | When it runs |
|---|---|
| `"before"` | BEFORE field validation (raw data) |
| `"after"` | AFTER field validation (validated data) — **recommended** |

### When to use which?

| Use case | Validator type |
|---|---|
| Validate a single field's value | `@field_validator` |
| Compare two or more fields | `@model_validator` |
| Transform raw data before validation | `@field_validator(mode="before")` |
| Validate business rules across model | `@model_validator(mode="after")` |

---

## 9. Computed Properties — `@computed_field`

> Sometimes a value can be **derived** from other fields. Instead of asking the user to provide it, compute it automatically.

```python
from pydantic import BaseModel, computed_field

class Product(BaseModel):
    price: float
    quantity: int

    @computed_field
    @property
    def total_price(self) -> float:
        return self.price * self.quantity

p = Product(price=10, quantity=5)
print(p.total_price)       # 50
```

### Why both decorators?
| Decorator | Purpose |
|---|---|
| `@computed_field` | Marks this as a computed field (included in serialization) |
| `@property` | Lets you access it like an attribute (no parentheses) |

### Real-world example — hotel booking
```python
class Booking(BaseModel):
    user_id: int
    room_id: int
    nights: int = Field(..., ge=1)
    rate_per_night: float

    @computed_field
    @property
    def total_amount(self) -> float:
        return self.nights * self.rate_per_night

booking = Booking(user_id=123, room_id=456, nights=3, rate_per_night=100)
print(booking.total_amount)        # 300
print(booking.model_dump())        # includes total_amount in output
```

### 🎯 Interview-ready
> "Computed fields let me derive values from other fields in the model — like calculating `total_amount` from `nights * rate_per_night`. The `@computed_field` decorator ensures the computed value is included when serializing the model with `.model_dump()`, while `@property` provides clean attribute-style access."

---

## 10. Advanced Validation Patterns

### Pattern 1 — Validators for multiple fields
```python
@field_validator("first_name", "last_name")
def must_be_capitalized(cls, v):
    if not v.istitle():
        raise ValueError("Names must be capitalized")
    return v
```

### Pattern 2 — Data transformation (parse before validate)
```python
@field_validator("price", mode="before")
def parse_price(cls, v):
    if isinstance(v, str):
        # Convert "$4.44" to 4.44
        return float(v.replace("$", "").replace(",", ""))
    return v
```

### Pattern 3 — Cross-field validation with `model_validator`
```python
from datetime import datetime
from pydantic import BaseModel, model_validator

class DateRange(BaseModel):
    start_date: datetime
    end_date: datetime

    @model_validator(mode="after")
    def validate_date_range(cls, values):
        if values.start_date >= values.end_date:
            raise ValueError("End date must be after start date")
        return values
```

---

## 11. Nested Models

> One Pydantic model can contain another Pydantic model. This is essential for modeling real-world data.

```python
from pydantic import BaseModel

class Address(BaseModel):
    street: str
    city: str
    postal_code: str

class User(BaseModel):
    id: int
    name: str
    address: Address       # Address model nested inside User
```

### Usage — Option 1: Build objects step by step
```python
address = Address(street="123 Lane", city="Mumbai", postal_code="400001")
user = User(id=1, name="Hitesh", address=address)
```

### Usage — Option 2: Pass a dictionary
```python
user_data = {
    "id": 1,
    "name": "Hitesh",
    "address": {
        "street": "123 Lane",
        "city": "Mumbai",
        "postal_code": "400001"
    }
}
user = User(**user_data)
```

### Key advantages of nested models
- **Automatic validation** — Pydantic validates the nested model too.
- **Hierarchical data structures** map naturally.
- **Type annotations use the model class itself** as the type.

---

## 12. Recursive / Self-Referencing Models

> A model that references itself — used for tree structures like nested comments, file systems, organizational charts.

```python
from typing import List, Optional
from pydantic import BaseModel

class Comment(BaseModel):
    id: int
    content: str
    replies: Optional[List["Comment"]] = None   # references itself!

Comment.model_rebuild()    # ⚠️ Required for self-referencing models
```

### Two important things

1. **Forward reference with quotes** — use `"Comment"` (string) because the class isn't fully defined yet when the line is read.

2. **`Model.model_rebuild()`** — call this after defining the class. Without it, you'll get performance degradation.

### Example usage
```python
comment = Comment(
    id=1,
    content="First comment",
    replies=[
        Comment(
            id=2,
            content="Reply 1",
            replies=[
                Comment(id=3, content="Nested reply")
            ]
        )
    ]
)
```

### 🎯 Interview-ready
> "For self-referencing models, I use forward references (quoting the class name) because the class isn't yet defined when its own field references it. Then I call `Model.model_rebuild()` after the class definition to optimize performance and ensure Pydantic correctly resolves the reference."

---

## 13. Advanced Nested Patterns

### Pattern 1 — Optional nested models
```python
class Address(BaseModel):
    street: str
    city: str

class Company(BaseModel):
    name: str
    address: Optional[Address] = None    # company may or may not have an address

class Employee(BaseModel):
    name: str
    company: Optional[Company] = None    # employee may be a freelancer
```

### Pattern 2 — Union types (mixed data)
```python
from typing import List, Union

class TextContent(BaseModel):
    type: str = "text"
    content: str

class ImageContent(BaseModel):
    type: str = "image"
    url: str
    alt_text: str

class Article(BaseModel):
    title: str
    sections: List[Union[TextContent, ImageContent]]    # mixed list!
```

### Pattern 3 — Deeply nested structures (organization → address → city → state → country)
```python
class Country(BaseModel):
    name: str
    code: str

class State(BaseModel):
    name: str
    country: Country

class City(BaseModel):
    name: str
    state: State

class Address(BaseModel):
    street: str
    city: City
    postal_code: str

class Organization(BaseModel):
    name: str
    headquarters: Address
    branches: List[Address] = []
```

⚠️ Be careful with deep nesting — it can hurt performance and create circular reference issues.

---

## 14. Best Practices

### Model Organization
1. **Define leaf models first** — start with the innermost models (e.g., `Country`), then build outward (`State` → `City` → `Address`).
2. **Build upward** — compose complex models from simple ones.
3. **Use clear, meaningful names** — no `A`, `B`, `C`. Naming is one of the hardest problems in programming.
4. **Group related models** in the same file.

### Performance
1. **Avoid deeply nested models** (> 4-5 levels) — they degrade performance.
2. **Be careful with recursive models** — call `model_rebuild()` and watch for memory heap issues.
3. **Watch out for circular references** — they can crash your application.
4. **Don't overuse computed fields** — they recalculate every time the model is accessed.
5. **Consider lazy loading** for expensive computations.

### Data Modeling Tips
1. **Model real-world relationships** — your models should mirror your domain.
2. **Use `Optional` appropriately** — not everything is required.
3. **Don't shy away from `Union` types** — useful for polymorphic relationships.
4. **Always validate business rules** — business logic comes before performance.
5. **Match Pydantic models to database models** when possible.

---

## 15. Serialization — Converting Models to JSON/Dict

> **Serialization** = converting complex Pydantic models into formats that are easy to **store, transmit, or process** (dictionaries, JSON strings).

### Two main methods

| Method | Output type | When to use |
|---|---|---|
| `.model_dump()` | Python dictionary | Working with data in code |
| `.model_dump_json()` | JSON string | Sending over network, saving to file |

### Example

```python
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import List

class Address(BaseModel):
    street: str
    city: str
    zip_code: str

class User(BaseModel):
    # Configure how dates are serialized
    model_config = ConfigDict(
        json_encoders={
            datetime: lambda v: v.strftime("%d-%m-%Y %H:%M:%S")
        }
    )

    id: int
    name: str
    email: str
    is_active: bool = True
    created_at: datetime
    address: Address
    tags: List[str] = []

user = User(
    id=1,
    name="Hitesh",
    email="h@hitesh.ai",
    created_at=datetime(2024, 3, 15, 14, 30),
    address=Address(street="123 Lane", city="Mumbai", zip_code="400001"),
    is_active=False,
    tags=["premium", "subscriber"]
)

# Convert to Python dictionary
py_dict = user.model_dump()
print(py_dict)
# {'id': 1, 'name': 'Hitesh', ..., 'address': {'street': '123 Lane', ...}}

# Convert to JSON string
json_string = user.model_dump_json()
print(json_string)
# '{"id": 1, "name": "Hitesh", ..., "address": {"street": "123 Lane", ...}}'
```

### Key difference

| | `.model_dump()` | `.model_dump_json()` |
|---|---|---|
| Returns | `dict` | `str` (JSON-encoded) |
| Nested models | Recursively converted to dicts | Converted to JSON objects |
| Use case | Code manipulation | Network/storage |

### ⚠️ The datetime gotcha

Without `json_encoders`, datetime fields might serialize weirdly:
```
"created_at": "2024-03-15T14:30:00"  # ISO format by default
```

With `json_encoders`, you control the format:
```
"created_at": "15-03-2024 14:30:00"
```

### `strftime` format cheat sheet

| Code | Meaning |
|---|---|
| `%Y` | 4-digit year (2024) |
| `%y` | 2-digit year (24) |
| `%m` | Month (01-12) |
| `%d` | Day (01-31) |
| `%H` | Hour 24 (00-23) |
| `%M` | Minutes (00-59) |
| `%S` | Seconds (00-59) |

### 🎯 Interview-ready
> "Pydantic offers two serialization methods: `.model_dump()` converts a model to a Python dictionary, recursively flattening nested models. `.model_dump_json()` directly produces a JSON-encoded string. For custom serialization — like formatting datetime objects — I configure the model using `ConfigDict` with `json_encoders`."

---

## 🎯 Master Summary

| Concept | Key idea |
|---|---|
| **`BaseModel`** | Every Pydantic model inherits from this |
| **Type annotations** | Define field types using Python type hints |
| **Dictionary unpacking** | Use `**dict` to initialize a model from a dict |
| **`Field()`** | Add constraints, descriptions, defaults |
| **`@field_validator`** | Custom validation for one or more fields |
| **`@model_validator`** | Validation that needs multiple fields together |
| **`@computed_field`** | Auto-calculate derived values |
| **Nested models** | Model contains another model as a field type |
| **Recursive models** | Model references itself (use forward references + `model_rebuild()`) |
| **`Optional[X]`** | Field can be `X` or `None` |
| **`Union[X, Y]`** | Field can be either type X or Y |
| **`List[X]` / `Dict[X, Y]`** | Collections of typed values |
| **`.model_dump()`** | Convert to Python dict |
| **`.model_dump_json()`** | Convert to JSON string |
| **`ConfigDict`** | Configure model behavior (e.g., custom serializers) |

---

## 🔑 Key Learnings

1. **Pydantic enforces data integrity** — what type you declare is what you get.
2. **All models inherit from `BaseModel`** — non-negotiable.
3. **Type annotations are mandatory** — use them on every field.
4. **Unpack dictionaries with `**`** when creating model instances.
5. **Pydantic does type coercion** when possible — `"101"` → `101`, but `"101A"` fails.
6. **`Field()`** adds constraints (length, range, regex, descriptions).
7. **`@field_validator`** for single-field custom validation — always `return v`.
8. **`@model_validator`** for cross-field validation — always `return values`.
9. **`mode="after"`** runs validation after field-level checks (recommended).
10. **`@computed_field` + `@property`** for derived values included in serialization.
11. **Nested models** make complex data structures clean and validated.
12. **Recursive models** need forward references (`"ClassName"`) + `model_rebuild()`.
13. **`Optional` and `Union`** from `typing` handle nullable and multi-type fields.
14. **Define leaf models first** — build complex models bottom-up.
15. **`.model_dump()`** → dict; **`.model_dump_json()`** → JSON string.
16. **Configure datetime serialization** with `ConfigDict(json_encoders={...})`.
17. **Avoid deeply nested models** (4-5 levels max) for performance.
18. **Used heavily in FastAPI** for request/response validation and auto-generated docs.

---

## 💡 Instructor's Final Thoughts

> "Pydantic is one of those libraries where the more you build real applications, the more you appreciate it. It saves you from countless bugs by catching type mismatches before they reach your business logic."

> "Reading the documentation is essential. These courses are just your starting journey — eventually you have to read the docs. Don't be afraid of that."

> "Best practice is what works for you. The principles I shared (leaf-first, clear naming, avoiding deep nesting) have worked for me — but adapt them to your context."

---

## 📌 Interview Cheat Sheet

| Question | Answer |
|---|---|
| **What is Pydantic?** | A Python library that uses type hints for runtime data validation and settings management. |
| **What's BaseModel?** | The parent class all Pydantic models inherit from — provides validation, serialization, etc. |
| **Difference between `Field()` and `field_validator`?** | `Field()` adds constraints declaratively; `field_validator` runs custom code for validation. |
| **`field_validator` vs `model_validator`?** | Field validates one field; Model validates across multiple fields. |
| **What does `mode="after"` mean?** | Runs after individual field validation succeeds. |
| **Why use `@computed_field`?** | To auto-derive values from other fields, included in serialization. |
| **Difference between `.model_dump()` and `.model_dump_json()`?** | `.model_dump()` returns a dict; `.model_dump_json()` returns a JSON string. |
| **How do you handle self-referencing models?** | Use forward reference strings (`"ClassName"`) + call `Model.model_rebuild()`. |
| **How does Pydantic handle invalid data?** | Raises a `ValidationError` with detailed messages about which fields failed. |
| **Why is Pydantic used in FastAPI?** | For request/response validation, automatic OpenAPI doc generation, and type safety. |

---

End of Section 12 — Pydantic. Next up: more AI development topics!
