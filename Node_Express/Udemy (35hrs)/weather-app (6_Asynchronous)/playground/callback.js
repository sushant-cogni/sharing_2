// its a way to handle asynchronous code in js
setTimeout(()=>{
    console.log("Hello World")
},2000)

// callback is a function that is passed as an argument to another function 
// and is executed after some operation is completed
// in the below example, 
// we are trying to get the data from the deva function but it is not working 
// because the deva function is asynchronous 
// and it is returning undefined because it is not waiting for the setTimeout to complete 
// before returning the data
const deva= (address,callback)=>{

    setTimeout(()=>{
        data={
            lat:0,
            lon:0
        }

        return data;
    },2000)

    // this will be executed before the setTimeout is completed
    // so it will return undefined
    // to handle this we can use callback function
    // return callback(data);
    // but since the data is not available at the time of return, we can return a loading message
    return "Loading..."
}

// this will return "Loading..." because the deva function is not waiting for the setTimeout 
// to complete before returning the data
const d = deva("delhi")
console.log(d)

// to handle this we can use callback function
// we can pass a callback function as an argument to the deva function 
// and call it inside the setTimeout after the data is available   
// this will return the data after 2 seconds 
// because the callback function is called after the setTimeout is completed
const deva2= (address,callback)=>{

    // this will be executed after 2 seconds when the data is available
    // so we can call the callback function here and pass the data as an argument
    // this will return the data after 2 seconds because the callback function is called after the setTimeout is completed
    setTimeout(()=>{
        data={
            lat:0,
            lon:0
        }

        // this will return the data after 2 seconds because the callback function is called after the setTimeout is completed
        // since the data is available at the time of return, we can return the data using the callback function
        return callback(data);
    },2000)
}

// this will return the data after 2 seconds because the callback function is called after the setTimeout is completed
const d2=deva2("delhi",(data)=>{
    console.log(data)
})


const add = (a,b,callback)=>{
    setTimeout(()=>{
        return callback(a+b)
    },2000)
}

add(1,4,(sum)=> console.log(sum)) // Should print: 5 after 2 seconds