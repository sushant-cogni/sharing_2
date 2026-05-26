// // Description


// // Objective:
// // To add scripting to the existing web page and to work with JavaScript basic activities. The basic JavaScript concepts like DOM, loops, Operators and Control Statements, and Date functions are covered.

// // Problem Description:

// // RichFeel Trichology Center is a leading provider of hair and skin care services. With a team of experienced trichologists and advanced technology, they offer personalized solutions to a range of hair and scalp conditions. To ensure the best care for their patients, the clinic tracks each patient's treatment progress by recording their previous session date and session count. Based on this information, they can then determine the patient's next session date and display it for them during their consultation. This helps the clinic provide a seamless and organized experience for their patients.

// // Sample Screens: [ Assume today's date is '5/13/2024' ]

// // Empty Fields

// // Session1_BeforeCurrentDate

// // W/O Prior Date

// // Following are the files that contain code snippets.

// // index.html

// // HTML for webpages (a complete implementation is given to you). You only have to run this. No change needs to be made to this file.

// // script.js

// // Add your code in this file for the functions given.


// // Procedure to complete the exercise

// // - Required function signatures are already available in the script.js file.

// // Hint: Do not change the function names.

// // Function Name

// // Function Description

// // scheduleAppointment()

// // On clicking the 'Schedule Appointment' button, this function is invoked.
// // 1. Invoke fetchValues() function and fetch the returned value as array
// // (Consider array variable as 'clinic')
// // 2. Save the first element of the array (clinic[0]) as name, the second element(clinic[1]) as treatment, the third element(clinic[2] as sessionCount, and the fourth element(clinic[3]) as previousSession.
// // 3. If name is not empty, treatment category is selected properly, and session count has a valid count, then invoke identifyNextSessionDate() method by passing the array elements treatment, sessionCount and previousSession and save the returned value of the 'identifyNextSessionDate' method as a message. Display "Hi,<<name>>.<br><<message>>" in div tag with id: 'nextSession'.
// // 4. If not, display "Please ensure that all required fields are filled out" in the div tag with the id: 'nextSession'

// // [Refer to the screenshot to display output.]

// // fetchValues()

// // This function is invoked from scheduleAppointment() method.
// // This should return the element values as array.

// // Get the DOM element values for name, treatment category, session count, and previous session date, and then return them all as an array in the given order.

// // identifyNextSessionDate(treatment,sessionCount,previousSession)

// // This function is invoked from scheduleAppointment() method.
// // It should return the message based on the next session date and inputs provided.

// // Imagine today's date as 5/13/2024

// // 1. If the session count is one, then add 1 day to the current date and return,

// // "Your first session is scheduled on <<next_session_date>>". Here, next_session_date will be 5/14/2023.

// // 2. If the session count exceeds one and the previous session date is provided,

// // (i) For "Laser Hair Reduction" treatment,

// // If the session count is "2-3", then 15 days must be added to the next session date.

// // If the session count is "More than 3", then 30 days must be added to the next session date.

// // (ii) For "Hair and Scalp" treatment, 7 days must be added to the next session date.

// // (iii) For "Hair Treatment" treatment, 5 days must be added to the next session date.

// // (iv) If the scheduled next session date falls before the current date, then 1 day must be added to the current date and set that as the next session date.

// // It must return "The date of your upcoming session is <<next_session_date>>".

// // 3. If the session count exceeds one and if the previous session date is not provided, it must return
// // "To schedule your appointment, please specify the prior session date".

// // [Refer to the screenshot to display output.]



// function fetchValues() {
// 	try{
           
//             // Fill your code here
        
// 	}
//      catch(err){
//       document.getElementById("nextSession").innerHTML="Function fetchValues: "+err;
//     }
//     return false;
// }

// function identifyNextSessionDate(treatment,sessionCount,previousSession){
// 	try{
           
//             // Fill your code here
        
