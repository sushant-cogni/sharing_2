# 📘 GenC Next Technical Assessment: Core HTML & HTML5

> **Interviewer Note:** As a Senior Technical Interviewer, I expect GenC Next candidates to move past basic tag memorization. You need to demonstrate a deep understanding of browser rendering, DOM manipulation, accessibility, and native APIs. We are evaluating pure, vanilla web technologies today—no frameworks to hide behind.

## 🎯 The Core Concept

HTML is the foundational markup language that defines the structural skeleton and semantics of a web page. HTML5 evolved this basic structure into a robust, client-side application platform by introducing semantic elements for machine-readability (SEO/Accessibility) and standardizing native JavaScript APIs for multimedia, offline storage, and hardware access.

---

## 🗣️ All Interview Questions

* **1. What is the fundamental difference between HTML and HTML5?**
    * **Answer:** HTML4 was strictly for defining document structure and relied heavily on third-party plugins (like Flash) for multimedia. HTML5 introduced native multimedia tags (`<audio>`, `<video>`), semantic structural tags (`<nav>`, `<article>`), native form validation, and powerful JavaScript APIs (Web Storage, Geolocation, Canvas, WebSockets) directly into the browser specification.

* **2. Why should we use Semantic HTML instead of `<div>` tags for everything?**
    * **Answer:** `<div>` and `<span>` are non-semantic; they tell the browser nothing about their content. Semantic tags (like `<header>`, `<main>`, `<aside>`, `<time>`) provide meaningful context. This is critical for two reasons: **Accessibility (a11y)**, allowing screen readers to navigate the DOM intelligently, and **SEO**, helping search engine crawlers accurately index the page's hierarchy.

* **3. Explain the difference between `<script>`, `<script async>`, and `<script defer>`.**
    
    * **Answer:** * `<script>`: The HTML parser stops entirely, downloads the script, and executes it before resuming parsing. (Render-blocking).
        * `<script async>`: The script downloads in the background while parsing continues, but the parser pauses to execute it the moment it finishes downloading. Order of execution is not guaranteed.    
        * `<script defer>`: The script downloads in the background but *waits* to execute until the HTML parser is completely finished. Scripts execute in the exact order they appear in the document. This is generally the best practice.

* **4. What are `data-*` attributes and how do you access them in JavaScript?**
    * **Answer:** They allow developers to store custom, private data directly on standard HTML elements without using non-standard attributes. Under the hood, they are accessed in JavaScript via the `HTMLElement.dataset` property.

* **5. How does the browser construct the DOM?**
    
    * **Answer:** The browser reads the raw HTML bytes, converts them to characters, tokenizes them into standard HTML tags, converts tokens into objects (Nodes), and finally links these nodes in a tree data structure called the Document Object Model (DOM).

* **6. Compare `localStorage`, `sessionStorage`, and Cookies.**
    
    * **Answer:** * **Cookies:** Small (4KB), sent to the server with every HTTP request, used primarily for session identifiers and authentication.
        * **sessionStorage:** Larger (~5MB), stores data locally on the client, but data is completely wiped the moment the specific browser tab or window is closed.
        * **localStorage:** Same capacity as sessionStorage (~5MB), but data persists indefinitely until explicitly cleared via JavaScript or browser cache deletion.

---

## 💻 Syntax & Examples

### 1. Semantic HTML5 Document Structure
Properly outlining a document for screen readers and SEO without relying on "div soup".

~~~html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Semantic Page</title>
</head>
<body>
    <header>
        <nav>
            <ul>
                <li><a href="#home">Home</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <article>
            <header>
                <h1>Understanding the DOM</h1>
                <time datetime="2026-03-04">March 4, 2026</time>
            </header>
            <section>
                <p>The DOM represents the page so that programs can change the document structure, style, and content.</p>
            </section>
        </article>
        
        <aside>
            <h2>Related Topics</h2>
            <p>Learn about the CSSOM next.</p>
        </aside>
    </main>

    <footer>
        <p>&copy; 2026 Tech Interview Prep</p>
    </footer>
</body>
</html>
~~~

### 2. Leveraging `data-*` Attributes with Vanilla JS
A common interview test to see if you can bridge HTML markup and JavaScript logic cleanly.

~~~html
<button 
    id="track-btn" 
    data-action="purchase" 
    data-item-id="8472" 
    data-user-tier="premium">
    Buy Now
</button>

<script>
    const btn = document.getElementById('track-btn');
    
    btn.addEventListener('click', function(event) {
        // Accessing data attributes via the dataset API
        // Note how kebab-case (data-item-id) becomes camelCase (itemId)
        const action = event.target.dataset.action;
        const itemId = event.target.dataset.itemId;
        const tier = event.target.dataset.userTier;

        console.log(`User mapped to tier ${tier} performed ${action} on item ${itemId}`);
    });
</script>
~~~

### 3. HTML5 Native Form Validation
Before reaching for JavaScript, a Senior developer expects you to utilize built-in browser validations to prevent unnecessary scripting.

~~~html
<form id="registration-form" action="/submit" method="POST">
    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required>

    <label for="pin">Security PIN (6 digits):</label>
    <input type="text" id="pin" name="pin" pattern="\d{6}" title="Must be exactly 6 digits" required>

    <label for="age">Age:</label>
    <input type="number" id="age" name="age" min="18" max="120" required>

    <button type="submit">Register</button>
</form>
~~~