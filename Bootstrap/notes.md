# React State Basics

Today I learned about the `useState` hook. It is incredibly useful for managing dynamic data inside functional components.

## Key Rules to Remember
* Always import `useState` from the React library.
* **Never** modify the state variable directly (e.g., `count = 1`). Always use the setter function!

## Code Example: A Simple Counter

Here is how you write a basic counter component:

```jsx
import React, { useState } from 'react';

function Counter() {
  // Declare a state variable named "count", initialized to 0
  const [count, setCount] = useState(0);

  return (
    <div className="counter-box">
      <h2>Current Count: {count}</h2>
      <button onClick={() => setCount(count + 1)}>
        Add +1
      </button>
    </div>
  );
}

export default Counter;