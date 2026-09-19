const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

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
// POSTGRESQL CONNECTION
// =========================================

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// =========================================
// TEST DATABASE CONNECTION
// =========================================

db.connect()
    .then((client) => {
        console.log("✅ Connected to PostgreSQL database!");
        client.release();
    })
    .catch((err) => {
        console.error("❌ PostgreSQL connection failed:");
        console.error(err.message);
    });

// =========================================
// TRIPQUEST WEBSITE
// =========================================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
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
// CREATE VOTES TABLE
// =========================================

const createTable = `
    CREATE TABLE IF NOT EXISTS votes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        selected_date VARCHAR(50) NOT NULL,
        activity VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`;

db.query(createTable)
    .then(() => {
        console.log("✅ Votes table is ready!");
    })
    .catch((err) => {
        console.error("❌ Could not create votes table:");
        console.error(err.message);
    });

// =========================================
// SAVE VOTE
// =========================================

app.post("/api/vote", async (req, res) => {

    const name = req.body.name;
    const selectedDate = req.body.selectedDate;
    const activity = req.body.activity;

    console.log("");
    console.log("📩 Vote received:");
    console.log("Name:", name);
    console.log("Date:", selectedDate);
    console.log("Activity:", activity);

    if (!name || !selectedDate || !activity) {
        return res.status(400).json({
            message: "Please provide name, date and activity."
        });
    }

    const sql = `
        INSERT INTO votes
        (name, selected_date, activity)
        VALUES ($1, $2, $3)
        RETURNING id
    `;

    try {

        const result = await db.query(
            sql,
            [name, selectedDate, activity]
        );

        console.log("✅ Vote saved successfully!");
        console.log("Vote ID:", result.rows[0].id);

        res.status(200).json({
            message: "Vote saved successfully!",
            voteId: result.rows[0].id
        });

    } catch (err) {

        console.error("❌ Error saving vote:");
        console.error(err.message);

        res.status(500).json({
            message: "Could not save vote."
        });
    }
});

// =========================================
// GET ALL VOTES
// ADMIN DASHBOARD
// =========================================

app.get("/api/votes", async (req, res) => {

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

    try {

        const result = await db.query(sql);

        console.log("📊 Votes sent to Admin Dashboard");

        res.json(result.rows);

    } catch (err) {

        console.error("❌ Error fetching votes:");
        console.error(err.message);

        res.status(500).json({
            message: "Could not fetch votes."
        });
    }
});

// =========================================
// START SERVER
// =========================================

app.listen(PORT, "0.0.0.0", () => {

    console.log("");

    console.log("========================================");
    console.log("🚀 TripQuest website and server running!");
    console.log(`🌐 Port: ${PORT}`);
    console.log("========================================");

});
