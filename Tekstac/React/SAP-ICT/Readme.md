# E-Learning Platform Assessment 

Hi there! Welcome to my E-Learning Platform project. This is a responsive, table-less web interface built strictly with HTML, CSS, JavaScript, and Bootstrap 5 (no third-party plugins used). 

It features a functional Sign-In page that validates specific user credentials and a responsive Home page with a carousel and mobile-friendly hamburger menu.

## Project Structure

Here is how the project files are organized:

```text
/e-learning-platform
│
├── index.html       # The Sign-In page (your starting point!)
├── home.html        # The main dashboard/home page
├── style.css        # Custom styles matching the design specs
├── script.js        # The vanilla JavaScript handling the login logic
└── /images          # Contains all logos, banners, and icons used in the UI
```

## How to Test It

Testing the project is super easy. Just follow these steps:

1. **Launch the App:** Double-click on index.html to open it in any modern web browser.

2. **Test the Validation (Failure):** Try clicking "Sign In" with empty fields or random text. You should get a standard browser alert saying the credentials are incorrect, and you'll stay on the page.

3. **Test the Validation (Success):** To log in, use the exact credentials required by the spec:

        User Name: Cognizant

        Password: Hello123

4. **Explore the Home Page:** Once logged in, you'll be redirected to home.html. Click through the carousel to see the different text content keeping the same banner image.

5. **Check Responsiveness:** Resize your browser window (or press F12 and toggle Device Toolbar in Chrome) to simulate Tablet and Mobile views.


Notice how the Sign-In page layout stacks cleanly.
On the Home page, shrink the window to watch the desktop navigation gracefully collapse into a clickable Hamburger menu!

## Built With
- HTML5 & CSS3

- Vanilla JavaScript (for login validation)

- Bootstrap 5.3 (for the grid system, responsiveness, and carousel)