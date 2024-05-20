import express from "express";

import "dotenv/config";

const app = express();
const port = process.env.PORT;

// End points
app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.get("/login", (req, res) => {
    res.send("Login Here!");
});

// Server Listening to Requests
app.listen(port, (err) => {
    if (err) throw err;

    console.log(`Listening to ${port}`);
});
