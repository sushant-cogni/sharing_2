# 📘 TypeScript Mastery: Classes (Object-Oriented TS)

## 🧠 The Core Concept

### What are TypeScript Classes?
TypeScript classes bring traditional Object-Oriented Programming (OOP) concepts—like encapsulation, inheritance, and abstraction—to JavaScript. While standard JS has classes, TypeScript supercharges them with static typing and strict access controls.



### Why do they exist and what problem do they solve?
In vanilla JavaScript, everything inside a class is inherently public (accessible from anywhere) unless you use relatively new and clunky native features. TypeScript solves this by providing strict contracts (Interfaces), hiding internal logic (Access Modifiers), and providing blueprints that force other developers to write code a specific way (Abstract Classes). This prevents developers from accidentally mutating critical internal state directly.

---

## ⚙️ Syntax & All Variants

### 1. Access Modifiers (`public`, `private`, `protected`)
These keywords control where a property or method can be accessed.



~~~typescript
class Employee {
  public name: string;             // Accessible anywhere (Default)
  protected department: string;    // Accessible in this class AND subclasses
  private salary: number;          // Accessible ONLY inside this class

  constructor(name: string, dept: string, salary: number) {
    this.name = name;
    this.department = dept;
    this.salary = salary;
  }

  public getDetails() {
    return `${this.name} works in ${this.department} earning ${this.salary}`;
  }
}

const dev = new Employee("Rahul", "Engineering", 675000);
console.log(dev.name);       // Valid
// console.log(dev.department); // ERROR: Property 'department' is protected.
// console.log(dev.salary);     // ERROR: Property 'salary' is private.
~~~

### 2. Constructor Parameter Properties (The Shorthand)
**Crucial Variant:** You can define and assign class properties directly inside the constructor signature. This is extremely common in enterprise code.

~~~typescript
class Developer {
  // Automatically creates and assigns 'id' and 'name'
  constructor(private readonly id: number, public name: string) {}
}
~~~

### 3. Readonly Properties
Prevents modification after the property is initialized in the constructor.

~~~typescript
class Config {
  readonly apiKey: string;
  constructor(key: string) {
    this.apiKey = key; // Valid here
  }
  updateKey(newKey: string) {
    // this.apiKey = newKey; // ERROR: Cannot assign to 'apiKey' because it is a read-only property.
  }
}
~~~

### 4. Getters and Setters (`get`, `set`)
Used to intercept access to a property. Useful for validation or transforming data on the fly.

~~~typescript
class BankAccount {
  private _balance: number = 0; // Convention: prefix private backing fields with '_'

  get balance(): number {
    return this._balance;
  }

  set balance(amount: number) {
    if (amount < 0) throw new Error("Balance cannot be negative!");
    this._balance = amount;
  }
}

const myAccount = new BankAccount();
myAccount.balance = 5000; // Calls the setter
console.log(myAccount.balance); // Calls the getter
~~~

### 5. Abstract Classes
An abstract class is a base class that cannot be instantiated directly. It requires subclasses to inherit from it and implement its abstract methods.

~~~typescript
abstract class Database {
  // Concrete method (shared logic)
  connect() { console.log("Connecting to DB..."); }
  
  // Abstract method (forced implementation in subclasses)
  abstract save(data: any): void; 
}

// const db = new Database(); // ERROR: Cannot create an instance of an abstract class.

class MongoDatabase extends Database {
  save(data: any) {
    console.log("Saving to MongoDB: ", data);
  }
}
~~~

### 6. Implementing Interfaces
Enforces that a class strictly adheres to a predefined contract.

~~~typescript
interface Logger {
  log(message: string): void;
}

class FileLogger implements Logger {
  log(message: string) {
    console.log(`Writing to file: ${message}`);
  }
}
~~~

---

## ⚛️ MERN Stack Integration

### 1. Node.js / Express Backend (Controllers & Services)
In robust Express backends, you rarely write loose functions. You organize logic into Object-Oriented Service and Controller classes.



~~~typescript
import { Request, Response } from 'express';

