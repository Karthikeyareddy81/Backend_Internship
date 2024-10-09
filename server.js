const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Client
const client = new MongoClient("mongodb+srv://admin:admin@mern.kzghapm.mongodb.net/?retryWrites=true&w=majority&appName=MERN");

const SECRET_KEY = "karthik_28_31"; // For JWT signing

// Utility function to verify JWT token
function authenticateToken(req, res, next) {
    const token = req.headers["authorization"];
    if (!token) return res.status(401).json({ message: "No token provided" });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
        req.user = user;
        next();
    });
}

// Connect to MongoDB
async function connectDB() {
    await client.connect();
}

// User registration
app.post("/register", async (req, res) => {
    await connectDB();
    const { uname, upwd } = req.body;

    // Check if user already exists
    const existingUser = await client.db("backend_internship").collection("user").findOne({ uname });
    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(upwd, 10);
    const { acknowledged } = await client.db("backend_internship").collection("user").insertOne({ uname, upwd: hashedPassword });

    if (acknowledged) {
        res.json({ message: "User registered successfully!" });
    } else {
        res.json({ message: "User registration failed!" });
    }
});

// User login
app.post("/login", async (req, res) => {
    await connectDB();
    const { uname, upwd } = req.body;

    const user = await client.db("backend_internship").collection("user").findOne({ uname });
    if (!user) {
        return res.status(400).json({ message: "User does not exist" });
    }

    const validPassword = await bcrypt.compare(upwd, user.upwd);
    if (!validPassword) {
        return res.status(403).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ uname }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
});

// Admin registration
app.post("/admin/register", async (req, res) => {
    await connectDB();
    const { aname, apwd } = req.body;

    const existingAdmin = await client.db("backend_internship").collection("admin").findOne({ aname });
    if (existingAdmin) {
        return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(apwd, 10);
    const { acknowledged } = await client.db("backend_internship").collection("admin").insertOne({ aname, apwd: hashedPassword });

    if (acknowledged) {
        res.json({ message: "Admin registered successfully!" });
    } else {
        res.json({ message: "Admin registration failed!" });
    }
});

// Admin login
app.post("/admin/login", async (req, res) => {
    await connectDB();
    const { aname, apwd } = req.body;

    const admin = await client.db("backend_internship").collection("admin").findOne({ aname });
    if (!admin) {
        return res.status(400).json({ message: "Admin does not exist" });
    }

    const validPassword = await bcrypt.compare(apwd, admin.apwd);
    if (!validPassword) {
        return res.status(403).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ aname }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
});

// Get all admins
app.get("/admins", authenticateToken, async (req, res) => {
    await connectDB();
    const admins = await client.db("backend_internship").collection("admin").find().toArray();
    res.json(admins);
});

// Upload an assignment (User)
app.post("/upload", authenticateToken, async (req, res) => {
    await connectDB();
    const { title, description, assignedTo } = req.body; // assignedTo: admin username

    const { acknowledged } = await client.db("backend_internship").collection("assignments").insertOne({
        title,
        description,
        assignedTo,
        status: "pending", // status: pending, accepted, rejected
        createdBy: req.user.uname,
    });

    if (acknowledged) {
        res.json({ message: "Assignment uploaded successfully!" });
    } else {
        res.json({ message: "Failed to upload assignment!" });
    }
});

// View assignments (Admin)
app.get("/assignments", authenticateToken, async (req, res) => {
    await connectDB();
    const assignments = await client.db("backend_internship").collection("assignments").find({ assignedTo: req.user.aname }).toArray();
    res.json(assignments);
});

// Accept an assignment (Admin)
app.post("/assignments/:id/accept", authenticateToken, async (req, res) => {
    await connectDB();
    const { id } = req.params;

    const result = await client.db("backend_internship").collection("assignments").updateOne({ _id: new MongoClient.ObjectID(id) }, { $set: { status: "accepted" } });
    
    if (result.modifiedCount > 0) {
        res.json({ message: "Assignment accepted!" });
    } else {
        res.json({ message: "Failed to accept assignment!" });
    }
});

// Reject an assignment (Admin)
app.post("/assignments/:id/reject", authenticateToken, async (req, res) => {
    await connectDB();
    const { id } = req.params;

    const result = await client.db("backend_internship").collection("assignments").updateOne({ _id: new MongoClient.ObjectID(id) }, { $set: { status: "rejected" } });

    if (result.modifiedCount > 0) {
        res.json({ message: "Assignment rejected!" });
    } else {
        res.json({ message: "Failed to reject assignment!" });
    }
});

// Start server
app.listen(8080, () => {
    console.log("Server listening on port 8080");
});
