# 📘 TypeScript Mastery: Functions & Overloading

## 🧠 The Core Concept

### What is Function Typing?
It is the practice of explicitly defining the data types a function is allowed to accept (parameters) and the exact data type it promises to hand back (return type).



### What problem does it solve?
In standard JavaScript, a function `function calculateTax(amount)` can accidentally be called with a string, an array, or nothing at all, causing `NaN` errors at runtime. TypeScript forces the caller to provide exactly what the function needs, and it guarantees to the rest of the application that the output will be strictly predictable.

---

## ⚙️ Syntax & All Variants

### 1. Basic Parameter and Return Types
You type the parameters after the colon, and the return type after the parentheses.

~~~typescript
// Named Function
function calculateDiscount(price: number, discount: number): number {
  return price - (price * discount);
}

// Arrow Function
const calculateDiscountArrow = (price: number, discount: number): number => {
  return price - (price * discount);
};
~~~

### 2. Optional Parameters (`?`)
Marks a parameter as not strictly required. It will be `undefined` if not passed. 
**Rule:** Optional parameters must always come *after* required parameters.

~~~typescript
function formatName(first: string, last?: string): string {
  if (last) return `${first} ${last}`;
  return first;
}
formatName("Rahul"); // Valid
formatName("Rahul", "Sharma"); // Valid
~~~

### 3. Default Parameters (`=`)
Assigns a default value if the caller doesn't provide one. TypeScript automatically infers the type from the default value, so you don't strictly need a `: type` annotation, though it's good practice.

~~~typescript
function createInstance(region: string = "ap-south-1"): string {
  return `Instance deployed in ${region}`;
}
createInstance(); // Returns "Instance deployed in ap-south-1"
~~~

### 4. Rest Parameters (`...args`)
Used when a function accepts an indefinite number of arguments. In TypeScript, rest parameters must always be typed as an Array.

~~~typescript
function sumAll(prefix: string, ...numbers: number[]): string {
  const total = numbers.reduce((acc, curr) => acc + curr, 0);
  return `${prefix}: ${total}`;
}
sumAll("Total Score", 10, 20, 30, 40); // Valid
~~~

### 5. Function Overloading (Advanced)
Overloading allows a single function to have multiple signatures (ways it can be called). You write the **Overload Signatures** first (no body), and the **Implementation Signature** last (with the actual logic).



~~~typescript
// 1. Overload Signatures (What the outside world sees)
function getTrainee(id: number): string;
function getTrainee(name: string, domain: string): string;

// 2. Implementation Signature (What the internal logic handles)
// Notice the implementation signature must be broad enough to handle ALL overloads using 'any' or unions.
function getTrainee(idOrName: number | string, domain?: string): string {
  if (typeof idOrName === "number") {
    return `Fetching trainee by ID: ${idOrName}`;
  } else {
    return `Fetching trainee ${idOrName} from domain ${domain}`;
  }
}

// Usage: The compiler enforces the two specific overload signatures.
getTrainee(101); // Valid
getTrainee("Amit", "MERN"); // Valid
// getTrainee("Amit"); // ERROR: Does not match any overload signature!
~~~

---

## ⚛️ MERN Stack Integration

### 1. React Frontend (Typing Event Handlers and Callbacks)
When writing React, typing the functions passed as props or event handlers is a daily task.

~~~typescript
import React from 'react';

interface FormProps {
  onSubmit: (data: string) => void; // Typing a callback function
}

const SearchForm: React.FC<FormProps> = ({ onSubmit }) => {
  // Typing an inline event handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    console.log(e.target.value);
  };

  return (
    <input type="text" onChange={handleChange} />
  );
};
~~~

### 2. Node.js / Express Backend (Overloading a Utility Function)
Imagine a utility function for AWS S3 file uploads that can take either a raw Buffer (for direct memory uploads) or a File Path (string). Overloading is perfect here.

~~~typescript
import { Request, Response } from 'express';

// Overloads
function uploadData(fileBuffer: Buffer): Promise<string>;
function uploadData(filePath: string, bucketName: string): Promise<string>;

// Implementation
async function uploadData(data: Buffer | string, bucketName?: string): Promise<string> {
  if (Buffer.isBuffer(data)) {
    return `Uploaded buffer to default bucket`;
  } else {
    return `Uploaded file at ${data} to AWS bucket ${bucketName}`;
  }
}

// Express Controller
export const handleUpload = async (req: Request, res: Response) => {
  const url = await uploadData(req.body.buffer); // Uses the first signature safely
  res.json({ success: true, url });
};
~~~

---

## 🎯 Interview "Gotchas" & FAQs

* **Gotcha 1: "Can you combine optional (`?`) and default (`=`) parameters on the same variable?"**
    * **Answer:** No. A default parameter makes the parameter inherently optional. Writing `name?: string = "Guest"` is an error.
* **Gotcha 2: "Is the Implementation Signature of an overloaded function callable from the outside?"**
    * **Answer:** No! This is the biggest trick question. The implementation signature is completely hidden from the caller. The caller can only use the specific overload signatures defined above it.
* **Gotcha 3: "Where must Rest Parameters be placed?"**
    * **Answer:** Rest parameters (`...args`) must always be the absolute last parameter in the function definition.
* **Conceptual: "What is the type of a function that acts as a constructor?"**
    * **Answer:** You type it using the `new` keyword, e.g., `type ClassConstructor = new () => MyClass;`.

---

## 💻 Coding Assessment Patterns

### Pattern 1: The Callback Type Definition
Assessments often ask you to define a type for a function that takes another function as an argument.

~~~typescript
// Define a type alias for a mathematical operation callback
type MathOperation = (a: number, b: number) => number;

function calculate(a: number, b: number, operation: MathOperation): number {
  return operation(a, b);
}

const add: MathOperation = (x, y) => x + y;
calculate(10, 5, add); // Output: 15
~~~

### Pattern 2: The Broken Overload Implementation
You will be given broken code and asked why it fails to compile.

~~~typescript
function process(x: number): number;
function process(x: string): string;
// ERROR: Implementation signature is not compatible with all overloads.
function process(x: number) { 
  return x * 2;
}
~~~
* **Assessment Answer:** The implementation signature only handles `number`. It must be broad enough to handle both `number` and `string` (e.g., `function process(x: number | string): number | string { ... }`).

---

## 📊 Mental Model / Diagram
Visualize Function Overloading like a restaurant menu vs. the kitchen.

~~~plaintext
=========================================================
            FUNCTION OVERLOADING MENTAL MODEL
=========================================================

[ THE MENU ] (Overload Signatures) -> Visible to Caller
  1. Order a Pizza (Size)
  2. Order a Pizza (Size, Toppings)
      │
      │ (Caller picks one specific way to order)
      ▼
[ THE KITCHEN ] (Implementation Signature) -> Hidden
  function orderPizza(size: string, toppings?: string[]) {
     - Kitchen logic checks what was actually provided.
     - Kitchen handles the heavy lifting using unions/optionals.
  }
=========================================================
~~~