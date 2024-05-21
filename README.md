# Backend Development

BY Chai aur Code

## File Structure (VIDEO #1)

### Files

-   index --> DB Connect
-   app --> Config Cookies, urlencode
-   constants --> enums, DB-name

### Directory Structure (src)

-   DB
-   Models
-   Controllers
-   Routes
-   Middlewares
-   Utils
-   More(Depends)

## Deploy Backend Code (Video #2)

-   Express : Initialise Server (./index.js)

## Connect Frontend And Backend (Video #3)

-   While Connecting Frontend and Backend via APIs
-   It causes CORS Error (POLICY which prevent access from cross origin. i.e, other domain or PORT)
-   It can be solved as:
    -   White-listing the frontend domain on server.
    -   Add a proxy for the Backend Server (GOOD PRACTICE)
-   Reffer: [YouTube](https://www.youtube.com/watch?v=fFHyqhmnVfs&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=3)

## Data Modelling (Video #4)

-   First Model the Data
    -   Moon Modeler Tool (PAID)
    -   Eraser.io
        -   Fix Data Points
-   Make Schema and Model for the objects
-   Relationship between Models, Thinks about it before writing!

## Model Practices (Video #5)

-   Inside Models we need to store Fields.
-   Mini Models are also useful, [Check Video](https://www.youtube.com/watch?v=lA_mNpddN5U&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=6&t=23m49s)
-   Enums Field: To choose specific value from a given array of values.

## Project (Video #6)

-   Professional Grade Code and Practices.
-   Backend for YouTube and Twitter Clone.
-   Includes most of the facilities.
-   Project Model: ![Structure](./public/assets/img/YouTube%20Backend.png)
-   Installed _Prettier_ for common code Format while pair programming

## Setting Up MyTube (Video #7)

-   DATABASE is in Another Continent!
-   Use {Try, Catch}, {async, await}
-   First Approach to make Connection to DB and Server: Not A Production Based Approach

```js
// ./src/index.js
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import express from "express";
const app = express();
// IIFE : Immediately Involked Function Expressions
(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("error", (error) => {
            console.log("ERR", error);
            throw error;
        });

        app.listen(process.env.PORT, (err) => {
            if (err) throw err;
            console.log(`Listening on http://localhost:${process.env.PORT}`);
        });
    } catch (error) {
        console.log(error);
        throw error;
    }
})();
```

## Setting Up Middlewares (Video #8)

-   See ./src/app.js
-   Setting up async Handler --> ./src/utils/asyncHandler
-   API Error Handling --> Production Practices NOT RELEVENT RIGHT NOW!
-   Similarly for API Response --> Main Motive to have a common sturcture for calls

## Model and Schema (Video #9)

-   On fields having more usecase of searching, put index:true
-   Installed mongooseAggregatePaginate for effective aggreagation and serching used as plugin for videoSchema
-   Installed bcrypt, jsonwebtoken
-   Bcrypt used to hash passwords check user.models.js for comparision and storing passwords middleware and methods.
-   JWT for storing user token work as key for authenticating user --> Will Discuss Later about functionality, usage.

## File Upload (Video #10)

-   File Upload using MULTER and Upload on Cloudinary.
-   Made utility to upload any file on cloudinary. see utils/cloudinary.js
-   Multer used for file-handling used as middleware. see middleware/multer.js

## HTTP Fundamentals (Video #11)

-   HTTP Headers:

    -   METADATA: DATA KA DATA.
    -   Caching, Authentication, State Management
    -   Category:
        -   Request Headers: From Client
        -   Response Headers: From Server
        -   Representation Headers: Encoding/Compression (Format)
        -   Payload Header: Data
    -   Most Common Headers:
        -   Accept: application/json
        -   User-Agent (For Device, browser)
        -   Authorization (For Tokens)
        -   Content-Type
        -   Cookie
        -   Cache-Control

-   HTTP METHODs:

    -   GET
    -   HEAD (Only Head)
    -   POST
    -   UPDATE
    -   DELETE
    -   PUT (Replace)
    -   PATCH (Part is Changed)
    -   OPTIONS
    -   TRACE

-   HTTP Status Code:
    -   1xx : Information
    -   2XX : Sucess
    -   3XX : Redirection
    -   4XX : Client Error
    -   5XX : Server Error

## Routers and Controllers (Video #12 and #13)

-   Wrap All Controller in our async handler (HIGHER ORDER FUNCTION)
-   Logic Building
-   Register a user: (Steps) (See user.controller.js)

    -   Take Input from the user
    -   Validation - NOT EMPTY
    -   Check user if already exist: username, email
    -   Check for images
    -   Check for avatar
    -   Upload them to cloudinary, avatar again check
    -   Create a User Object --> Create entry in DB
    -   Remove Password, Refresh Token Field
    -   Check for user creation
    -   Return response
    -   Else error

-   Multer is used to Handle files see user.routes.js

## Access Tokens and Refresh Tokens (Video #14)

-   Logic Building
-   Login a User: (Steps) (See user.controller.js)

    -   Bring Data from REQ Body
    -   Check For Username or email
    -   IF Present then
    -   Check Password
    -   If Match
    -   Generate Tokens
    -   Give it to Client --> Cookies
    -   Use it for Authentication

-   Logout a User: (Steps) (See user.controller.js)
    -   This Route come under secure routes
    -   Need Authentication before execution thus created auth.middleware.js
    -   Need User --> Use Middleware (See auth.middleware.js)
    -   Remove Cookies
    -   Delete RefreshToken from DB
