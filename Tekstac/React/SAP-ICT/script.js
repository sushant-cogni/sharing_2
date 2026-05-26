document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault(); 

            const user = document.getElementById("username").value;
            const pass = document.getElementById("password").value;

            if (user === "Cognizant" && pass === "Hello123") {
                window.location.href = "home.html";
            } else {
                alert("The credentials entered are incorrect.");
            }
        });
    }
});