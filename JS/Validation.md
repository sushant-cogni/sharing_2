# Validation

### **The Golden Rules of JS Validation**
Before writing a single line of logic, memorize these rules for your assessments:

- **Always use `.trim()`**: Users accidentally copy-paste invisible spaces. Always trim string inputs before validating them, or an input with three spaces "   " might pass an "is not empty" check!

- **Prevent Default**: Always use `event.preventDefault()` on the form's submit event to stop the page from refreshing while you run your checks.

- **Fail Early (The Return trick)**: Instead of nesting massive if/else blocks, check for errors and use return false; immediately to stop the function.

- **Clear Errors**: Always clear previous error messages before running validations again, otherwise, the user will see old errors even after they fix them.

---

### **Validating Specific Input Types in JavaScript**

#### **1. Text Inputs (Names, Usernames, Titles)**

What to check: Is it empty? Is it too short/long? Does it contain invalid characters?

JavaScript
```JavaScript
let nameInput = document.getElementById("fullName").value.trim();

// 1. Empty Check
if (nameInput === "") {
    console.log("Name cannot be empty.");
}
// 2. Length Check
else if (nameInput.length < 3 || nameInput.length > 50) {
    console.log("Name must be between 3 and 50 characters.");
}
// 3. Character Check (Only letters and spaces allowed)
else if (!/^[a-zA-Z\s]+$/.test(nameInput)) {
    console.log("Name can only contain letters and spaces.");
}
```
---

#### **2. Passwords (Complexity)**

What to check: Length, and presence of uppercase, lowercase, numbers, and special characters.

JavaScript
```JavaScript
let password = document.getElementById("pwd").value;

// Pro-Tip: Use Regex "Lookaheads" (?=.*) to enforce rules regardless of order
// This regex means: Minimum 8 characters, at least one uppercase, one lowercase, and one number.
let strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

if (!strongPasswordRegex.test(password)) {
    console.log("Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number.");
}
```
---

#### **3. Numbers (Age, Price, Quantities)**

What to check: Is it actually a number? Is it within the allowed range?

Trap: HTML `<input type="number">` still returns a String in JavaScript! You must convert it.

JavaScript
```JavaScript
let ageString = document.getElementById("age").value;
let age = Number(ageString); // or parseInt(ageString, 10)

// 1. Check if it's empty or Not a Number (NaN)
if (ageString === "" || isNaN(age)) {
    console.log("Please enter a valid number.");
}
// 2. Range Bounds
else if (age < 18 || age > 100) {
    console.log("You must be between 18 and 100 years old.");
}
```
---

#### **4. Dropdowns (`<select>`)**

What to check: Did the user change it from the default placeholder?

HTML
```HTML
<select id="country">
    <option value="">--Select a Country--</option>
    <option value="IN">India</option>
</select>
```
JavaScript
```JavaScript
let selectedCountry = document.getElementById("country").value;

// Check against the exact value of the placeholder option
if (selectedCountry === "") {
    console.log("Please select a country from the list.");
}
```
---

#### **5. Checkboxes (Terms & Conditions)**

What to check: Is the .checked property true?

JavaScript
```JavaScript
let termsChecked = document.getElementById("agreeTerms").checked;

if (!termsChecked) {
    console.log("You must agree to the terms and conditions to proceed.");
}
```
---

#### **6. Radio Buttons (Gender, Payment Method)**

What to check: Did the user select at least one option from the group?

JavaScript
```JavaScript
// Get all radio buttons with the same name
let paymentOptions = document.getElementsByName("payment");
let isSelected = false;

for (let option of paymentOptions) {
    if (option.checked) {
        isSelected = true;
        break; // Stop looking once we find a checked one
    }
}

if (!isSelected) {
    console.log("Please select a payment method.");
}
```
---

#### **7. File Uploads (Images, Documents)**

What to check: Did they upload a file? Is the file size too big? Is it the wrong file type?

JavaScript
```JavaScript
let fileInput = document.getElementById("resumeUpload");

// 1. Check if a file was selected
if (fileInput.files.length === 0) {
    console.log("Please upload your resume.");
} else {
    let file = fileInput.files[0];
    let fileSizeInMB = file.size / (1024 * 1024); // Convert bytes to MB

    // 2. Check File Size (e.g., max 2MB)
    if (fileSizeInMB > 2) {
        console.log("File is too large. Maximum size is 2MB.");
    }
    
    // 3. Check File Type Extension
    if (!file.name.endsWith(".pdf") && !file.name.endsWith(".docx")) {
        console.log("Only PDF or DOCX files are allowed.");
    }
}
```
---

## **When to Validate (Event Listeners)**

Assessments will look at when you are firing your validation logic. You have three main strategies:
| Event  | How to Use It                                   | Best For                                                                                   |
|--------|--------------------------------------------------|----------------------------------------------------------------------------------------------|
| submit | Attach to the `<form>`. Fires when the user clicks the final submit button. | Standard assessments, required field validation, final full‑form checks.                     |
| input  | Attach to an `<input>`. Fires on **every keystroke**.           | Real‑time validation, password strength meters, live character counters (e.g., “140 remaining”). |
| blur   | Attach to an `<input>`. Fires when users click or tab **out** of the field. | Checking username availability or validating a field immediately after typing.               |


Example of a blur validation:

JavaScript
```JavaScript
let emailField = document.getElementById("email");

emailField.addEventListener("blur", function() {
    if (!this.value.includes("@")) {
        this.classList.add("error-border");
        console.log("Please fix your email format before moving on!");
    }
});
```
---

## A Pro-Level Validation Structure

If you are asked to write a complete validation script in an assessment, organize it cleanly using an array to collect errors. This is much better than popping up 5 different alerts one by one!

JavaScript
```JavaScript
document.getElementById("myForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Stop page reload

    let errors = []; // Array to store all error messages
    let errorDiv = document.getElementById("errorOutput");
    errorDiv.innerHTML = ""; // Clear old errors!

    // Gather Inputs
    let username = document.getElementById("user").value.trim();
    let age = Number(document.getElementById("age").value);
    
    // Run Checks
    if (username.length < 5) {
        errors.push("Username must be at least 5 characters.");
    }
    if (isNaN(age) || age < 18) {
        errors.push("You must be 18 or older.");
    }

    // Determine the Outcome
    if (errors.length > 0) {
        // Validation Failed! Display all errors.
        errorDiv.innerHTML = errors.join("<br>"); // Join array into a single string separated by line breaks
        errorDiv.style.color = "red";
    } else {
        // Validation Passed!
        errorDiv.innerHTML = "Form submitted successfully!";
        errorDiv.style.color = "green";
        // this.submit(); // Actually submit the form to the backend
    }
});
```