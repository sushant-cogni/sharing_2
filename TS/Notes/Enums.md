# 📘 TypeScript Mastery: Enums

> **Interviewer Insight:** As an interviewer, when I ask a candidate about Enums, I am testing their knowledge of JavaScript compilation. Enums are unique in TypeScript because they are one of the very few features that are not just stripped away during compilation—they actually generate real JavaScript code (unless you use a specific keyword, which we will cover).

## 🧠 The Core Concept

### What are Enums?
"Enum" stands for Enumeration. It is a feature that allows you to define a set of named constants. It gives you a way to give friendly, readable names to a set of numeric or string values.



### Why do they exist and what problem do they solve?
In pure JavaScript, if you have a specific set of allowed values (like User Roles: Admin, Editor, Viewer), you usually rely on "magic strings" or numbers scattered throughout your code. If you mistype "Admn", JS won't catch it until it breaks in production. Enums group these related values together, providing strict autocomplete, typo prevention, and a single source of truth.

---

## ⚙️ Syntax & All Variants

### 1. Numeric Enums (The Default)
By default, Enums are zero-based and auto-increment.

~~~typescript
enum Direction {
  Up,    // 0
  Down,  // 1
  Left,  // 2
  Right  // 3
}

// You can also initialize the first value, and the rest will increment from there:
enum HttpStatusCode {
  OK = 200,
  Created,         // 201
  Accepted,        // 202
  BadRequest = 400,
  Unauthorized     // 401
}
~~~

### 2. String Enums (Best for Debugging)
In String Enums, every value must be explicitly initialized with a string.
**Pro-Tip:** These are heavily preferred in MERN stack development because when you inspect a network request payload, seeing "ADMIN" is infinitely easier to debug than seeing the number `0`.

~~~typescript
enum UserRole {
  Admin = "ADMIN",
  Editor = "EDITOR",
  Viewer = "VIEWER"
}

const currentUserRole = UserRole.Admin; // "ADMIN"
~~~

### 3. Heterogeneous Enums (Mixing Types)
You can mix numbers and strings, but you should almost never do this in enterprise code. It causes confusion and makes typing unpredictable.

~~~typescript
enum MixedStatus {
  No = 0,
  Yes = "YES"
}
~~~

### 4. The `const` enum (The Performance Optimizer)
Standard Enums generate a bulky IIFE (Immediately Invoked Function Expression) in the compiled JavaScript. A `const enum` tells TypeScript to completely erase the enum during compilation and just inline the raw values.

~~~typescript
const enum Status {
  Active = 1,
  Inactive = 2
}

const myStatus = Status.Active; // Compiles purely to: const myStatus = 1; (Zero overhead!)
~~~

---

## ⚛️ MERN Stack Integration

### 1. Node.js / Express Backend (Typing Database Schemas & Requests)
String Enums are perfect for validating incoming API payloads before saving them to MongoDB.



~~~typescript
import { Request, Response } from 'express';

// 1. Define the Enum
export enum TicketStatus {
  Open = "OPEN",
  InProgress = "IN_PROGRESS",
  Resolved = "RESOLVED"
}

// 2. Use in Request validation
export const updateTicket = (req: Request, res: Response) => {
  const { status } = req.body;

  // Validate against the Enum
  if (!Object.values(TicketStatus).includes(status)) {
    return res.status(400).json({ error: "Invalid status provided" });
  }

  // TypeScript strictly knows status is TicketStatus here
  res.json({ message: `Ticket moved to ${status}` });
};
~~~

### 2. React Frontend (UI State and Variants)
Instead of passing arbitrary strings to a button component, use Enums to lock down the exact variants allowed.

~~~typescript
import React from 'react';

export enum ButtonVariant {
  Primary = "primary",
  Secondary = "secondary",
  Danger = "danger"
}

interface ButtonProps {
  label: string;
  variant: ButtonVariant; // Restricts prop to strictly these 3 options
}

const CustomButton: React.FC<ButtonProps> = ({ label, variant }) => {
  // Safe CSS class mapping based on Enum
  return <button className={`btn-${variant}`}>{label}</button>;
};

// Usage:
// <CustomButton label="Delete" variant={ButtonVariant.Danger} />
// <CustomButton label="Save" variant="blue" /> // ERROR! "blue" is not assignable.
~~~

---

## 🎯 Interview "Gotchas" & FAQs

* **Gotcha 1: Reverse Mapping (The biggest Enum trick question)**
    * **Question:** "Does `Direction[0]` work if `Direction.Up` is `0`?"
    * **Answer:** Yes, but ONLY for Numeric Enums. TypeScript generates a "reverse mapping" object for numeric enums. However, String Enums do not have reverse mapping.
* **Gotcha 2: Enum vs. Union Type (`type Role = 'ADMIN' | 'USER'`)**
    * **Question:** "Why use an Enum instead of a Union Type?"
    * **Answer:** Union Types do not exist at runtime; they leave zero footprint. Enums generate actual JavaScript objects that you can iterate over (e.g., using `Object.keys(UserRole)` to generate a dropdown menu in React). If you don't need iteration, a Union Type is often cleaner and lighter.
* **Gotcha 3: The `Object.values()` mismatch**
    * **Question:** "If I run `Object.values()` on a numeric enum, what happens?"
    * **Answer:** Because of reverse mapping, you get an array containing both the keys and the values (e.g., `["Up", "Down", 0, 1]`). This is why String Enums are vastly preferred for data validation.

---

## 💻 Coding Assessment Patterns

### Pattern 1: The "Guess the Value" Sequence

~~~typescript
enum FileAccess {
  Read = 2,
  Write, // What is this value?
  Execute = 6,
  Admin // What is this value?
}
~~~
* **Assessment Answer:** `Write` is `3` (auto-increments from the previous number). `Admin` is `7` (auto-increments from `6`).

### Pattern 2: The Direct String Assignment Trap

~~~typescript
enum Direction {
  Up = "UP",
  Down = "DOWN"
}

function move(dir: Direction) {}

move("UP"); // What happens here?
~~~
* **Assessment Answer:** Compile Error! Even though the underlying value is `"UP"`, TypeScript strictly requires you to pass `Direction.Up`. You cannot pass the raw string to a function expecting an Enum.

---

## 📊 Mental Model / Diagram

Use this comparison table to quickly decide (and explain to an interviewer) which type of constant grouping to use.

| Feature | Numeric Enum | String Enum | `const` enum | Union Type (`'A' \| 'B'`) |
| :--- | :--- | :--- | :--- | :--- |
| **Generates JS Code?** | Yes (Bulky Object) | Yes (Clean Object) | No (Erased) | No (Erased) |
| **Reverse Mapping?** | ✅ Yes | ❌ No | ❌ No | N/A |
| **Best For** | Bitwise flags, math | API Payloads, DBs | High-performance apps | Simple prop restrictions |
| **Iterable at Runtime?** | ✅ Yes (Messy) | ✅ Yes (Clean) | ❌ No | ❌ No |