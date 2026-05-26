# 📘 TypeScript Mastery: Generics & Utility Types

## 🧠 The Core Concept

### What are Generics?
Generics are essentially "variables for types." Just as you pass data as arguments to a function, Generics allow you to pass types as arguments to functions, interfaces, or classes.



### Why do they exist and what problem do they solve?
Without Generics, if you want a function to handle multiple data types, you are forced to use `any`, which destroys all type safety. Generics allow you to write reusable code that can work with a variety of types while preserving absolute strictness. If you pass a string into a generic function, TypeScript remembers it's a string when it comes out.

---

## ⚙️ Syntax & All Variants

### 1. Basic Generics (Functions, Interfaces, Classes)
We typically use `<T>` (for Type), but you can use any name like `<Data>` or `<U>`.

~~~typescript
// 1. Generic Function
function wrapInArray<T>(value: T): T[] {
  return [value];
}
const stringArray = wrapInArray<string>("Hello"); // Type: string[]
const numberArray = wrapInArray(42);              // Type: number[] (Inferred!)

// 2. Generic Interface
interface ServerResponse<T> {
  status: number;
  data: T;
}
const userRes: ServerResponse<{ name: string }> = { status: 200, data: { name: "Rahul" } };

// 3. Generic Class
class DataStorage<T> {
  private data: T[] = [];
  addItem(item: T) { this.data.push(item); }
  getItems(): T[] { return [...this.data]; }
}
const stringStorage = new DataStorage<string>();
stringStorage.addItem("Cognizant"); // Valid
// stringStorage.addItem(100);      // ERROR: Argument of type 'number' is not assignable to 'string'.
~~~

### 2. Generic Constraints (`extends`)
Sometimes you don't want a generic to accept any type; you want it to accept any type that has certain properties. You enforce this using `extends`.

~~~typescript
// T must be an object that AT LEAST has an 'id' property of type number.
function printId<T extends { id: number }>(item: T): void {
  console.log("ID is:", item.id); // Without the constraint, TS would error here because 'id' might not exist on T.
}

printId({ id: 101, name: "Alice" }); // Valid (has id)
// printId({ name: "Bob" });         // ERROR: Property 'id' is missing.
~~~

### 3. Utility Types (The MERN Lifesavers)
TypeScript provides built-in generic types that manipulate existing interfaces. You must memorize these.



~~~typescript
interface User {
  id: number;
  name: string;
  email?: string; // Optional
}

// 1. Partial<T>: Makes ALL properties optional. Perfect for update/patch payloads.
type UpdateUser = Partial<User>; // { id?: number; name?: string; email?: string }

// 2. Required<T>: Makes ALL properties strictly required.
type StrictUser = Required<User>; // { id: number; name: string; email: string }

// 3. Readonly<T>: Makes ALL properties immutable.
type LockedUser = Readonly<User>; 

// 4. Pick<T, Keys>: Selects specific properties to keep.
type UserPreview = Pick<User, "id" | "name">; // { id: number; name: string }

// 5. Omit<T, Keys>: Selects specific properties to discard.
type UserWithoutId = Omit<User, "id">; // { name: string; email?: string }

// 6. Record<KeyType, ValueType>: Creates a dictionary/object type.
type UserDictionary = Record<string, User>; // Example: { "user1": { id: 1, name: "Alice" }, "user2": ... }
~~~

---

## ⚛️ MERN Stack Integration

### 1. React Frontend (Generic Components & Hooks)
Generics are heavily used in React for reusable UI components (like Tables or Lists) and hooks.

~~~typescript
import React, { useState } from 'react';

// Typing a hook with a Generic
const useCounter = () => {
  const [count, setCount] = useState<number | null>(null); 
};

// Generic React Component
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

// Note the comma <T,> - This is REQUIRED in .tsx files so the parser doesn't confuse it with a JSX <div> tag!
const GenericList = <T,>({ items, renderItem }: ListProps<T>) => {
  return <ul>{items.map((item, index) => <li key={index}>{renderItem(item)}</li>)}</ul>;
};

// Usage:
// <GenericList items={["A", "B"]} renderItem={(item) => <span>{item}</span>} />
~~~

### 2. Node.js / Express Backend (Generic API Responses)
Instead of typing every single API response manually, Senior Devs create a master Generic Interface.

~~~typescript
import { Request, Response } from 'express';

// Master API Interface
interface ApiResponse<T> {
  success: boolean;
  message: string;
  payload?: T;
}

interface DBUser { id: string; role: string; }

export const getUser = (req: Request, res: Response<ApiResponse<DBUser>>) => {
  const mockUser = { id: "123", role: "admin" };
  
  // TypeScript enforces that 'payload' EXACTLY matches the DBUser interface
  res.status(200).json({
    success: true,
    message: "User fetched",
    payload: mockUser 
  });
};
~~~

---

## 🎯 Interview "Gotchas" & FAQs

* **Gotcha 1: "In a `.tsx` file, I wrote `const myFunc = <T>(arg: T) => {}` and it threw a syntax error. Why?"**
    * **Answer:** The TSX parser thinks `<T>` is an unclosed HTML/JSX tag. You must write it as `<T,>` or `<T extends unknown>` to explicitly tell the compiler it's a generic.
* **Gotcha 2: "What is the difference between passing `any` vs using a Generic `<T>`?"**
    * **Answer:** `any` forgets the type. If you pass a string into a function taking `any`, it returns as `any`. If you pass a string into a generic function taking `<T>`, it locks in the type and guarantees a string is returned, keeping IntelliSense intact.
* **Gotcha 3: "How do you extract the return type of a function?"**
    * **Answer:** Using the advanced utility type `ReturnType<typeof myFunction>`. (Often asked to test deep knowledge).

---

## 💻 Coding Assessment Patterns

### Pattern 1: Fixing the Missing Constraint

~~~typescript
// The Assessment provides this broken code:
function getLength<T>(item: T): number {
  return item.length; // ERROR: Property 'length' does not exist on type 'T'.
}
~~~
* **Assessment Answer:** The compiler doesn't know if `T` is an array/string (which has `.length`) or a number (which doesn't). You must add a constraint:
`function getLength<T extends { length: number }>(item: T): number`

### Pattern 2: The Data Fetcher
You will be asked to write a typed wrapper for the `fetch` API.

~~~typescript
async function fetchData<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const data: T = await response.json();
  return data;
}

// Usage: const users = await fetchData<User[]>('/api/users');
~~~

---

## 📊 Mental Model / Diagram

Think of Generics as a 3D Printer and Utility Types as Molds.

| Concept | Metaphor | Explanation |
| :--- | :--- | :--- |
| **Generics (`<T>`)** | The 3D Printer | A machine that can create anything, but you must feed it a specific blueprint (`<string>`, `<User>`) at execution time to get a strict result. |
| **`Partial<T>`** | The "Relaxed" Mold | Takes your rigid blueprint and makes every screw and bolt optional. |
| **`Required<T>`** | The "Strict" Mold | Takes a blueprint where parts were optional and forces every single piece to be present. |
| **`Pick<T>` / `Omit<T>`** | The Scalpel | Slices specific pieces out of your blueprint to create a smaller, specialized blueprint. |