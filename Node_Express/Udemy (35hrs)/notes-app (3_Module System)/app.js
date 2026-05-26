// Import the built-in 'fs' module to work with the file system in Node.js
// ESM - ECMAScript module system - import fs from "fs"
// CJS - CommonJS module system
const fs=require("fs")

// Write into file with synchronous method 
// It will create a file if it does not exist and write the content into it. 
// If the file already exists, it will overwrite the existing content with the new content.
fs.writeFileSync("notes.txt","|| SHRI GANESHAY NAMAH ||")


// Append the content into file with synchronous method
// It will add the content at the end of the file without overwriting the existing content.
fs.appendFileSync("notes.txt","\n|| SHRI SWAMI SAMARTH ||")

// Import the custom module 'utils.js' using require function
// It will also run the code inside 'utils.js' 
// and export the value of 'name' variable to be used in this file.
const name=require("./utils.js")

console.log(name);

// Import the custom module 'notes.js' using require function
// It will also run the code inside 'notes.js' 
// and export the value of 'getNotes' function to be used in this file.
const getNotes=require("./notes.js")
console.log(getNotes());


// importing the npm modules 
// npm init - to create package.json file
// npm install validator - to install the 'validator' library 
// and add it as a dependency in package.json file
// Import the 'validator' npm library
const  validator=require("validator");
// Use the 'isEmail' method from the 'validator' library to check if the given string is a valid email address
console.log(validator.isEmail("demo@cognizant.com"))


// Import the 'chalk' npm library to style the terminal string output
const chalk=require("chalk")
console.log(chalk.bgYellow.bold.red("\n<<---------- JUST FOCUS ON THIS ---------->>\n"));

// Use the 'green' method from the 'chalk' library to style the string "Success !!" in green color 
// and log it to the console
console.log(chalk.green("Success !!"))
