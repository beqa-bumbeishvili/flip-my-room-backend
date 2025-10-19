import express from "express";
import dotenv from "dotenv";
import router from "./route.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// CORS configuration - Allow all origins
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Refresh-Token");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});

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