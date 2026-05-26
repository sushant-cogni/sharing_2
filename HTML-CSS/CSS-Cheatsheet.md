# 📘 GenC Next Technical Assessment: Core CSS & CSS3

> **Interviewer Note:** As a Senior Technical Interviewer assessing your readiness for a GenC Next role, I want to see that your CSS knowledge goes beyond just making things look pretty. You must demonstrate a deep understanding of the browser's rendering engine, layout architectures (Flexbox/Grid), the cascade, specificity, and performance implications of animations. Frameworks like Tailwind or Bootstrap are banned for this assessment; show me your raw CSS3 mastery.

## 🎯 The Core Concept

CSS3 is the latest evolution of the Cascading Style Sheets language, modularizing the specification to introduce powerful, native capabilities like responsive design (Media Queries), robust two-dimensional layouts (Grid), one-dimensional alignments (Flexbox), custom properties (Variables), and hardware-accelerated animations—all without relying on JavaScript.

---

## 🗣️ All Interview Questions

* **1. Explain the CSS Box Model and the critical importance of `box-sizing: border-box`.**
    
    * **Answer:** Every HTML element is represented as a rectangular box consisting of four layers: Content, Padding, Border, and Margin. By default (`box-sizing: content-box`), adding padding or borders increases the total size of the element, which breaks layouts. `box-sizing: border-box` forces the browser to absorb padding and borders *into* the declared width and height, keeping element sizing predictable.

* **2. What is the fundamental difference between CSS Flexbox and CSS Grid?**
    
    * **Answer:** Flexbox is a **one-dimensional** layout model; it is designed to align items in a single row or a single column, distributing space and handling wrapping dynamically. CSS Grid is a **two-dimensional** layout model; it is designed to govern both rows and columns simultaneously, allowing for complex, grid-based page architectures. Use Grid for the overall page skeleton, and Flexbox for aligning components within that skeleton.

* **3. Explain how CSS Specificity is calculated.**
    
    * **Answer:** Specificity determines which CSS rule wins when multiple rules target the same element. It's calculated using a weight system (Inline Styles > IDs > Classes/Pseudo-classes/Attributes > Elements/Pseudo-elements). `!important` overrides everything and is generally considered a bad practice/red flag because it breaks the natural cascade and makes debugging highly difficult. 

* **4. Describe the difference between `position: relative`, `absolute`, `fixed`, and `sticky`.**
    
    * **Answer:** * `relative`: Positioned relative to its *normal* position in the document flow. (Leaves a gap where it would have been).
        * `absolute`: Removed from normal document flow. Positioned relative to its *closest positioned ancestor* (an ancestor with anything other than `position: static`).    
        * `fixed`: Removed from flow. Positioned relative to the *viewport* (the browser window). Stays in place during scrolling.    
        * `sticky`: Toggles between `relative` and `fixed` depending on the scroll position. It acts relative until it hits a defined offset (e.g., `top: 0`), then "sticks" to the screen.

* **5. What is the difference between CSS Transitions and CSS Animations (@keyframes)?**
    * **Answer:** Transitions require a trigger (like a `:hover` state or JavaScript adding a class) to transition explicitly from state A to state B. Animations (`@keyframes`) do not require a trigger; they can run automatically, loop infinitely, and define multiple complex intermediate waypoints (0%, 50%, 100%) throughout the animation sequence.

---

## 💻 Syntax & Examples

### 1. The "Holy Grail" CSS Reset & CSS Variables
A Senior Dev expects you to reset browser defaults and use native variables for a maintainable design system.

~~~css
/* 1. Global Reset */
*, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

/* 2. CSS Variables (Custom Properties) declared on the root */
:root {
    --primary-color: #2563eb;
    --surface-color: #ffffff;
    --text-main: #1f2937;
    --spacing-md: 1.5rem;
}

/* Usage */
body {
    background-color: var(--surface-color);
    color: var(--text-main);
    padding: var(--spacing-md);
}
~~~

### 2. CSS Grid: Complex Page Layout
Demonstrating a 2D layout without using a single div for rows/columns.


~~~css
.dashboard-layout {
    display: grid;
    /* 3 columns: fixed sidebar, fluid content, fixed right panel */
    grid-template-columns: 250px 1fr 300px;
    /* 2 rows: auto-sized header, remaining height for main area */
    grid-template-rows: auto 1fr;
    /* Naming areas for semantic assignment */
    grid-template-areas: 
        "header header header"
        "sidebar main-content right-panel";
    min-height: 100vh;
    gap: 1rem;
}

header { grid-area: header; }
aside.left { grid-area: sidebar; }
main { grid-area: main-content; }
aside.right { grid-area: right-panel; }
~~~

### 3. Flexbox: The Perfect Centering Trick
The classic interview question: "How do you center a div horizontally and vertically?"

~~~css
.parent-container {
    display: flex;
    justify-content: center; /* Centers horizontally on the main axis */
    align-items: center;     /* Centers vertically on the cross axis */
    height: 100vh;           /* Parent must have height to center vertically */
}

.child-element {
    /* Optionally allow it to grow/shrink */
    flex: 0 1 auto; 
}
~~~

### 4. CSS3 Animations (@keyframes) & Pseudo-classes
Hardware-accelerated animations using transform (which avoids triggering expensive browser repaints).

~~~css
/* Define the animation waypoints */
@keyframes pulse-glow {
    0% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7);
    }
    50% {
        transform: scale(1.05);
        box-shadow: 0 0 0 10px rgba(37, 99, 235, 0);
    }
    100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(37, 99, 235, 0);
    }
}

.submit-btn {
    background-color: var(--primary-color);
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    /* Smooth transition for normal hover states */
    transition: background-color 0.3s ease;
}

/* Trigger complex animation on focus/active state */
.submit-btn:focus, .submit-btn:active {
    outline: none;
    /* name | duration | timing-function | iteration-count */
    animation: pulse-glow 1.5s infinite; 
}
~~~

### 5. Responsive Design with Media Queries
Using standard breakpoint architecture.


~~~css
/* Base styles (Mobile-first approach) */
.product-grid {
    display: grid;
    grid-template-columns: 1fr; /* 1 column on mobile */
    gap: 1rem;
}

/* Tablet and larger */
@media screen and (min-width: 768px) {
    .product-grid {
        grid-template-columns: repeat(2, 1fr); /* 2 columns */
    }
}

/* Desktop and larger */
@media screen and (min-width: 1024px) {
    .product-grid {
        grid-template-columns: repeat(4, 1fr); /* 4 columns */
    }
}
~~~