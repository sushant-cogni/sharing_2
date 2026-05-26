const apiError = (message,res,status=500)=>{
    console.log(message);
    
    return res.status(status).send({
        status:"Failed",
        error:message
    })
}

export default apiError