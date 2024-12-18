import User from "../models/user.model.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

//* Upload Image To Cloudinary  
const uploadImgToCloudinary = async (filePath) => {

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    })
    console.log("Cloudinary Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
    console.log(process.env.CLOUDINARY_API_KEY);
    try {
        const uploadResult = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto",
        });
        fs.unlinkSync(filePath);
        return uploadResult.secure_url;
    } catch (error) {
        fs.unlinkSync(filePath);
        return null;
    }
};

//* Generate access token
const generateAccessToken = (user) => {
    return jwt.sign({ email: user.email }, process.env.ACCESS_JWT_SECRET, {
        expiresIn: "6h",
    });
};

//* Generate refresh token
const generateRefreshToken = (user) => {
    return jwt.sign({ email: user.email }, process.env.REFRESH_JWT_SECRET, {
        expiresIn: "7d",
    });
};

// Todo Register user 
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    //* Validate input
    if (!username) return res.status(400).json({ message: "User  name is required" });
    if (!email) return res.status(400).json({ message: "email is required" });
    if (!password) return res.status(400).json({ message: "password is required" });
    if (!req.file) return res.status(400).json({ message: "Image is required" });

    //* Check if user already exists
    const user = await User.findOne({ email: email });
    if (user) return res.status(401).json({ message: "Email already exists" });

    const imageUrl = await uploadImgToCloudinary(req.file.path);

    const createUser = await User.create({
        username,
        email,
        password,
        Image: imageUrl
    });
    res.status(200).json({ message: "user registered successfully", data: createUser });
};

// Todo Login user 
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    //* Check if email and password are provided
    if (!email) return res.status(400).json({ message: "email required" });
    if (!password) return res.status(400).json({ message: "password required" });

    //* Check if the user exists
    const user = await User.findOne({ email: email });
    if (!user) return res.status(404).json({ message: "no user found" });

    //* Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(404).json({ message: "Incorrect password" });


    //* Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    //* Set refresh token in cookies
    res.cookie("refreshToken", refreshToken, { http: true, secure: false });

    //* Respond with success message and tokens
    res.status(200).json({
        message: "user logged In successfully",
        accessToken,
        refreshToken,
        data: user,
    });
};


//* Todo logout User
const logoutUser = async (req, res) => {
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "user logout successfully" });
};

//* Todo refresh Token
const refreshToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: "no refresh token found!" });

    const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);

    const user = await User.findOne({ email: decodedToken.email });

    if (!user) return res.status(404).json({ message: "invalid refresh token" });

    const generateToken = generateAccessToken(user);
    res.status(200).json({ message: "access token generated", accesstoken: generateToken });

    res.json({ decodedToken }); //* This line will never be reached due to the previous res.json call
};


export { registerUser, loginUser, logoutUser, refreshToken };

//* Todo authenticate user middleware

// //* Todo upload image
// const uploadImage = async (req, res) => {
//     if (!req.file)
//         return res.status(400).json({
//             message: "no image file uploaded",
//         });

//     try {
//         const uploadResult = await uploadImageToCloudinary(req.file.path);

//         if (!uploadResult)
//             return res
//                 .status(500)
//                 .json({ message: "error occurred while uploading image" });

//         res.json({
//             message: "image uploaded successfully",
//             url: uploadResult,
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: "error occurred while uploading image" });
//     }
// };