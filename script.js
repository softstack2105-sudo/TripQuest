/* =========================================
   ELEMENTS
========================================= */

// Home
const openTrip = document.getElementById("openTrip");
const homeScreen = document.getElementById("homeScreen");

// Name
const nameScreen = document.getElementById("nameScreen");
const friendName = document.getElementById("friendName");

// Date
const dateScreen = document.getElementById("dateScreen");
const continueBtn = document.getElementById("continueBtn");

// Activity
const choiceScreen = document.getElementById("choiceScreen");
const selectedDateText = document.getElementById("selectedDateText");

// Result
const resultScreen = document.getElementById("resultScreen");
const resultMessage = document.getElementById("resultMessage");


/* =========================================
   VARIABLES
========================================= */

let userName = "";
let selectedDate = "";
let selectedActivity = "";


/* =========================================
   OPEN TRIP
========================================= */

openTrip.addEventListener("click", function () {

    homeScreen.style.display = "none";

    nameScreen.style.display = "block";

    setTimeout(function () {
        friendName.focus();
    }, 200);

    window.scrollTo(0, 0);

});


/* =========================================
   SAVE NAME
========================================= */

function saveName() {

    const name = friendName.value.trim();

    if (name === "") {

        alert("Please enter your name 😊");

        friendName.focus();

        return;
    }

    userName = name;

    nameScreen.style.display = "none";

    dateScreen.style.display = "block";

    window.scrollTo(0, 0);

}


/* =========================================
   ENTER KEY FOR NAME
========================================= */

friendName.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {

        saveName();

    }

});


/* =========================================
   SELECT DATE
========================================= */

function selectDate(date, button) {

    selectedDate = date;

    const allDateButtons =
        document.querySelectorAll(".date-btn");

    allDateButtons.forEach(function (btn) {

        btn.classList.remove("selected");

    });

    button.classList.add("selected");

    continueBtn.disabled = false;

}


/* =========================================
   GO TO ACTIVITIES
========================================= */

function goToActivities() {

    if (selectedDate === "") {

        alert("Please select a date 😊");

        return;
    }

    dateScreen.style.display = "none";

    choiceScreen.style.display = "block";

    selectedDateText.innerHTML =
        "📅 " + selectedDate;

    window.scrollTo(0, 0);

}


/* =========================================
   CHOOSE ACTIVITY + SAVE VOTE
========================================= */

function chooseTrip(activity) {

    if (selectedDate === "") {

        alert("Please select a date first 😊");

        return;
    }

    if (userName === "") {

        alert("Please enter your name first 😊");

        return;
    }


    // Save selected activity
    selectedActivity = activity;


    // Disable all buttons while saving
    const chooseButtons =
        document.querySelectorAll(".choose-btn");

    chooseButtons.forEach(function (button) {

        button.disabled = true;

        button.style.opacity = "0.6";

    });


    // Send vote to Node.js backend
    fetch("/api/vote", {

        method: "POST",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify({

            name: userName,

            selectedDate: selectedDate,

            activity: selectedActivity

        })

    })


    // =====================================
    // SERVER RESPONSE
    // =====================================

    .then(function (response) {

        if (!response.ok) {

            throw new Error(
                "Server returned status " +
                response.status
            );

        }

        return response.json();

    })


    // =====================================
    // PROCESS RESPONSE
    // =====================================

    .then(function (data) {

        console.log("Server response:", data);


        if (
            data.message ===
            "Vote saved successfully!"
        ) {

            // Hide activity screen
            choiceScreen.style.display = "none";


            // Show result screen
            resultScreen.style.display = "flex";


            // Display final selection
            resultMessage.innerHTML =

                "👋 <strong>" +
                userName +
                "</strong><br><br>" +

                "📅 Date: <strong>" +
                selectedDate +
                "</strong><br><br>" +

                "🎒 Adventure: <strong>" +
                selectedActivity +
                "</strong>";


            window.scrollTo(0, 0);

        }

        else {

            alert(
                "Something went wrong while saving your vote 😕"
            );


            // Enable buttons again
            chooseButtons.forEach(function (button) {

                button.disabled = false;

                button.style.opacity = "1";

            });

        }

    })


    // =====================================
    // CONNECTION / SERVER ERROR
    // =====================================

    .catch(function (error) {

        console.error(
            "TripQuest error:",
            error
        );

        alert(
            "Could not save your vote 😕\n\n" +
            "Please make sure TripQuest is opened using:\n" +
            "http://localhost:3000"
        );


        // Enable buttons again
        chooseButtons.forEach(function (button) {

            button.disabled = false;

            button.style.opacity = "1";

        });

    });

}


/* =========================================
   CHANGE CHOICE
========================================= */

function goBack() {

    resultScreen.style.display = "none";

    choiceScreen.style.display = "block";

    window.scrollTo(0, 0);

}