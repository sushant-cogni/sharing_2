// To ignore the self-signed certificate error
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const request=require('postman-request');
const dotenve=require('dotenv');
dotenve.config();

const url=process.env.WEBSITE_URL;

// Async function to get the temperature in Celsius
request({url,json:true},async (error,response)=> {
    if(error){
        console.log("Error : ", error);
    }
    else if(response.body.error){
        console.log("Error : ", response.body.error.info);
    }else{
        const data=await response.body;

        // printing the current temperature and the feels like temperature in Celsius
        // await is used to wait for the response from the API before printing the temperature
        console.log("Response : The current Temperature(C) is ",data.current.temperature, "*C but it feels like " , data.current.feelslike, "*C");

        // printing the weather description
        // data.current.weather_descriptions is an array of weather descriptions, 
        // we are printing the first element of the array
        console.log("Weather description : ", data.current.weather_descriptions[0]);
    }
});

// // To get the temperature in Fahrenheit,
// // we can add the units parameter to the URL with the value 'f'
// const url2=url+"&units=f";

// // Async function to get the temperature in Fahrenheit
// request({url:url2,json:true},async (error,response)=> {
//     if(error){
//         console.log("Error : ", error);
//     }else{

        
//         const data=await response.body;

//         // printing the current temperature and the feels like temperature in Fahrenheit
//         // await is used to wait for the response from the API before printing the temperature
//         console.log("Response : The current Temperature(F) is ",await response.body.current.temperature, "*F but it feels like " , await response.body.current.feelslike, "*F");

//         console.log("Weather description : ", data.current.weather_descriptions[0])
//     }   
// });