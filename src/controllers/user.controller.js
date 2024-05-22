import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jasonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // Save Refresh Token in DB
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (err) {
        throw new ApiError(500, "Something went wrong while Generating tokens");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    // Steps: Involve see README.md

    // By Form, json
    const { fullName, email, username, password } = req.body;
    // console.log("Full Name", fullName);

    // Validation
    if (fullName === "") {
        throw new ApiError(400, "Full Name is Required");
    }
    if (email === "") {
        throw new ApiError(400, "Email is Required");
    }
    if (username === "") {
        throw new ApiError(400, "User Name is Required");
    }
    if (password === "") {
        throw new ApiError(400, "Password is Required");
    }

    // Existing User?
    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        throw new ApiError(409, "User with Email or Username Already Exist");
    }

    // Handle Files --> With the help of multer: Add more fields to req
    const avatarLocalPath = req.files?.avatar[0]?.path;

    let coverImageLocalPath;
    if (req?.files?.coverImage) {
        coverImageLocalPath = req.files?.coverImage[0]?.path;
    }
    // console.log(req.files);

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar File is Required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar File is Required");
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    });

    // Find User -{Password, RefreshToken} Fields
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken",
    );

    // Check if User is created
    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went Wrong While Registering the User",
        );
    }

    // Response to User
    return res
        .status(201)
        .json(
            new ApiResponse(200, createdUser, "User Registered Successfully!"),
        );
});

const loginUser = asyncHandler(async (req, res) => {
    // Get Data
    const { email, username, password } = req.body;

    // Check username, email
    if (!(username || email)) {
        throw new ApiError(400, "UserName or Email is Required");
    }

    // Find User
    const user = await User.findOne({
        $or: [{ username }, { email }],
    });
    if (!user) {
        throw new ApiError(404, "User does not Exist");
    }

    // Check Password --> Used Methods defined inside Schema for user
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Password is Incorrect");
    }

    // Generate Token
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id,
    );

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken",
    );

    // Cookies Options
    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User Logged In Successfully",
            ),
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    // Delete RefreshToken from DB
    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: undefined,
        },
    });

    // Cookies Options
    const options = {
        httpOnly: true,
        secure: true,
    };

    // Remove Cookies
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "Uses Logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    // Get Token from cookie or mobile
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

    // Check Token
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request");
    }

    try {
        // Verify Token
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET,
        );

        // Check User
        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token");
        }

        // Match Tokens
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(
                401,
                "Refresh Token is Expired or Already in use",
            );
        }

        // Cookie Header
        const options = {
            httpsOnly: true,
            secure: true,
        };

        const { newAccessToken, newRefreshToken } =
            generateAccessAndRefreshToken(user?._id);

        return res
            .status(200)
            .cookie("accessToken", newAccessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        newAccessToken,
                        newRefreshToken,
                    },
                    "Access Token Refreshed",
                ),
            );
    } catch (error) {
        new ApiError(401, error?.message || "Invalid Refresh Token");
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid User Password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password Changed Successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(200, req.user, "Current User Fetch Successfully"),
        );
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
        throw new ApiError(400, "All Fields are Required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email,
            },
        },
        { new: true },
    ).select("-password");

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Account Details Updated Successfully"),
        );
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    // Access Files using multer
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar File is Missing");
    }

    // Upload on Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar.url) {
        throw new ApiError(400, "Error While Uploading Avatar");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url,
            },
        },
        { new: true },
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar Updated Successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    // Access Files using multer
    const coverImageLocalPath = req.file?.path;
    if (!coverImageLocalPath) {
        throw new ApiError(400, "CoverImage File is Missing");
    }

    // Upload on Cloudinary
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage.url) {
        throw new ApiError(400, "Error While Uploading CoverImage");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url,
            },
        },
        { new: true },
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "CoverImage Updated Successfully"));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
};
