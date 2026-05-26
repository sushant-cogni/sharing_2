# 📘 TypeScript Mastery: Advanced Types

## 🧠 The Core Concept

### What are Advanced Types?
Advanced Types are powerful operators and keywords that allow you to combine, intersect, and narrow down types. They let you express complex logic, such as "this variable can be a string or a number," or "this object must have the properties of both a User and an Admin."

### Why do they exist and what problem do they solve?
JavaScript is highly dynamic. A function might return an object on success, but a string on failure. Basic types (`string`, `boolean`, `interface`) cannot express this duality. Advanced types solve this by allowing you to model real-world JavaScript flexibility while maintaining strict, compile-time safety.

---

## ⚙️ Syntax & All Variants

### 1. Union Types (`|`)
Allows a variable to be one of multiple types. Think of it as a logical OR.

~~~typescript
let id: string | number;
id = 101;     // Valid
id = "U-101"; // Valid
// id = true; // ERROR: Type 'boolean' is not assignable.

// The Trap: If you have a union of objects, you can ONLY access shared properties!
interface Bird { fly(): void; layEggs(): void; }
interface Fish { swim(): void; layEggs(): void; }

function spawn(pet: Bird | Fish) {
  pet.layEggs(); // Valid (Shared)
  // pet.swim(); // ERROR: Property 'swim' does not exist on type 'Bird | Fish'.
}
~~~

### 2. Intersection Types (`&`)
Combines multiple types into one. Think of it as a logical AND. The resulting type has all the properties of the intersected types.

~~~typescript
type Employee = { empId: number; department: string };
type Person = { name: string; age: number };

type StaffMember = Employee & Person;

const newHire: StaffMember = {
  empId: 1,
  department: "IT",
  name: "Amit",
  age: 22
  // Must include all 4 properties!
};
~~~

### 3. Literal Types
Restricting a variable not just to a type, but to an exact value.

~~~typescript
let state: "loading" | "success" | "error";
state = "success"; // Valid
// state = "failed"; // ERROR: Type '"failed"' is not assignable.
~~~

### 4. Type Assertions (`as`)
Telling the compiler, "Trust me, I know more about this value's type than you do." It does not perform any runtime data conversion; it only silences the compiler.

~~~typescript
// Variant 1: The 'as' keyword (Recommended, specifically for React/TSX)
const myCanvas = document.getElementById("main-canvas") as HTMLCanvasElement;

// Variant 2: Angle bracket syntax (Do NOT use in React, conflicts with JSX tags)
const myCanvas2 = <HTMLCanvasElement>document.getElementById("main-canvas");
~~~

### 5. Type Guards (Narrowing)
When you have a Union Type, you must "narrow" it down to a specific type before TypeScript lets you use its unique properties.



~~~typescript
// 1. typeof (For primitives)
function printId(id: string | number) {
  if (typeof id === "string") {
    console.log(id.toUpperCase()); // TS knows it's a string here
  } else {
    console.log(id.toFixed(2));    // TS knows it's a number here
  }
}

// 2. instanceof (For classes)
function logError(error: Error | string) {
  if (error instanceof Error) {
    console.log(error.message);
  }
}

// 3. The 'in' operator (For interfaces/objects)
function handlePet(pet: Bird | Fish) {
  if ("swim" in pet) {
    pet.swim(); // TS knows it's a Fish
  }
}

// 4. Custom Type Guard Function (Using the 'is' keyword)
function isFish(pet: any): pet is Fish {
  return (pet as Fish).swim !== undefined;
}

if (isFish(myPet)) {
  myPet.swim(); // Strongly typed as Fish
}
~~~

---

## ⚛️ MERN Stack Integration

### 1. React Frontend (Union & Literal Types for Components)
In React, Literal Unions are the gold standard for defining UI component variants.

~~~typescript
import React from 'react';

// Using Literal Types and Unions for strict UI state
type ButtonProps = {
  label: string;
  variant: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
};

