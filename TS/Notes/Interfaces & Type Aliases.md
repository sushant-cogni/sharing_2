# 📘 TypeScript Mastery: Interfaces & Type Aliases

## 🧠 The Core Concept

### What are Interfaces and Type Aliases?
They are ways to name a specific "shape" of data. Think of them as strictly enforced blueprints or contracts. If a variable or function claims to use a specific interface or type, the TypeScript compiler ensures it matches that blueprint perfectly.



### Why do they exist and what problem do they solve?
In pure JavaScript, objects are completely fluid. You might expect a user object to have a `firstName`, but accidentally type `user.FirstName`, returning `undefined` and crashing the app later. Interfaces and Types solve this by catching structural mismatches, missing properties, and typos at compile-time.

---

## ⚙️ Syntax & All Variants

### 1. Interfaces (The Object Blueprint)
Interfaces are primarily used to define the shape of objects.

~~~typescript
interface User {
  name: string;
  age: number;
  email?: string; // The '?' makes this property optional
  readonly id: string; // Cannot be modified after initialization
}

const newUser: User = {
  name: "Rahul",
  age: 21,
  id: "USR-123" // email is safely omitted
};

// newUser.id = "USR-456"; // ERROR: Cannot assign to 'id' because it is a read-only property.
~~~

### 2. Extending Interfaces (`extends`)
Interfaces can inherit properties from other interfaces, making them highly reusable.



~~~typescript
interface Employee extends User {
  employeeId: number;
  department: string;
}

const dev: Employee = {
  name: "Priya",
  age: 24,
  id: "USR-999",
  employeeId: 1042,
  department: "IT"
};
~~~

### 3. Type Aliases (`type`)
Type aliases can define object shapes just like interfaces, but they can also define primitive aliases, unions, and tuples.

~~~typescript
// Object Shape (Similar to Interface)
type Product = {
  title: string;
  price: number;
};

// Union Type (Interfaces CANNOT do this)
type Status = "Pending" | "Completed" | "Failed";

// Primitive Alias
type UID = string | number;
~~~

### 4. Index Signatures (Dynamic Keys)
Used when you don't know the exact property names upfront, but you know the "shape" of the keys and values.

~~~typescript
interface SalaryDictionary {
  [employeeName: string]: number; // The key is a string, the value MUST be a number
}

const salaries: SalaryDictionary = {
  "Amit": 650000,
  "Neha": 720000,
  // "Rahul": "Pending" // ERROR: Type 'string' is not assignable to type 'number'.
};
~~~

---

## ⚛️ MERN Stack Integration

### 1. React Frontend (Typing Props & State)
In React, you will constantly use Interfaces/Types to define the props your components accept.

~~~typescript
import React, { useState } from 'react';

// Best Practice: Use Interfaces for Component Props
interface ButtonProps {
  label: string;
  onClick: () => void;
  isDisabled?: boolean; 
}

const CustomButton: React.FC<ButtonProps> = ({ label, onClick, isDisabled = false }) => {
  return (
    <button onClick={onClick} disabled={isDisabled}>
      {label}
    </button>
  );
};
~~~

### 2. Node.js / Express Backend (Typing Requests & DB Models)
In Express, you use interfaces to strongly type the `req.body` so you get IntelliSense when accessing incoming payload data.

~~~typescript
import { Request, Response } from 'express';

interface CreateUserBody {
  username: string;
  email: string;
  role?: "Admin" | "User";
}

// Typing the Express Request object: Request<Params, ResBody, ReqBody, ReqQuery>
export const createUser = (req: Request<{}, {}, CreateUserBody>, res: Response) => {
  const { username, email, role } = req.body;
  
  // TS knows exactly what properties exist on req.body now!
  if (!username || !email) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  
  res.status(201).json({ message: `User ${username} created!` });
};
~~~

---

## 🎯 Interview "Gotchas" & FAQs

* **The Golden Question: "What is the exact difference between an Interface and a Type?"**
  * **Answer 1 (Declaration Merging):** Interfaces are "open". If you declare two interfaces with the exact same name, TypeScript will silently merge them into one. Types are "closed"; declaring two types with the same name throws an error.
  * **Answer 2 (Capabilities):** Types can represent Unions (`type ID = string | number`) and Primitives. Interfaces can only represent object shapes.
* **Trick Question: "Can a class implement a type?"**
  * **Answer:** Yes! A class can implement a type alias (`class Car implements IVehicle`), *unless* the type is a Union type.
* **Conceptual: "What is the difference between `readonly` and `const`?"**
  * **Answer:** `const` is used for variables (values). `readonly` is used for properties inside an object or class interface.

---

## 💻 Coding Assessment Patterns

### Pattern 1: The Declaration Merging Trap
Assessments often test if you know how interfaces behave when redefined.



~~~typescript
interface Window {
  title: string;
}

interface Window {
  tsVersion: number;
}

// What is the type of Window now?
const myObj: Window = {
  title: "Main",
  tsVersion: 5.2 // It REQUIRES both! The interfaces merged.
};
~~~

### Pattern 2: Intersection Types vs Extends
How do you achieve "inheritance" with `type`? You use the intersection (`&`) operator.

~~~typescript
type BaseUser = { id: number };
type Admin = BaseUser & { role: string }; // The Type equivalent of 'extends'

const myAdmin: Admin = { id: 1, role: "SuperAdmin" };
~~~

---

## 📊 Mental Model / Diagram

Memorize this comparison table. If an interviewer asks "Interface vs Type", reciting these differences shows deep expertise.

| Feature | `interface` | `type` (Type Alias) |
| :--- | :--- | :--- |
| **Primary Use Case** | Defining shapes of Objects/Classes | Aliasing primitives, unions, and objects |
| **Declaration Merging** | ✅ Yes (Auto-merges same names) | ❌ No (Throws duplicate identifier error) |
| **Inheritance** | Uses `extends` keyword | Uses Intersection (`&`) operator |
| **Union Types (`\|`)** | ❌ Cannot define unions | ✅ Yes |
| **Performance (TSC)** | Slightly faster for compiler to cache | Marginally slower in massive intersections |
| **MERN Best Practice** | Component Props, DB Schemas | State unions, utility transformations |