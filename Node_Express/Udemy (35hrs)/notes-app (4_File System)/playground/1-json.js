const fs=require('fs');

const comic={
    "title":"The Glitch",
    "Author":"Sushant",
}

// To convert a JavaScript object into a JSON string, you can use the JSON.stringify() method.
const jsonData=JSON.stringify(comic);
console.log(jsonData);

// To convert a JSON string back into a JavaScript object, you can use the JSON.parse() method.
const jsData=JSON.parse(jsonData);
console.log(jsData);

// To write the JSON string to a file, you can use the fs.writeFileSync() method.
fs.writeFileSync("comic.json",jsonData);

// To read the JSON string from a file and convert it back into a JavaScript object, 
// you can use the fs.readFileSync() method to read the file, and then use JSON.parse() to convert the string into an object.
const dataBuffer=fs.readFileSync("comic.json");

// The toString() method is used to convert the buffer data into a string format, 
// which can then be parsed as JSON.
const dataJSON=dataBuffer.toString();

// The JSON.parse() method is used to convert the JSON string back into a JavaScript object, 
// allowing you to work with the data in its original form.
const data=JSON.parse(dataJSON);

console.log(data);


console.log("\n Challenge \n");

const buffer=fs.readFileSync("1-json.json");
const json=buffer.toString();
const js=JSON.parse(json);

js.name="Sushant";
js.age=21;

fs.writeFileSync("1-json.json",JSON.stringify(js))

console.log(js);