import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

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

export { registerUser, loginUser, logoutUser };
