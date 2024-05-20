import "dotenv/config";
import connectDB from "./db/index.js";
import { app } from "./app.js";

const port = process.env.PORT || 8080;

connectDB()
    .then(() => {
        // Listening for event error
        app.on("error", (error) => {
            console.log("ERR:", error);
            throw error;
        });

        app.listen(port, (err) => {
            if (err) throw err;
            console.log(`Listening to http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.log("MongoDB Connection Failed!", err);
    });
