# Inputs and Attributes

## The Universal Attributes

These attributes can be slapped onto practically any of the 22 input types.
| Attribute | Value Type                 | What It Does                                                                                                      |
|-----------|-----------------------------|---------------------------------------------------------------------------------------------------------------------|
| name      | String                      | The key used to identify the data when the form is submitted.                                                      |
| value     | String                      | The initial, default, or currently entered value of the input.                                                     |
| id        | String                      | A unique identifier, crucial for DOM manipulation (`getElementById`) and linking `<label>` tags.                   |
| disabled  | Boolean (`disabled`)        | Disables the input: it becomes grayed out, unclickable, and **its value is NOT submitted** with the form.          |
| readonly  | Boolean (`readonly`)        | Prevents editing, but still allows highlighting/copying. Value **IS submitted** with the form.                      |
| required  | Boolean (`required`)        | Prevents form submission if the field is empty or an option is not selected.                                        |
| autofocus | Boolean (`autofocus`)       | Automatically places the cursor inside this input when the page loads.                                              |
| form      | String (Form ID)            | Allows the input to belong to a `<form>` **even if placed outside** the `<form>` tag in the HTML structure.         |

## Textual & Search Inputs

**Types:** `text, password, email, search, tel, url`

These inputs are all about typing strings on a keyboard.

`text`: Standard single-line text.

`password`: Masks characters (usually with dots or asterisks).

`email`: Automatically validates that the string contains an "@" and a domain.

