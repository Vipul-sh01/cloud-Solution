import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { db } from "../../db/server.db.js";

const { User } = db;
const allowedRoles = ['admin', 'user'];

const setSessionForUser = async (req, user) => {
    try {
        req.session.userid = user.userid;
        req.session.email = user.email;
        req.session.role = user.role;
        await req.session.save();
        return {
            userId: req.session.userid,
            email: req.session.email,
            message: "Session created successfully"
        };
    } catch (error) {
        console.error("Error during session creation:", error);
        throw new ApiError(500, "Failed to set session", error.errors);
    }
};

const RegisterUser = asyncHandler(async (req, res) => {
    const { email, password, role } = req.body;

    if (!email?.trim() || !password?.trim()) {
        throw new ApiError(400, "Email and password are required");
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        throw new ApiError(409, "User already exists.");
    }

    const userRole = allowedRoles.includes(role) ? role : 'user';
    const user = await User.create({ email, password, role: userRole });

    if (!user) {
        throw new ApiError(500, "Error while creating user.");
    }

    await setSessionForUser(req, user);
    const createdUser = await User.findOne({
        where: { email },
        attributes: { exclude: ['password'] },
    });

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully.")
    );
});

const LogIn = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email?.trim() || !password?.trim()) {
        throw new ApiError(400, "Email and password are required.");
    }

    const existingUser = await User.findOne({ where: { email } });
    if (!existingUser) {
        throw new ApiError(404, "Email does not exist.");
    }

    const isPasswordValid = await existingUser.compareHash(password, "password");
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password.");
    }

    const SetSession = await setSessionForUser(req, existingUser);

    const user = await User.findOne({
        where: { email },
        attributes: { exclude: ['password'] },
    });

    return res.status(200).json(
        new ApiResponse(200, { user, SetSession }, "User logged in successfully.")
    );
});

const LogOut = asyncHandler(async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Session destruction error:", err);
            throw new ApiError(500, "Failed to log out.");
        }
        res.clearCookie("connect.sid");
        return res.status(200).json(new ApiResponse(200, {}, "User logged out successfully."));
    });
});

export { RegisterUser, LogIn, LogOut };
