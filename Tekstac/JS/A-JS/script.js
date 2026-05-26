
let cards=document.querySelector("#cards");
let tbody=document.querySelector("#tbody");

window.addEventListener("load",async()=>{


    // let res=await fetch("data.json");
    // let data1=await res.json();

    // localStorage.setItem("data",JSON.stringify(data1));

    let data=JSON.parse(localStorage.getItem("data"));

    for(let i=0;i<10;i++)
    {
        // console.log(data[i]);
        let name=data[i].name;
        let role=data[i].role;
        let gender=data[i].gender;
        let skills=data[i].skills;
        let email=data[i].email;
        let projects=data[i].projects;
        let hcm=data[i].hcm_details;

        // console.log(gender);
        
        let p_nm=[];
        for(pr of projects)
        {
            // console.log(pr);
                p_nm.push(pr.name);
            // console.log(pr.name);
        }

        let html=`
                <div class="card m-3 align-items-center col-4 p-2">`
        if(gender==="male")
        {
            html+='<i class="bi bi-gender-male" style="font-size: 3rem; color: #0d6efd;"></i>';
        }
        else
        {
            html+='<i class="bi bi-gender-female" style="font-size: 3rem; color: #e83e8c;"></i>';
        }
                   html+= `
                    <table>
                        <tr>
                            <td>Name</td>
                            <td><input type="text" id="name${i}" value="${name}" disabled></td>
                        </tr>
                        <tr>
                            <td>ID</td>
                            <td><input type="text"  id="id${i}" value="${i+1}" disabled></td>
                        </tr>
                        <tr>
                            <td>Skills</td>
                            <td><input type="text"  id="skills${i}" value="${skills.join(", ")}" disabled></td>
                        </tr>
                        <tr>
                            <td>Project</td>
                            <td><input type="text"  id="project${i}" value="${p_nm.join(", ")}" disabled></td>
                        </tr>
                        <tr>
                            <td>HCM</td>
                            <td><input type="text"  id="hcm${i}" value="${hcm.department}" disabled></td>
                        </tr>
                        <tr>
                            <td colspan="2" class="float-right"><button id="btn${i}" class="bttn" >Edit/Save</button></td>
                        </tr>
                    </table>
                </div>
            `;

        cards.innerHTML+=html;

        html=`
                        <tr>
                            <td id="name${i}">${name}</td>
                            <td id="id${i}">${i+1}</td>
                            <td id="skills${i}">${skills.join(", ")}</td>
                            <td id="project${i}">${p_nm.join(", ")}</td>
                            <td id="hcm${i}">${hcm.department}</td>
                            <td colspan="2" class="float-right"><button id="btn${i}" class="bttn">Edit/Save</a></td>
                        </tr>
        `

        tbody.innerHTML+=html;

    }

    let btns = document.querySelectorAll(".bttn");

btns.forEach((btn) => {
    btn.addEventListener("click", (event) => {
        // console.log("You clicked:", event.target.id);
        // let btn=document.querySelector(event.target.id);
        let btn=event.target;
        // console.log(btn);

        let cardI=((btn.id)+"").charAt((btn.id+"").length-1);
        // console.log(cardI);
        
        let name=document.querySelector("#name"+cardI);
        let id=document.querySelector("#id"+cardI);
        let skills=document.querySelector("#skills"+cardI);
        let project=document.querySelector("#project"+cardI);
        let hcm=document.querySelector("#hcm"+cardI);

        if(name.disabled==true)
        {
            name.disabled=false;
            // id.disabled=false;
            skills.disabled=false;
            // project.disabled=false;
            // hcm.disabled=false;
        }
        else
        {
            name.disabled=true;
            // id.disabled=true;
            skills.disabled=true;
            // project.disabled=true;
            // hcm.disabled=true;

            let t_data=JSON.parse(localStorage.getItem("data"));

            // console.log(t_data);

            let sk=skills.value.split(", ");

            for(emp of t_data)
            {
                // console.log(emp.id-1);
                
                if((emp.id)-1==cardI)
                {
                    // console.log(emp.id);
                    // let obj={
                    //     "name":name.value,
                    //     "id":emp.id,
                    //     "skills": sk,
                    //     "projects": emp.projects,
                    //     "gender": emp.gender,
                    //     "role": emp.role,
                    //     "email": emp.email,
                    //     "hcm_details":emp.hcm_details
                    // };
                    // console.log(obj);

                    emp.name=name.value;
                    emp.skills=sk;

                    // console.log(emp);
                }
            }
            
            localStorage.setItem("data",JSON.stringify(t_data));

        }
        // console.log(name,id,skills,project,hcm);

        
        
    });
});
   

    
});

