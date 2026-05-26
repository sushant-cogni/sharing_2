const chalk=require("chalk")
const {addNote, removeNote, listNotes, readNote} = require("./notes.js")

console.log(chalk.bgGreen.bold("\nCommand Line Arguments:\n"));

// process.argv is an array(vector) that contains the command-line arguments passed 
// when the Node.js process was launched. 
// The first element (index 0) is the path to the Node.js executable, 
// and the second element (index 1) is the path to the JavaScript file being executed. 
// Any additional elements (starting from index 2) are the command-line arguments passed by the user.
console.log(process.argv);

// To access specific command-line arguments, you can use their respective indices.
console.log(process.argv[2]);

// If you run the script with additional arguments, for example:
// node app.js arg1 arg2 arg3
console.log(process.argv[3]);

// You can also loop through the arguments starting from index 2 to access all user-provided arguments.
for(let i=2;i<process.argv.length;i++)
    console.log(process.argv[i]);


console.log(chalk.bgYellow.bold("\n<<-------------- We are here -------------->>\n"));

console.log(chalk.bgGreen.bold("\nyargs library for handling command-line arguments\n"));
const yargs=require("yargs")

// yargs.argv is an object that contains the parsed command-line arguments. 
// Each property of this object corresponds to a command-line argument, 
// and its value is the value provided for that argument.
// For example, if you run the script with the following command:
// node app.js --name=John --age=30
// Then yargs.argv will be an object like this: 
// { name: 'John',
// age: 30,
// _: [], // This array contains non-hyphenated arguments
// '$0': 'app.js' // This property contains the name of the script being executed
// }
console.log(yargs.argv);

// It provides two commands like --help and --version by default.
// To change the version of your application manually using yargs, 
// you can use the yargs.version() method.
yargs.version('1.1.0');

// To define a command using yargs, you can use the yargs.command() method.
// The yargs.command() method takes an object as an argument, 
// which defines the command's name, description, and handler function.
// It will be excuted when user runs the command in terminal like: node app.js add
yargs.command({
    command:"add",
    describe:"Add a new note",
    // The builder property is used to define the options (arguments) that the command accepts.
    // It allows you to specify the expected arguments, their types, and whether they are required or optional.
    builder:{
        title:{
            describe:"Note Title",
            demandOption:true,
            type:"string",
        },
        body:{
            describe:"Note Body",
            demandOption:true,
            type:"string",
        }
    },
    handler:(argv) => {
        console.log(chalk.bold("Adding a new note..."));
        console.log("Title: "+argv.title);
        console.log("Body: "+argv.body);

        // Here, we are calling the addNote function from the notes.js module 
        // and passing the title and body as arguments.
        addNote(argv.title,argv.body);
    }
}) 

yargs.command({
    command: "remove",
    describe:"Remove a note",
    builder:{
        title:{
            describe:"Note Title",
            demandOption:true,
            type:"string"
        }
    },
    // The handler function is responsible for executing the logic when the "remove" command is invoked.
    // In this case, we are destructuring the title property from the arguments (argv) object 
    // and using it to remove a note.
    handler: ({title}) => {
        console.log(chalk.bold("Removing a note..."));

        removeNote(title);
    }
})

yargs.command({
    command: "list",
    describe:"List notes",
    handler: () => {
        console.log(chalk.bold.inverse("\n Your Notes \n"));
        listNotes();
    }
})

yargs.command({
    command: "read",
    describe:"Read a note",
    builder:{
        title:{
            demandOption:true,
            type:"string",
            describe:"Note Title"
        }
    },
    handler: ({title}) => {
        console.log(chalk.bold("Reading a note..."));
        readNote(title);
    }
})

// This method is used to parse the command-line arguments and execute the appropriate command handler based on the user's input.
yargs.parse(); 
// If you don't call yargs.parse(), yargs will automatically parse the arguments when you access yargs.argv.
// console.log(yargs.argv);
