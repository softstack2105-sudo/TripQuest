const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;


// =========================================
// MIDDLEWARE
// =========================================

app.use(cors());
app.use(express.json());


// =========================================
// SERVE TRIPQUEST FRONTEND FILES
// =========================================

app.use(express.static(__dirname));


// =========================================
// MYSQL CONNECTION
// =========================================

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "tripquest"
});


// =========================================
// CONNECT TO MYSQL
// =========================================

db.connect((err) => {

    if (err) {

        console.error("❌ MySQL connection failed:");
        console.error(err.message);

        return;
    }

    console.log("✅ Connected to MySQL database!");

});


// =========================================
// TRIPQUEST WEBSITE
// =========================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "index.html")
    );

});


// =========================================
// TEST BACKEND
// =========================================

app.get("/api/test", (req, res) => {

    res.json({

        message: "TripQuest backend is working 🚀"

    });

});


// =========================================
// SAVE VOTE
// =========================================

app.post("/api/vote", (req, res) => {

    const name = req.body.name;
    const selectedDate = req.body.selectedDate;
    const activity = req.body.activity;


    console.log("");
    console.log("📩 Vote received:");
    console.log("Name:", name);
    console.log("Date:", selectedDate);
    console.log("Activity:", activity);


    // Check required information

    if (!name || !selectedDate || !activity) {

        return res.status(400).json({

            message:
                "Please provide name, date and activity."

        });

    }


    // SQL query

    const sql = `
        INSERT INTO votes
        (name, selected_date, activity)
        VALUES (?, ?, ?)
    `;


    // Save vote in MySQL

    db.query(
        sql,
        [name, selectedDate, activity],
        (err, result) => {

            if (err) {

                console.error(
                    "❌ Error saving vote:"
                );

                console.error(err.message);


                return res.status(500).json({

                    message:
                        "Could not save vote."

                });

            }


            console.log(
                "✅ Vote saved successfully!"
            );

            console.log(
                "Vote ID:",
                result.insertId
            );


            res.status(200).json({

                message:
                    "Vote saved successfully!",

                voteId:
                    result.insertId

            });

        }
    );

});


// =========================================
// GET ALL VOTES
// ADMIN DASHBOARD
// =========================================

app.get("/api/votes", (req, res) => {

    const sql = `
        SELECT
            id,
            name,
            selected_date,
            activity,
            created_at
        FROM votes
        ORDER BY created_at DESC
    `;


    db.query(
        sql,
        (err, results) => {

            if (err) {

                console.error(
                    "❌ Error fetching votes:"
                );

                console.error(
                    err.message
                );


                return res.status(500).json({

                    message:
                        "Could not fetch votes."

                });

            }


            console.log(
                "📊 Votes sent to Admin Dashboard"
            );


            res.json(results);

        }
    );

});


// =========================================
// START SERVER
// =========================================

app.listen(PORT, () => {

    console.log("");

    console.log(
        "========================================"
    );

    console.log(
        "🚀 TripQuest website and server running!"
    );

    console.log(
        `🌐 http://localhost:${PORT}`
    );

    console.log(
        "========================================"
    );

});