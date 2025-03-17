const JWT = require("jsonwebtoken");
const { hashPassword, comparePassword } = require("../helpers/authHelper");
const userModel = require("../models/userModel");
var { expressjwt: jwt } = require("express-jwt");

//middleware
const requireSignIn = jwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
});

const registerController = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        //validate
        if (!name) {
            return res.status(400).send({
                success: false,
                message: "name is required",
            });
        }
        if (!email) {
            return res.status(400).send({
                success: false,
                message: "email is required",
            });
        }
        if (!password || password.length < 6) {
            return res.status(400).send({
                success: false,
                message: "password is required and 6 character long",
            });
        }
        //exisiting user
        const exisitingUser = await userModel.findOne({ email });
        if (exisitingUser) {
            return res.status(400).send({
                success: false,
                message: "email already exists",
            });
        }
        //hash password
        const hashedPassword = await hashPassword(password);

        //save user
        const user = await userModel({
            name,
            email,
            password: hashedPassword,
        }).save();

        res.status(201).send({
            success: true,
            message: "User registered successfully",
            user,
        });
    } catch (error) {
        console.log("error: " + error);
        return res.status(500).send({
            success: false,
            message: "Internal Server Error",
            error,
        });
    }
};

//login

const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        //validate
        if (!email || !password) {
            return res.status(500).send({
                success: false,
                message: "Please provide email and password",
            });
        }
        //find user
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(500).send({
                success: false,
                message: "User not found",
            });
        }
        //match password
        const match = await comparePassword(password, user.password);
        if (!match) {
            return res.status(500).send({
                success: false,
                message: "Incorrect password",
            });
        }
        //Token jwt
        const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });
        //undeinfed password
        user.password = undefined;
        res.status(200).send({
            success: true,
            message: "User logged in successfully",
            token,
            user,
        });
    } catch (error) {
        console.log("Error: " + error);
        return res.status(500).send({
            success: false,
            message: "Internal Server Error",
            error,
        });
    }
};

//update user

const updateUserController = async (req, res) => {
    try {
        const { name, password, email, avatar } = req.body;
        //user find
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found",
            });
        }
        //password validation
        if (password && password.length < 6) {
            return res.status(400).send({
                success: false,
                message: "Password should be 6 characters long",
            });
        }
        const hashedPassword = password
            ? await hashPassword(password)
            : undefined;
        //update user
        const updateUser = await userModel.findOneAndUpdate(
            { email },
            {
                name: name || user.name,
                password: hashedPassword || user.password,
                avatar: avatar || user.avatar,
            },
            { new: true }
        );
        updateUser.password = undefined;
        res.status(200).send({
            success: true,
            message: "Profile updated Please Login",
            updateUser,
        });
    } catch (error) {
        console.log("error: " + error);
        return res.status(500).send({
            success: false,
            message: "Internal Server Error Update",
            error,
        });
    }
};

module.exports = { requireSignIn, registerController, loginController, updateUserController };
