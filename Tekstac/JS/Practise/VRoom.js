
function validateRegNumber(regNum)
{
    return /^[A-Z]{2}-\d{2}-[A-Z]{2}-\d{4}$/.test(regNum);
}

function calculateDays(pickup, returnDt)
{
    let pdate=new Date(pickup);
    let rdate=new Date(returnDt);

    let mil=rdate-pdate;

    if(rdate<pdate || pdate<new Date().setHours(0, 0, 0, 0))
        return -1;
    else 
    {
        if(!isNaN(mil))
            return mil/(24*3600*1000);
        else 
            return -1;
    }
}

function generateInvoice()
{
    let regNum=document.getElementById("register").value;
    let pickup=document.getElementById("pickup").value;
    let returnDt=document.getElementById("return").value;
    
    let msg="";
    let res=document.getElementById("resultDiv");

    if(!validateRegNumber(regNum))
    {
        msg="Invalid Registration Number";
    }
    else{
        let d=calculateDays(pickup,returnDt);
        if(d===-1)
            msg="Invalid Dates Selected";
        else 
        {
            let cost=d*1500;
            msg="Success! Your total rental cost is Rs. "+cost;
        }
    }

    
    res.innerHTML=msg;
}