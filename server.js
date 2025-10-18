import express from "express";
import dotenv from "dotenv";
import router from "./route.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
const allowedOrigins = [
    'http://localhost:8080',
    'http://localhost:3000',
    'http://localhost:3001',
    'https://flipmyroom.com',
];

// Handle CORS for all requests
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Refresh-Token");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});

<<<<<<< HEAD
=======
// Increase payload limits for base64 images
>>>>>>> 1f8ce850de4e5297a951a4ed20aa9c8a8176f8de
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use("/api", router);

// test route
app.get("/", (req, res) => {
    res.send("Server is running fine 🚀");
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});