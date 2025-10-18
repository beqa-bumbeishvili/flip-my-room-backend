import express from "express";
import dotenv from "dotenv";
import router from "./route.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use("/api", router);

// test route
app.get("/", (req, res) => {
    res.send("Server is running fine 🚀");
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});