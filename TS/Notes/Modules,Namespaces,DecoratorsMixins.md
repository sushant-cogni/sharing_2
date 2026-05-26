# 📘 TypeScript Mastery: Modules & Namespaces

## 🧠 The Core Concept

### What are Modules and Namespaces?
They are TypeScript’s two mechanisms for organizing code.
* **Modules (ES Modules):** The modern, file-based system where each file is its own isolated scope. You share code using `export` and bring it in using `import`.
* **Namespaces:** TypeScript's legacy way to group logically related code under a single global object.

### Why do they exist and what problem do they solve?
Without them, all variables and functions you write would live in the global scope, leading to massive naming collisions (e.g., two different files defining a `validate()` function). Modules solve this by isolating scope to the file level.

---

## ⚙️ Syntax & All Variants

### 1. ES Modules: Named vs. Default Exports

~~~typescript
// --- file: mathUtils.ts ---

// 1. Named Export (You can have multiple per file)
export const add = (a: number, b: number) => a + b;
export interface MathConfig { strict: boolean }

// 2. Default Export (Only ONE per file)
export default class Calculator {
  multiply(a: number, b: number) { return a * b; }
}

// --- file: app.ts ---

// Importing Named (Must use exact names and curly braces)
import { add, MathConfig } from './mathUtils';

// Importing Default (Can name it anything, no braces)
import MyCalc from './mathUtils';

// Importing Everything as an Object
import * as MathHelpers from './mathUtils';
~~~

### 2. Type-Only Imports (Performance Optimization)
Tells the compiler, "I only need this for type-checking. Do not include this in the compiled JavaScript."

~~~typescript
import type { MathConfig } from './mathUtils';
~~~

### 3. Namespaces (Legacy / Internal Modules)
Namespaces use the `namespace` keyword to wrap code block. Variables inside must be exported to be accessed outside the namespace block.

~~~typescript
namespace Validation {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Private to namespace

  export function isValidEmail(email: string): boolean {
    return emailRegex.test(email);
  }
}

// Usage:
const check = Validation.isValidEmail("test@test.com");
~~~

---

## ⚛️ MERN Stack Integration

### 1. React Frontend (Component Modules)
In React, the standard convention is one component per file, using a default export for the component and named exports for its props interfaces.

~~~typescript
// src/components/Button.tsx
export interface ButtonProps { label: string; } // Named Export

const Button = ({ label }: ButtonProps) => <button>{label}</button>;

export default Button; // Default Export
~~~

### 2. Node.js / Express Backend (Router Modules)
Backends heavily rely on named exports for controller functions to ensure naming consistency across the API.

~~~typescript
// src/controllers/userController.ts
import { Request, Response } from 'express'; // Named imports from node_modules

export const getUser = (req: Request, res: Response) => {
  res.json({ user: "Alice" });
};

// src/routes/userRoutes.ts
import express from 'express';
import { getUser } from '../controllers/userController'; // Named import

const router = express.Router();
router.get('/', getUser);

export default router;
~~~

---

## 🎯 Interview "Gotchas" & FAQs

* **Gotcha 1: "Should I use Namespaces or ES Modules in a modern MERN app?"**
    * **Answer:** Always use ES Modules. Namespaces are a legacy feature from before JavaScript officially supported modules (ES6). Modern bundlers (like Vite or Webpack) and Node.js are optimized for ES Modules. Namespaces can actually break tree-shaking (removing dead code).
* **Gotcha 2: "What is the main downside of Default Exports?"**
    * **Answer:** Refactoring. If you rename a named export, your IDE will automatically rename it everywhere it is imported. If you rename a default export, you must manually hunt down every file where you imported it, because the importer can name it whatever they want.
* **Conceptual: "What does `export =` and `import x = require('...')` mean?"**
    * **Answer:** It is TypeScript's specific syntax to handle compatibility with older CommonJS (Node.js) modules. In modern TS with `"esModuleInterop": true` in `tsconfig.json`, you rarely need to write this anymore.

---

## 💻 Coding Assessment Patterns

### Pattern 1: The Circular Dependency Trap
* **Scenario:** File A imports File B, and File B imports File A. This crashes the app at runtime.
* **Assessment Fix:** The easiest way to fix circular dependencies in TypeScript is to extract the shared logic (often an interface or type) into a separate, third file (e.g., `types.ts`) that both File A and File B can import from without relying on each other.

---

# 📘 TypeScript Mastery: Decorators & Mixins (Advanced Patterns)

## 🧠 The Core Concept

* **Decorators:** They are special functions (prefixed with `@`) that can be attached to a class, method, property, or parameter to modify its behavior at design time. It is a form of Metaprogramming—code that writes or changes code.
    * *Note:* You must set `"experimentalDecorators": true` in your `tsconfig.json` to use them.
