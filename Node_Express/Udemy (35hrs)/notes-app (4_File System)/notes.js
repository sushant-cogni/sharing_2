const fs=require("fs")
const chalk=require("chalk")

// The addNote function is responsible for adding a new note to the "notes.json" file. 
// It takes two parameters: title and body, 
// which represent the title and content of the note, respectively.
const addNote = (title,body) =>{

    // Inside the addNote function, we first load the existing notes from the "notes.json" file using the loadNotes function. 
    const notes =loadNotes();

    // Then, we check for duplicate notes by filtering the existing notes based on the title. 
    // const duplicateNote= notes.filter(note => note.title===title);
    // Alternatively, we can use the find method to check for duplicates, 
    // which will return the first matching note or undefined if no match is found.
    const duplicateNote= notes.find(note => note.title===title);


    // If there are no duplicate notes (i.e., duplicateNote.length === 0), 
    // we push the new note (with title and body) into the notes array and save it back to the "notes.json" file using the saveNote function.
    // if(duplicateNote.length===0){

    // Using find method, we can simply check if duplicateNote is undefined to determine if there are no duplicates.
    if(!duplicateNote || duplicateNote==undefined){
        notes.push({
            title,
            body
        })

        saveNote(notes);
        console.log(notes);
    }

    // Finally, we log a success message to the console.
    console.log("Note added successfully!");
}

// The removeNote function is responsible for removing a note from the "notes.json" file based on the provided title.
// It takes a single parameter, title, which represents the title of the note to be removed.
const removeNote = (title) =>{
    
    // Inside the removeNote function, we first load the existing notes from the "notes.json" file using the loadNotes function.
    const notes=loadNotes();

    // Then, we check if there are any notes available. 
    // If there are no notes, we log a message and return.
    if(notes.length===0){
        console.log(chalk.bgRed("No notes found!"));
        return;
    }

    // Next, we filter the notes array to create an updatedNotes array that excludes the note with the specified title.
    const updatedNotes = notes.filter(note => note.title!==title);

    // If the length of the updatedNotes array is the same as the original notes array, 
    // it means that no note was found with the given title, 
    // and we log a message and return.
    if(updatedNotes.length===notes.length){
        console.log(chalk.red("No note found with the title: "+title));
        return;
    }

    
    // If a note was successfully removed, 
    // we save the updatedNotes array back to the "notes.json" file using the saveNote function and log a success message.
    saveNote(updatedNotes);

    console.log(chalk.green(title+ " Note removed successfully!"));
}

// The saveNote function is responsible for saving the notes to the "notes.json" file. 
// It takes a single parameter, note, which is the array of notes to be saved. 
// Inside the saveNote function, we convert the note array into a JSON string using JSON.stringify() 
// and then write it to the "notes.json" file using fs.writeFileSync().
const saveNote= (note) => {
    const dataJSON=JSON.stringify(note);
    fs.writeFileSync("notes.json",dataJSON);
}

// The loadNotes function is responsible for loading the existing notes from the "notes.json" file. 
// It uses a try-catch block to handle any potential errors that may occur while reading the file. 
// If the file is read successfully, it converts the data from a buffer to a string 
// and then parses it as JSON to return the notes array. 
// If there is an error (e.g., the file does not exist), it returns an empty array.
const loadNotes = () =>{
    try{
        const dataBuffer=fs.readFileSync("notes.json");
        const dataJSON=dataBuffer.toString();
        return JSON.parse(dataJSON);
    }catch(e){
        return [];
    }
}

// The listNotes function is responsible for listing all the notes stored in the "notes.json" file.
const listNotes = () =>{
    // Inside the listNotes function, we first load the existing notes using the loadNotes function.
    const notes=loadNotes();

    // Then, we check if there are any notes available. If there are no notes, we log a message and return.
    if(notes.length===0){
        console.log(chalk.bgRed("\nNo notes found!\n"));
        return;
    }

    // If there are notes available, we iterate through the notes array using forEach and log the title of each note to the console.
    notes.forEach( (note,i)=> console.log((i+1)+". "+note.title+"\n"));
}

// The readNote function is responsible for reading a specific note from the "notes.json" file based on its title.
// It takes a single parameter, title, which represents the title of the note to be read.
const readNote = (title) => {

    // Inside the readNote function, we first load the existing notes using the loadNotes function.
    const notes = loadNotes();

    // Then, we check if there are any notes available. If there are no notes, we log a message and return.
    if(notes.length===0){
        console.log(chalk.bgRed("\nNo notes found!\n"));
        return;
    }

    // Next, we use the find method to search for a note with the specified title in the notes array.
    // The find method will return the first matching note or undefined if no match is found.
    const note=notes.find(note => note.title===title);

    // If a note is found (i.e., note is not undefined), we log the title and body of the note to the console.
    if(note || note!=undefined){
        console.log(chalk.bold.bgGreen("\n"+note.title+" : "))
        console.log(note.body);
    }
    // If no note is found with the given title, we log a message indicating that no note was found.
    else{
        console.log(chalk.bgRed("\nNo note found with the title: "+title+"\n"));
    }

}

// Finally, we export the functions addNote, getNotes, saveNote, 
// and loadNotes as properties of an object using module.exports.
module.exports ={
    addNote,
    removeNote,
    listNotes,
    readNote
}