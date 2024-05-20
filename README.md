# Backend Development

BY Chai aur Code

## File Structure (VIDEO #1)

### Files

-   index --> DB Connect
-   app --> Config Cookies, urlencode
-   constants --> enums, DB-name

### Directory Structure

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

- Backend for YouTube and Twitter Clone.
- Includes most of the facilities.
- Project Model: ![This](./assets/img/YouTube%20Backend.png)
