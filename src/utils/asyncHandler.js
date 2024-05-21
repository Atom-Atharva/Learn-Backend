// Using Promises
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => {
            next(err);
        });
    };
};

export { asyncHandler };

// Higher Order Functions
// const asyncHandler = () => {};
// const asyncHandler = (fn) => {()=>{}};
// const asyncHandler = (fn) => ()=>{};
// const asyncHandler = (fn) => async()=>{};

// Using Try and Catch
// const asyncHandler = (fn) => async (req, res, next) => {
//     return (try {
//         await fn(req, res, next);
//     } catch (err) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message,
//         });
//     })
// };
