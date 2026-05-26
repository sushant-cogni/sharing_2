

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// for making http request to external api
// npm install request
// but the 'request' package is deprecated and no longer maintained,
// alternativerly we can use 'postman-request' package which is a wrapper around 'request' package 
// and provides additional features like retrying failed requests, 
// caching responses, etc.
// npm install postman-request
const request=require('request');

const fs=require('fs');

// API access key and URL for the weatherstack API
// const url="https://api.weatherstack.com/current?access_key=a648b6a77068799b6cce9c6d9f8aef8c&query=12.8517,80.2271"

// we can also use the 'dotenv' package to load environment variables from a .env file
// npm install dotenv
require('dotenv').config(); 

// we can access the environment variables using process.env.VARIABLE_NAME
const url=process.env.WEBSITE_URL; 

// making a GET request to the weatherstack API
// the 'json:true' option tells the request library to parse 
// the response body as JSON and return it as a JavaScript object
// the callback function takes two arguments: error and response
request({url:url},(error,response)=>{

    // if there is an error, we log it to the console
    console.log("Error : " , error);
    // if there is no error, we log the response to the console
    console.log("Response : " , response);

    // we can also write the response to a file using the 'fs' module
    fs.writeFileSync('weather.json',JSON.stringify(response));

    // we can also parse the response body as JSON and log it to the console
    const data=JSON.parse(response.body);
    fs.writeFileSync('data.json',response.body);

    // we can also log specific properties of the data object to the console
    console.log("Data : ", data)
    console.log("Data : ", data.current)

})
