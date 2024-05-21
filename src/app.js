import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

// Middlewares Configuration in industrial standards
// CORS ORIGIN ACCESS (Specific URLs)
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    }),
);

// Data from JSON : Data from FORMs
app.use(
    express.json({
        limit: "16kb",
    }),
);

// Data from URL
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Access Static Files
app.use(express.static("public"));

// CRUD on Cookies of user
app.use(cookieParser());

// Routes
import userRouter from "./routes/user.routes.js";

// Routes Declaration
app.use("/api/v1/users", userRouter); //URL struct: http://localhost:8080/api/v1/users/userRoutes

export { app };
