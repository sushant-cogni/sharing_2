# 📘 GenC Next Technical Assessment: Bootstrap 5

> **Interviewer Note:** As a Senior Technical Interviewer assessing a GenC Next candidate, I expect you to know more than just copy-pasting code from the Bootstrap documentation. You must understand the underlying grid architecture, the transition away from jQuery, and how to leverage utility classes effectively to avoid bloated, custom CSS. 

## 🎯 The Core Concept

Bootstrap 5 is a mobile-first, component-based CSS framework and utility toolkit. Its most significant architectural shift from previous versions is the complete removal of jQuery in favor of pure vanilla JavaScript, resulting in a lighter, faster, and more modern framework for building responsive user interfaces.

---

## 🗣️ All Interview Questions

* **1. What are the major architectural differences between Bootstrap 4 and Bootstrap 5?**
    * **Answer:** The biggest change is the **removal of jQuery**. Bootstrap 5 uses pure vanilla JavaScript for all interactive components (modals, dropdowns). It also dropped support for Internet Explorer 10 & 11, introduced a new `xxl` (extra-extra-large) grid tier, and added a highly customizable Utility API inspired by Tailwind CSS.

* **2. Explain how the Bootstrap 5 Grid System works.**
    
    * **Answer:** It is a 12-column, Flexbox-based system. It strictly requires a three-tier hierarchy: a Container (`.container` or `.container-fluid`), which holds Rows (`.row`), which hold Columns (`.col-*`). The grid is mobile-first, meaning a class like `.col-md-6` applies 50% width on medium screens *and everything larger*, unless overridden by a larger breakpoint class.

* **3. What is the difference between `.container` and `.container-fluid`?**
    
    * **Answer:** `.container` provides a responsive, fixed-width container. Its `max-width` jumps at each specific breakpoint (sm, md, lg, xl, xxl) to keep content centered with margins. `.container-fluid` is constantly 100% width across all viewport sizes, spanning the entire screen edge-to-edge.

* **4. How do Bootstrap 5 Data Attributes (`data-bs-*`) work under the hood?**
    * **Answer:** Bootstrap's vanilla JavaScript scans the DOM for specific `data-bs-*` attributes (e.g., `data-bs-toggle="modal"`, `data-bs-target="#myModal"`). When triggered (like a click event), the JS intercepts it and manipulates the DOM to show/hide the component, entirely bypassing the need for you to write custom event listeners.

* **5. What are Utility Classes, and why are they preferred over custom CSS?**
    * **Answer:** Utilities are single-purpose, immutable CSS classes (e.g., `mt-3` for margin-top, `d-flex` for display flex, `text-center` for text alignment). They are preferred because they reduce the size of custom stylesheets, prevent CSS specificity wars, and speed up development by applying styles directly within the HTML markup.

---

## 💻 Syntax & Examples

### 1. The Responsive 12-Column Grid
A standard interview test: "Create a layout that is 1 column on mobile, 2 columns on tablets, and 4 columns on large desktops."

~~~html
<div class="container mt-4">
    <div class="row g-3"> 
        <div class="col-12 col-md-6 col-lg-3">
            <div class="p-3 bg-light border">Column 1</div>
        </div>
        
        <div class="col-12 col-md-6 col-lg-3">
            <div class="p-3 bg-light border">Column 2</div>
        </div>
        
        <div class="col-12 col-md-6 col-lg-3">
            <div class="p-3 bg-light border">Column 3</div>
        </div>
        
        <div class="col-12 col-md-6 col-lg-3">
            <div class="p-3 bg-light border">Column 4</div>
        </div>
    </div>
</div>
~~~