// 	}
//      catch(err){
//       document.getElementById("nextSession").innerHTML="Function identifyNextSessionDate: "+err;
//     }
//     return null;

// }
  
// function scheduleAppointment() {
//      try{
           
//             // Fill your code here
        
// 	}
//      catch(err){
//       document.getElementById("nextSession").innerHTML="Function scheduleAppointment: "+err;
//     }
//     return false;
// }



function fetchValues() {
    try {
        let name = document.getElementById("name").value;
        let treatment = document.getElementById("treatment_category").value;
        
        let sessionCount = "";
        let sessionRadios = document.getElementsByName("session_count");
        for (let i = 0; i < sessionRadios.length; i++) {
            if (sessionRadios[i].checked) {
                sessionCount = sessionRadios[i].value;
                break;
            }
        }

        let previousSession = document.getElementById("previousSession").value;

        return [name, treatment, sessionCount, previousSession];
    }
    catch (err) {
        document.getElementById("nextSession").innerHTML = "Function fetchValues: " + err;
    }
    return false;
}

function identifyNextSessionDate(treatment, sessionCount, previousSession) {
    try {
        // Use dynamic current date for the tests
        let today = new Date();
        let nextDate = new Date();

        // 1. If the session count is one
        if (sessionCount === "1") {
            nextDate.setDate(today.getDate() + 1);
            let formattedDate = (nextDate.getMonth() + 1) + "/" + nextDate.getDate() + "/" + nextDate.getFullYear();
            return "Your first session is scheduled on " + formattedDate;
        }

        // 3. If session count exceeds one and previous session is NOT provided
        if (!previousSession) {
            return "To schedule your appointment, please specify the prior session date";
        }

        // 2. If session count exceeds one and previous session is provided
        let prevDate = new Date(previousSession);
        nextDate = new Date(prevDate);

        if (treatment === "Laser Hair Reduction") {
            if (sessionCount === "2-3") {
                nextDate.setDate(prevDate.getDate() + 15);
            } else if (sessionCount === "More than 3") {
                nextDate.setDate(prevDate.getDate() + 30);
            }
        } else if (treatment === "Hair and Scalp") {
            nextDate.setDate(prevDate.getDate() + 7);
        } else if (treatment === "Hair Treatment") {
            nextDate.setDate(prevDate.getDate() + 5);
        }

        // Reset times to midnight to ensure accurate day-to-day comparison
        today.setHours(0, 0, 0, 0);
        nextDate.setHours(0, 0, 0, 0);

        // (iv) If scheduled next session falls before current date, add 1 day to current date
        if (nextDate < today) {
            nextDate = new Date(); // Reset to today
            nextDate.setDate(today.getDate() + 1);
        }

        let formattedDate = (nextDate.getMonth() + 1) + "/" + nextDate.getDate() + "/" + nextDate.getFullYear();
        return "The date of your upcoming session is " + formattedDate;
    }
    catch (err) {
        document.getElementById("nextSession").innerHTML = "Function identifyNextSessionDate: " + err;
    }
    return null;
}
  
function scheduleAppointment() {
    try {
        let clinic = fetchValues();
        
        let name = clinic[0];
        let treatment = clinic[1];
        let sessionCount = clinic[2];
        let previousSession = clinic[3];

        let displayDiv = document.getElementById("nextSession");

        // Validation
        if (name.trim() !== "" && treatment !== "--Select--" && treatment !== "" && sessionCount !== "") {
            let message = identifyNextSessionDate(treatment, sessionCount, previousSession);
            // STRICT FORMATTING: Removed the space after "Hi," to match the exact requirement
            displayDiv.innerHTML = "Hi," + name + ".<br>" + message;
        } else {
            displayDiv.innerHTML = "Please ensure that all required fields are filled out";
        }
    }
    catch (err) {
        document.getElementById("nextSession").innerHTML = "Function scheduleAppointment: " + err;
    }
    return false;
}