const Button: React.FC<ButtonProps> = ({ label, variant, size = "md" }) => {
  return <button className={`btn-${variant} btn-${size}`}>{label}</button>;
};

// <Button label="Delete" variant="danger" /> // Perfect autocomplete!
~~~

### 2. Node.js / Express Backend (Intersections for Extended Requests)
In Express, middleware often adds custom data to the `req` object (like a decoded JWT token). Intersection types are the cleanest way to type this inside a controller.

~~~typescript
import { Request, Response } from 'express';

// Standard Express Request intersected with our custom payload
type AuthRequest = Request & { 
  user?: { id: string; role: string } 
};

export const getDashboard = (req: AuthRequest, res: Response) => {
  // Using an inline type guard to ensure the user exists
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  res.json({ message: `Welcome ${req.user.role}` });
};
~~~

---

## 🎯 Interview "Gotchas" & FAQs

* **The Trap:** *"I asserted a string into a number using `let age = "25" as number;` but the math failed at runtime. Why?"*
    * **Answer:** Type assertions (`as`) do not restructure data at runtime. They are completely erased during compilation. Your variable is still a string in the compiled JavaScript. You must use JavaScript methods like `parseInt()` for actual conversion.
* **Trick Question:** *"If I have `type A = { x: number }` and `type B = { y: string }`, what properties exist on a variable of type `A | B`?"*
    * **Answer:** None. (Or rather, only properties that exist on both, which in this case is none). You cannot access `.x` or `.y` until you use a Type Guard to prove which one it is.
* **Gotcha 3:** *"How do I assert a type when TypeScript strictly forbids it (e.g., trying to cast an Event object to a string)?"*
    * **Answer:** Use "Double Assertion". First cast to `unknown`, then to your target type: `value as unknown as string`. (Interviewers like this because it shows deep TS knowledge, but remember to mention it's a dangerous anti-pattern in production).

---

## 💻 Coding Assessment Patterns

### Pattern 1: The Discriminated Union (Highly Tested)
Evaluators love this. It's the standard pattern for handling Redux actions or complex state machines.



~~~typescript
// All interfaces share a common literal property: 'type'
interface FetchPending { type: "PENDING" }
interface FetchSuccess { type: "SUCCESS"; data: string[] }
interface FetchError { type: "ERROR"; errorMessage: string }

type FetchAction = FetchPending | FetchSuccess | FetchError;

function reducer(action: FetchAction) {
  // TypeScript automatically narrows the type based on the switch statement!
  switch (action.type) {
    case "SUCCESS":
      return action.data; // TS knows 'data' exists here
    case "ERROR":
      return action.errorMessage; // TS knows 'errorMessage' exists here
  }
}
~~~

### Pattern 2: Writing a Custom Type Guard
You will be given a mixed array and asked to filter it safely.

~~~typescript
const mixedData: (string | number)[] = [1, "two", 3, "four"];

// They want to see the 'item is string' syntax
function isString(item: unknown): item is string {
  return typeof item === "string";
}

const stringsOnly = mixedData.filter(isString); // Type becomes string[]
~~~

---

## 📊 Mental Model / Diagram
Use this comparison to remember when to use which narrowing technique during a technical interview.

| Narrowing Technique | Keyword / Strategy | Best Used For... | Example |
| :--- | :--- | :--- | :--- |
| **Primitives** | `typeof` | `string`, `number`, `boolean` | `if (typeof val === "string")` |
| **Classes / Objects** | `instanceof` | Checking if an object was made by a Class | `if (err instanceof Error)` |
| **Interfaces (Shape)** | `in` operator | Checking if a property exists on an object | `if ("swim" in myPet)` |
| **Custom Logic** | `is` keyword | Abstracting complex validation into a function | `function isUser(obj: any): obj is User` |
| **Redux / State** | Discriminated Union | Switch statements checking a shared literal key | `switch (action.type)` |