`url`: Automatically validates that the string is an absolute URL (e.g., http://...).

`tel`: Does not validate format automatically (because global phone formats vary wildly), but pops up the number pad on mobile phones.

`search`: Behaves like text, but browsers usually add an "x" icon to quickly clear the box.

### Attributes Specific to Textual Inputs:
| Attribute     | Value Type                     | Description                                                                                                         |
|---------------|--------------------------------|---------------------------------------------------------------------------------------------------------------------|
| placeholder   | String                         | Faded hint text inside the input box that disappears when the user starts typing.                                   |
| maxlength     | Number                         | The maximum number of characters the user is allowed to type.                                                        |
| minlength     | Number                         | Validation fails on submit if the entered text is shorter than this value.                                          |
| pattern       | Regex String                   | A Regular Expression the value must match to pass validation (e.g., pattern="\d{4}").                                |
| size          | Number                         | Sets the visual width of the input in characters (rarely used; CSS is preferred now).                               |
| autocomplete  | on, off, or token              | Tells the browser whether to use autofill suggestions (e.g., "email", "new-password", "username").                  |
| list          | String (Datalist ID)           | Connects the input to a `<datalist>` element that provides a dropdown of suggestions.                               |


## Numeric Inputs

**Types:** `number, range`

`number`: A text box that only accepts numbers and provides up/down spinner arrows.

`range`: Renders a sliding bar. The user cannot see the exact number they are selecting unless you use JavaScript to display it.

### Attributes Specific to Numeric Inputs:
| Attribute | Value Type             | Description                                                                                                              |
|-----------|-------------------------|--------------------------------------------------------------------------------------------------------------------------|
| min       | Number                  | The lowest allowed numerical value.                                                                                      |
| max       | Number                  | The highest allowed numerical value.                                                                                      |
| step      | Number or "any"         | Defines the interval between valid numbers. Example: step="5" → valid values are 0, 5, 10, 15…<br>Use step="any" to allow decimals. |

## Date & Time Inputs

**Types**: `date, datetime-local, month, week, time`

These trigger the browser's native calendar or clock UI.

`date`: Selects Year, Month, Day (YYYY-MM-DD).

`time`: Selects Hours and Minutes (HH:MM).

`datetime-local`: Selects Date and Time together (YYYY-MM-DDTHH:MM).

`month`: Selects Year and Month (YYYY-MM).

`week`: Selects Year and Week Number (YYYY-Www).

### Attributes Specific to Date/Time Inputs:
| Attribute | Value Type        | Description                                                                                                                           |
|-----------|--------------------|---------------------------------------------------------------------------------------------------------------------------------------|
| min       | Date/Time String   | The earliest allowed date/time. The format **must match the input type** (e.g., min="2026-01-01" for `type="date"`).                 |
| max       | Date/Time String   | The latest allowed date/time.                                                                                                         |
| step      | Number             | Defines the increment between valid values. Example: step="60" → 1‑minute steps; step="900" → 15‑minute steps for time inputs.       |

## Checkable Inputs

**Types**: `checkbox, radio`

`checkbox`: For binary yes/no, or selecting multiple options from a list.

`radio`: For selecting only one option from a mutually exclusive list. (Radio buttons must share the exact same name attribute to group together).

### Attributes Specific to Checkables:
| Attribute | Value Type         | Description                                                        |
|-----------|---------------------|--------------------------------------------------------------------|
| checked   | Boolean (`checked`) | Pre‑selects the checkbox or radio button when the page loads.      |

## Form Control Buttons

**Types**: `submit, reset, button, image`

`submit`: Submits the form data to the server/triggers the submit event.

`reset`: Instantly reverts every input inside the form back to its original default value.

`button`: A blank button. It does absolutely nothing unless you attach a JavaScript onclick event to it.

`image`: Acts exactly like a submit button, but uses an image for its visual design.

### Attributes Specific to Submission Buttons (submit, image):
These override the settings defined on the `<form>` tag itself!

| Attribute     | Value Type                 | Description                                                                                             |
|---------------|----------------------------|---------------------------------------------------------------------------------------------------------|
| formaction    | URL String                 | Overrides the `...` URL, sending the submission to a different endpoint.               |
| formenctype   | String                     | Overrides how the form data is encoded (e.g., `multipart/form-data` for file uploads).                 |
| formmethod    | GET or POST                | Overrides the `<form method="...">` attribute.                                                          |
| formnovalidate| Boolean (`formnovalidate`) | Skips all HTML validation rules (`required`, `pattern`, etc.) and submits immediately.                 |
| formtarget    | `_self`, `_blank`, etc.    | Overrides where the form's response will load (e.g., `_blank` opens results in a new tab).             |

### Attributes Exclusive to image:

`src`: The URL path to the image file.

`alt`: Alternative text for screen readers.

`width` / `height`: Dimensions in pixels.

---

## The Specialized Inputs

**Types**: `color, file, hidden`

`color`: Opens the system color wheel. Always returns a 7-character hex string (e.g., #ff0000). It does not support required or placeholder.

`hidden`: Completely invisible to the user. Used by developers to store database IDs or security tokens that need to be sent when the form submits, but shouldn't be edited by the user.

### Attributes Exclusive to file:
| Attribute | Value Type            | Description                                                                                           |
|-----------|------------------------|-------------------------------------------------------------------------------------------------------|
| accept    | String (MIME/Ext)      | Restricts what file types can be selected. Example: accept=".pdf, image/*"                            |
| multiple  | Boolean (`multiple`)   | Allows selecting more than one file (CTRL/Shift on desktop, multi-select on mobile).                 |
| capture   | user or environment    | On mobile devices, forces the camera to open directly: `user` = front camera, `environment` = rear.   |


## The Golden Rule of the accept Attribute

Before we look at the values, you must memorize this for your assessments and your career: The accept attribute is for User Experience (UX), NOT security. It tells the operating system's file picker to filter out wrong files to make the user's life easier. However, a user can easily click the dropdown in their file picker, select "All Files (.)", and upload a malicious .exe file anyway. You must always validate the file type again in JavaScript and on your backend server.

#### The 3 Ways to Write accept Values
You can define what files are allowed using three different formats. You can also mix and match them by separating them with a comma.

1. **File Extensions (The Easiest Way)**

    You simply list the exact file extensions you want, starting with a dot.
    **Example**: `accept=".png, .jpg, .jpeg"`

    Best for: Specific proprietary formats like Word documents or Photoshop files.

2. **Specific MIME Types (The Standard Way)**

    MIME (Multipurpose Internet Mail Extensions) types are official, standardized labels used by browsers and servers to identify files.
    **Example**: `accept="application/pdf, text/csv"`
    
    Best for: Ensuring broad compatibility across different operating systems that might handle file extensions weirdly.

3. **Wildcard MIME Types (The Broad Way)**
    
    You can use an asterisk * to accept an entire category of files without having to list every single format.
    **Example**: `accept="image/*"` (Allows PNG, JPG, GIF, WebP, SVG, etc.)

    Best for: Profile picture uploads or media galleries where the exact format doesn't matter as long as it is an image/video.

### The Ultimate accept Value Cheat Sheet
Here are the most common real-world scenarios you will face and the exact strings you should use.

| Scenario            | The Exact accept String                                                                                                                            | Notes                                                                                                                 |
|---------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| Any Image           | accept="image/*"                                                                                                                                    | Great for profile picture uploads.                                                                                    |
| Any Video           | accept="video/*"                                                                                                                                    | Ideal for video platforms.                                                                                            |
| Any Audio           | accept="audio/*"                                                                                                                                    | Perfect for music or podcast uploads.                                                                                 |
| Resumes / Docs      | accept=".pdf, .doc, .docx, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"            | `.docx` MIME type is long and hard to memorize; using just `.docx` is fine in most assessments.                       |
| Spreadsheets        | accept=".csv, .xls, .xlsx, text/csv, application/vnd.ms-excel"                                                                                      | Common for “Import Data” features.                                                                                    |
| Web Code            | accept=".html, .css, .js, text/html, text/javascript"                                                                                               | Useful for developer tools.                                                                                           |
| Zip Archives        | accept=".zip, application/zip"                                                                                                                      | Ideal for bulk uploads.                                                                                               |


### How to use it in practice (HTML + JS)

HTML
```HTML
<form id="resumeForm">
    <label>Upload Resume:</label>
    <input type="file" id="resume" accept=".pdf, .doc, .docx" required>
    <button type="submit">Submit</button>
</form>
```

JavaScript
```JavaScript
// JavaScript: The safety net
document.getElementById("resumeForm").addEventListener("submit", function(event) {
    event.preventDefault();
    
    let fileInput = document.getElementById("resume");
    
    // 1. Ensure a file was actually selected
    if (fileInput.files.length === 0) {
        console.log("Please select a file.");
        return;
    }

    let uploadedFile = fileInput.files[0];
    let fileName = uploadedFile.name;
    
    // 2. The JS Validation: Check the extension manually
    if (!fileName.endsWith(".pdf") && !fileName.endsWith(".doc") && !fileName.endsWith(".docx")) {
        console.log("Security Error: Invalid file type! Only PDF and Word docs allowed.");
        return;
    }
    
    console.log("File is valid and ready to be sent to the MERN backend!");
});
```