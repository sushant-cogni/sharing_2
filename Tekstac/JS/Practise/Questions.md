## Mock Assessment 1: "Vroom Car Rentals"
### Objective:
To work with JavaScript Regular Expressions, Date manipulation, and DOM element updates.

### Problem Description:
Vroom Car Rentals needs a web page to calculate rental costs and validate customer details. As a UI developer, your task is to validate the vehicle registration number, ensure the rental dates are logical, and calculate the final invoice.

### Requirements:
Assume the HTML is already provided with the following IDs: regNumber, pickupDate, returnDate, resultDiv.

| Function Name        | Description                                                                                                                                                                                                                                                                     |
|----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| validateRegNumber(regNum) | Validates the vehicle registration number. The format must be: **two uppercase letters**, followed by a hyphen, **two digits**, a hyphen, **two uppercase letters**, and **four digits**. Example: `TN-12-AB-3456`. Returns **true** if valid, otherwise **false**.                                |
| calculateDays(pickup, returnDt) | Accepts two date strings and returns the number of days between them. If the **pickup date is in the past** (before today) or the **return date is earlier than the pickup date**, the function returns **-1**.                                                          |
| generateInvoice()    | Triggered when the user clicks **Submit**. Steps: <br> 1. Fetch all input values using DOM IDs. <br> 2. Call `validateRegNumber`; if false, display **"Invalid Registration Number"** in `resultDiv`. <br> 3. Call `calculateDays`; if it returns -1, display **"Invalid Dates Selected"**. <br> 4. If both are valid, compute cost = days × 1500. <br> 5. Display **"Success! Your total rental cost is Rs. [cost]"** in `resultDiv`. |
---

## Mock Assessment 2: "TechCorp Asset Tracker"

### Objective:
To work with dynamic dropdown generation, Object creation, and Table manipulation.

### Problem Description:
TechCorp wants an internal tool to assign IT assets (Laptops, Monitors, etc.) to employees. You need to create a portal where selecting an asset category dynamically populates the available models, and assigning an asset adds it to an HTML table.

### Data Chart:

**Laptops:** `"Dell XPS", "ThinkPad T14", "MacBook Pro"`

**Monitors:** `"Dell 24-inch", "LG Ultrawide"`

**Accessories:** `"Wireless Mouse", "Mechanical Keyboard"`

### Requirements:
Assume the HTML provides a dropdown assetCategory, an empty dropdown assetModel, a text input empId, a submit button, and an empty table assetTable.

| Function Name                 | Description                                                                                                                                                                                                                                              |
|------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| populateModels()             | Triggered when `assetCategory` changes. It must **clear** the current options in `assetModel` and **populate** it with the correct models based on the Data Chart above.                                                                                 |
| createAssetObj(emp, category, model) | Creates and returns a JavaScript object using its parameters with keys: **EmployeeID**, **Category**, and **Model**.                                                                                                                         |
| assignAsset()                | Invoked on form submit. Steps: <br> 1) Fetch values from `empId`, `assetCategory`, and `assetModel`. <br> 2) If any field is empty, display **"Please fill all fields"** in a span. <br> 3) If `empId` does not start with **"EMP"**, display **"Invalid Employee ID"**. <br> 4) Invoke `createAssetObj` to get the object. <br> 5) Dynamically insert a **new row** at the bottom of `assetTable` showing **Employee ID**, **Category**, and **Model** from the object. |