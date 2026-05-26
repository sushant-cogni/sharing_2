
assetCategory.addEventLisener("change",populateModels);

function populateModels()
{
    let select=document.getElementById("assetModel");
    let selectCat=document.getElementById("assetCategory").value;

    select.options.length=0;

    let list=[];

    if(selectCat==="Laptops")
    {
        list=["Dell XPS","Thinkpad T14","MacBook Pro"];
    }
    else if(selectCat==="Monitors")
    {
        list=["Dell 24-inch","LG Ultrawide"];
    }
    else{
        list=["Wireless Mouse","Mechanical Keyboard"];
    }

    for(let l of list)
    {
        let opt=document.createElement("option");
        opt.textContent=l;
        opt.value=l;
        select.appendChild(opt);
    }

}

function createAssetObj(emp, category, model)
{
    return {
        EmployeeID:emp,
        Category:category,
        Model:model
    };
}

function assignAsset()
{
    let empId=document.getElementById("empId").value;
    let assetCategory=document.getElementById("assetCategory").value;
    let asseModel=document.getElementById("assetModel").value;

    let msg="";

    let res=document.getElementById("span");

    if(empId==="" || asseModel==="" || assetCategory==="")
        msg="Please fill all fields";
    else if(!empId.startsWith("EMP"))
    {
        msg="invalid Employee ID";
    }
    else 
    {
        let obj=createAssetObj(empId,assetCategory,asseModel);

        let table=document.getElementById("table");

        //table.rows.length

        let row=table.insertRow(-1);

        let cell1=row.insertCell(0);
        let cell2=row.insertCell(1);
        let cell3=row.insertCell(2);

        cell1.textContent=obj.EmployeeID;
        cell2.textContent=obj.Category;
        cell3.textContent=obj.Model;
    }

    res.innerHTML=msg;
}