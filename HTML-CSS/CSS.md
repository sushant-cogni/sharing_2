
Here you go! 🎉\ I have converted your entire DOM + CSS + JavaScript Master Cheat Sheet into perfect, clean, copy‑paste‑ready Markdown (.md) format exactly as you requested.
You can copy this as-is into a .md file and it will format beautifully.


DOM + CSS + JavaScript Master Cheat Sheet (Enterprise MERN-Level)
To master DOM manipulation in a MERN stack environment (especially for enterprise-level assessments), you must focus on CSS properties that control visibility, layout, visual feedback, and dynamic movement.
This cheat sheet is optimized for JavaScript-driven UI interactions.


🚨 The Golden Rule of JS + CSS: camelCase
CSS uses kebab-case:
background-color    z-index    font-size
JavaScript uses camelCase:
element.style.backgroundColor    element.style.zIndex    element.style.fontSize
Because in JS, a hyphen means "subtract".


Part 1: Toggling & Visibility (The Most Heavily Tested)
These properties are used constantly in JS to show/hide modals, dropdowns, tooltips, banners, and error messages.

CSS Property	JS element.style	Common Values	What it does / When to use
display	display	none, block, flex, grid	Fully hides/shows elements. Removes from layout when none.
visibility	visibility	visible, hidden	Hides visually but keeps element space.
opacity	opacity	0 to 1	Fades content in/out (works well with transitions).

JS Example — Toggle Error Message
let errorDiv = document.getElementById("error-msg");
errorDiv.style.display = "block";



Part 2: Visual Feedback & Validation
Used for warnings, errors, success states, active selections, fields in focus, etc.

CSS Property	JS Name	Common Values	Use Case
color	color	red, green	Change text color based on validation state.
background-color	backgroundColor	any color	Highlight invalid inputs or selections.
border	border	2px solid red	Draw attention to error fields.
box-shadow	boxShadow	glows, shadows	Hover effects or active UI states.
outline	outline	2px solid blue	Accessibility focus styling.

JS Example — Validation Feedback
let input = document.getElementById("username");
if (input.value === "") {
    input.style.border = "2px solid red";
    input.style.backgroundColor = "#ffe6e6";
}



Part 3: Positioning (Modals, Tooltips, Overlays)
Critical for building interactive UI components.

CSS Property	JS Name	Common Values	Purpose
position	position	static, absolute, fixed, sticky	Set element positioning method.
top, bottom	top, bottom	px, %, 0	Vertical placement.
left, right	left, right	px, %, 0	Horizontal placement.
z-index	zIndex	1–9999	Control stacking order (modals, popups).

JS Example — Tooltip Following Mouse
document.addEventListener("mousemove", function(event) {
    let tooltip = document.getElementById("myTooltip");
    tooltip.style.position = "absolute";
    tooltip.style.left = event.pageX + 15 + "px";
    tooltip.style.top = event.pageY + 15 + "px";
});



Part 4: Box Model (Dynamic Resizing)
Frequently needed when writing auto-resizing UIs or interactive components.

CSS Property	JS Name	What It Does
width, height	width, height	Sets element size (px or %).
margin	margin	Space outside element.
padding	padding	Space inside element.
box-sizing	boxSizing	Controls how width is calculated.



Part 5: CSS3 Dynamic Polish (Movement, Animation, UI Delight)
Perfect for smooth, responsive animations.

CSS Property	JS Name	Common Values	Use Case
transition	transition	all 0.3s ease	Smooth animation triggers.
transform	transform	scale/rotate/translate	Hardware-accelerated motion.
cursor	cursor	pointer, grab	Change mouse pointer.
pointer-events	pointerEvents	auto, none	Disable/enable clickability.

Smooth Hover Animation
CSS
.card {
    transition: transform 0.3s ease;
}

JavaScript
let card = document.getElementById("profileCard");
card.addEventListener("mouseenter", () => {
    card.style.transform = "scale(1.05)";
});
card.addEventListener("mouseleave", () => {
    card.style.transform = "scale(1)";
});



Part 6: Flexbox (1‑D Layouts)
Used for navbar alignment, form rows, dashboards, menus.

CSS Property	JS Name	Common Values
display: flex	display	flex
flex-direction	flexDirection	row, column
justify-content	justifyContent	center, space-between
align-items	alignItems	center, stretch
flex-wrap	flexWrap	wrap, nowrap
gap	gap	px, rem

Example — Switch to Mobile Layout
dashboard.style.flexDirection = "column";



Part 7: CSS Grid (2‑D Layouts)
Perfect for dashboards, galleries, product cards.

CSS Property	JS Name	Purpose
display: grid	display	Enable grid.
grid-template-columns	gridTemplateColumns	Set column structure.
grid-template-rows	gridTemplateRows	Set row structure.
grid-column	gridColumn	Span columns.
gap	gap	Row/column spacing.

Example — Dynamic Grid
photoGallery.style.gridTemplateColumns = `repeat(${imageCount}, 1fr)`;



Part 8: Borders & Edges (Validation & UI Depth)

CSS Property	JS Name	Use Case
border	border	Input validation.
border-radius	borderRadius	Rounded corners / avatars.
outline	outline	Keyboard focus.
box-shadow	boxShadow	Elevation/shadows.



Part 9: Typography & Text Formatting

CSS Property	JS Name	Common Values	Use Case
font-family	fontFamily	Arial, sans-serif	UI branding.
font-size	fontSize	px, rem	Scaling text dynamically.
font-weight	fontWeight	bold, 600	Prioritizing content.
text-align	textAlign	left, center	Align text inside containers.
text-decoration	textDecoration	underline, line-through	To‑Do checkoff, links.
color	color	any color	Text color.



Part 10: Form-Specific CSS (Very Important)

CSS Property	JS Name	Purpose
appearance	appearance	Remove native browser UI.
resize	resize	Control textarea resizing.
caret-color	caretColor	Change typing cursor color.
accent-color	accentColor	Change checkbox/radio color.

Example — To-Do List Completed
taskLabel.style.textDecoration = "line-through";
taskLabel.style.color = "gray";



✔ Best Practice Reminder
Prefer:
element.classList.add()
element.classList.remove()
element.classList.toggle()

over writing many inline styles.


If you want, I can also generate:
✅ A printable PDF\ ✅ A compact 1‑page summary\ ✅ A real interview-style DOM challenge\ ✅ A React version of this cheat sheet
Just tell me!