* **Mixins:** A design pattern used to bypass JavaScript's limitation of single-inheritance (a class can only extend one other class). Mixins allow you to "mix in" multiple independent behaviors into a single class.

---

## ⚙️ Syntax & All Variants

### 1. Decorators
Decorators are just functions. They receive information about the target they are decorating.

~~~typescript
// 1. A Simple Class Decorator
// It takes the constructor of the class and can modify or replace it.
function Logger(target: Function) {
  console.log(`Class ${target.name} was defined!`);
}

@Logger
class Database {
  constructor() { console.log("DB Instantiated"); }
}
// Output upon file load: "Class Database was defined!"

// 2. A Method Decorator Factory (Passing arguments to a decorator)
function MeasureTime(taskName: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value; // Store the original method

    // Replace it with our new logic
    descriptor.value = function (...args: any[]) {
      console.time(taskName);
      const result = originalMethod.apply(this, args); // Run original
      console.timeEnd(taskName);
      return result;
    };
  };
}

class ApiService {
  @MeasureTime("FetchDataTask")
  fetchData() {
    // Simulating heavy work
    for(let i = 0; i < 1000000; i++) {}
  }
}
~~~

### 2. Mixins
A mixin is a function that takes a base class and returns a new class that extends the base with additional functionality.

~~~typescript
// A generic type representing any constructor function
type Constructor = new (...args: any[]) => {};

// The Mixin Function
function Timestamped<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    createdAt = new Date(); // Adds a new property
  };
}

class User {
  constructor(public name: string) {}
}

// Applying the Mixin
const TimestampedUser = Timestamped(User);

const user = new TimestampedUser("Rahul");
console.log(user.name);      // "Rahul"
console.log(user.createdAt); // 2026-03-03T...
~~~

---

## ⚛️ MERN Stack Integration

### Node.js / Express Backend (NestJS-style Routing)
While raw Express doesn't use decorators natively, enterprise frameworks built on Express (like NestJS) rely entirely on them to define routes cleanly without messy middleware chains.

~~~typescript
// Conceptual enterprise backend routing using Decorators
class UserController {
  
  @Get('/api/users')
  @RequireAdmin() // Method decorator enforcing authentication
  getAllUsers(req: Request, res: Response) {
    res.json({ users: ["Alice", "Bob"] });
  }
}
~~~

---

## 🎯 Interview "Gotchas" & FAQs

* **Gotcha 1: "When are decorators executed? When the class is instantiated, or when the file is loaded?"**
    * **Answer:** Decorators are executed once, at design/compile time when the file is parsed by the engine, not every time you create a new instance of the class.
* **Gotcha 2: "In what order do multiple decorators execute?"**
    * **Answer:** This is a classic trap!
        * Decorator factories (the outer functions) evaluate **Top-to-Bottom**.
        * The actual decorator execution happens **Bottom-to-Top** (like peeling an onion from the inside out).
* **Conceptual: "Why use Mixins instead of just standard Inheritance (`extends`)?"**
    * **Answer:** Because of the "Diamond Problem" and JavaScript's limitation that a class can only extend exactly one base class. If an Admin needs functionality from both `UserAuth` and `DatabaseLogger` classes, standard inheritance fails. Mixins allow you to compose an object out of multiple distinct behaviors.

---

## 💻 Coding Assessment Patterns

### Pattern 1: The Decorator Evaluation Order
You will be given code and asked to predict the console output.

~~~typescript
function First() {
  console.log("First Factory");
  return function (target: any) { console.log("First Execution"); }
}

function Second() {
  console.log("Second Factory");
  return function (target: any) { console.log("Second Execution"); }
}

@First()
@Second()
class Example {}
~~~
* **Assessment Answer:** 1.  "First Factory" (Top-down)
    2.  "Second Factory" (Top-down)
    3.  "Second Execution" (Bottom-up execution)
    4.  "First Execution" (Bottom-up execution)

---

## 📊 Mental Model / Diagram

Use this comparison to remember when to use which advanced architectural pattern.

| Pattern | Metaphor | What it Does | Primary Use Case |
| :--- | :--- | :--- | :--- |
| **Inheritance (`extends`)** | DNA | Passes down full core traits from parent to child. (Limit: 1 parent) | `Dog extends Animal` |
| **Mixins** | Upgrades/Attachments | Plugs modular abilities into a base class. (Limit: None) | `const FlyingDog = CanFly(Dog)` |
| **Decorators (`@`)** | Wrapping Paper/Tags | Wraps a class/method to intercept or modify it, leaving the core intact. | `@Validate()`, `@Log()` |