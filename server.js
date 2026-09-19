const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

// =========================================
// ADMIN LOGIN SETTINGS
// =========================================

const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// =========================================
// MIDDLEWARE
// =========================================

app.use(cors());
app.use(express.json());

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
// ADMIN AUTHENTICATION
// =========================================

function adminAuth(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Basic ")) {

        res.setHeader(
            "WWW-Authenticate",
            'Basic realm="TripQuest Admin"'
        );

        return res.status(401).send(
            "Admin login required."
        );
    }

    const encodedCredentials =
        authHeader.split(" ")[1];

    let decodedCredentials;

    try {

        decodedCredentials =
            Buffer
                .from(encodedCredentials, "base64")
                .toString("utf8");

    } catch (error) {

        return res.status(401).send(
            "Invalid authentication."
        );
    }

    const separatorIndex =
        decodedCredentials.indexOf(":");

    if (separatorIndex === -1) {

        return res.status(401).send(
            "Invalid authentication."
        );
    }

    const username =
        decodedCredentials.substring(
            0,
            separatorIndex
        );

    const password =
        decodedCredentials.substring(
            separatorIndex + 1
        );

    if (
        username !== ADMIN_USER ||
        password !== ADMIN_PASSWORD
    ) {

        res.setHeader(
            "WWW-Authenticate",
            'Basic realm="TripQuest Admin"'
        );

        return res.status(401).send(
            "Incorrect username or password."
        );
    }

    next();
}

// =========================================
// TEST DATABASE CONNECTION
// =========================================

db.connect()
    .then((client) => {

        console.log(
            "✅ Connected to PostgreSQL database!"
        );

        client.release();

    })
    .catch((err) => {

        console.error(
            "❌ PostgreSQL connection failed:"
        );

        console.error(
            err.message
        );
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

        console.log(
            "✅ Votes table is ready!"
        );

    })
    .catch((err) => {

        console.error(
            "❌ Could not create votes table:"
        );

        console.error(
            err.message
        );
    });

// =========================================
// PUBLIC TRIPQUEST WEBSITE
// =========================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "index.html")
    );

});

// =========================================
// PUBLIC FRONTEND FILES
// =========================================

// Serve normal website files.
// admin.html is handled separately below.

app.use((req, res, next) => {

    if (
        req.path === "/admin.html" ||
        req.path === "/api/votes"
    ) {

        return next();
    }

    express.static(__dirname)(req, res, next);
});

// =========================================
// PROTECTED ADMIN DASHBOARD
// =========================================

app.get(
    "/admin.html",
    adminAuth,
    (req, res) => {

        res.sendFile(
            path.join(__dirname, "admin.html")
        );

    }
);

// =========================================
// TEST BACKEND
// =========================================

app.get("/api/test", (req, res) => {

    res.json({

        message:
            "TripQuest backend is working 🚀"

    });

});

// =========================================
// SAVE VOTE
// =========================================

app.post("/api/vote", async (req, res) => {

    const name =
        req.body.name;

    const selectedDate =
        req.body.selectedDate;

    const activity =
        req.body.activity;

    console.log("");

    console.log(
        "📩 Vote received:"
    );

    console.log(
        "Name:",
        name
    );

    console.log(
        "Date:",
        selectedDate
    );

    console.log(
        "Activity:",
        activity
    );

    // Check required information

    if (
        !name ||
        !selectedDate ||
        !activity
    ) {

        return res.status(400).json({

            message:
                "Please provide name, date and activity."

        });

    }

    const sql = `
        INSERT INTO votes
        (name, selected_date, activity)
        VALUES ($1, $2, $3)
        RETURNING id
    `;

    try {

        const result =
            await db.query(
                sql,
                [
                    name,
                    selectedDate,
                    activity
                ]
            );

        console.log(
            "✅ Vote saved successfully!"
        );

        console.log(
            "Vote ID:",
            result.rows[0].id
        );

        res.status(200).json({

            message:
                "Vote saved successfully!",

            voteId:
                result.rows[0].id

        });

    }

    catch (err) {

        console.error(
            "❌ Error saving vote:"
        );

        console.error(
            err.message
        );

        res.status(500).json({

            message:
                "Could not save vote."

        });

    }

});

// =========================================
// GET ALL VOTES
// PROTECTED ADMIN API
// =========================================

app.get(
    "/api/votes",
    adminAuth,
    async (req, res) => {

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

            const result =
                await db.query(sql);

            console.log(
                "📊 Votes sent to Admin Dashboard"
            );

            res.json(
                result.rows
            );

        }

        catch (err) {

            console.error(
                "❌ Error fetching votes:"
            );

            console.error(
                err.message
            );

            res.status(500).json({

                message:
                    "Could not fetch votes."

            });

        }

    }
);

// =========================================
// START SERVER
// =========================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log("");

        console.log(
            "========================================"
        );

        console.log(
            "🚀 TripQuest website and server running!"
        );

        console.log(
            `🌐 Port: ${PORT}`
        );

        console.log(
            "========================================"
        );

    }
);