// 1. Interface Contract
interface IUserService {
  getUser(id: string): string;
}

// 2. Service Class implementing Contract
class UserService implements IUserService {
  // Private array simulating a database
  private users: string[] = ["Admin", "Dev", "Manager"];

  public getUser(id: string): string {
    return this.users[parseInt(id)] || "Not Found";
  }
}

// 3. Controller Class using the Service via Constructor Injection
export class UserController {
  constructor(private userService: UserService) {}

  public handleGetRequest = (req: Request, res: Response) => {
    const user = this.userService.getUser(req.params.id);
    res.json({ user });
  }
}

// Setup Route
// const userService = new UserService();
// const userController = new UserController(userService);
// app.get('/users/:id', userController.handleGetRequest);
~~~

### 2. React Frontend (API Service Singletons)
While React uses functional components, OOP is perfect for extracting API logic out of the UI layer.

~~~typescript
class ApiService {
  private static instance: ApiService;
  private readonly baseUrl: string = "https://api.example.com";

  private constructor() {} // Prevents external instantiation

  // Singleton Pattern
  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  public async fetchData(endpoint: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${endpoint}`);
    return response.json();
  }
}

// Inside a React Component/Hook:
// const data = await ApiService.getInstance().fetchData('users');
~~~

---

## 🎯 Interview "Gotchas" & FAQs

* **The Golden Question: "What is the difference between an Abstract Class and an Interface?"**
    * **Answer:** An Interface is purely a contract; it contains zero implementation logic and disappears entirely when compiled to JavaScript. An Abstract Class can contain actual logic (concrete methods) alongside abstract methods, and it remains in the compiled JavaScript as a standard class.
* **Gotcha 1: "Does TypeScript's `private` keyword actually hide data at runtime in the browser?"**
    * **Answer:** No! TypeScript's `private` is a compile-time check only. In the compiled JS, the property is fully accessible. To achieve true runtime privacy, you must use the native JavaScript `#` prefix (e.g., `#salary`).
* **Gotcha 2: "Can you define a return type for a `set` accessor?"**
    * **Answer:** No. A setter cannot have a return type annotation, not even `void`. The compiler will throw an error if you try: `set balance(amount: number): void { ... } // ERROR`.
* **Gotcha 3: "Can a class implement multiple interfaces? Can it extend multiple classes?"**
    * **Answer:** A class can implement multiple interfaces (`class User implements IAuditable, IDeletable`). However, it can only extend one class.

---

## 💻 Coding Assessment Patterns

### Pattern 1: The Constructor Parameter Shorthand Trap
Assessments often show code like this and ask what is wrong:

~~~typescript
class Car {
  constructor(public make: string, model: string) {}
}
const myCar = new Car("Toyota", "Corolla");
console.log(myCar.model); // ERROR!
~~~
* **Assessment Answer:** `model` is not accessible. Because it lacks an access modifier (`public`, `private`, or `readonly`) in the constructor signature, TypeScript treats it as a standard function argument, NOT a class property.

### Pattern 2: The Missing Abstract Implementation

~~~typescript
abstract class PaymentProcessor {
  abstract process(amount: number): void;
}

// ERROR: Non-abstract class 'StripeProcessor' does not implement inherited abstract member 'process'.
class StripeProcessor extends PaymentProcessor {
  // Forgot to implement process()
}
~~~

---

## 📊 Mental Model / Diagram

Memorize this access control matrix. It is the fastest way to answer scope-related questions in a high-pressure interview.

| Modifier | Inside the Class | Inside Subclasses (`extends`) | Outside the Class (Instances) |
| :--- | :--- | :--- | :--- |
| **`public`** (Default) | ✅ Yes | ✅ Yes | ✅ Yes |
| **`protected`** | ✅ Yes | ✅ Yes | ❌ No |
| **`private`** | ✅ Yes | ❌ No | ❌ No |
| **`#`** (Native JS Private) | ✅ Yes | ❌ No | ❌ No (Enforced at Runtime) |