import passport from '../../db/passport.js';
import crypto from 'crypto';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResetEmail } from '../../utils/EmailSend.js';
import { validatePassword, validatePhoneNumber, validateRequiredFields, validateEmail } from "../../utils/validation.js";
import { ApiError } from '../../utils/ApiError.js';
import { db } from "../../db/server.db.js";
import { Op } from 'sequelize';

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

const PassportRegister = asyncHandler(async (req, res) => {
    const { email, password, role, phoneNumber } = req.body;

    const requiredFieldErrors = validateRequiredFields({ email, password, phoneNumber });
    const validationChecks = [
        { isValid: !requiredFieldErrors, error: requiredFieldErrors },
        { isValid: validateEmail(email), error: "Invalid email format." },
        { isValid: validatePassword(password), error: "Password must be at least 6 characters long, include uppercase and lowercase letters, a number, and a special character." },
        { isValid: validatePhoneNumber(phoneNumber), error: "Phone number must be in the format +91 followed by 10 digits." }
    ];

    for (const { isValid, error } of validationChecks) {
        if (!isValid) throw new ApiError(400, error);
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        throw new ApiError(409, "User already exists.");
    }

    const userRole = allowedRoles.includes(role) ? role : 'user';
    const user = await User.create({ email, password, role: userRole, phoneNumber });

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

const PassportLogIn = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    const requiredFieldErrors = validateRequiredFields({ email, password });
    const validationChecks = [
        {
            isValid: !requiredFieldErrors,
            error: new ApiError(400, requiredFieldErrors || "Email and password are required."),
        },
        {
            isValid: validateEmail(email),
            error: new ApiError(400, "Invalid email format."),
        },
        {
            isValid: validatePassword(password),
            error: new ApiError(400, "Password must be at least 6 characters long, include uppercase and lowercase letters, a number, and a special character."),
        },
    ];
    for (const { isValid, error } of validationChecks) {
        if (!isValid) throw error;
    }

    passport.authenticate('local', async (err, user, info) => {
        if (err) {
            return next(err);
        }

        if (!user) {
            return res.status(401).json(new ApiResponse(401, {}, info || "Invalid login credentials."));
        }

        const sanitizedUser = await User.findOne({
            where: { email: user.email },
            attributes: { exclude: ['password'] },
        });

        await new Promise((resolve, reject) => {
            req.login(sanitizedUser, (loginErr) => {
                if (loginErr) {
                    return reject(loginErr);
                }
                resolve();
            });
        });

        return res.status(200).json(new ApiResponse(200, { user: sanitizedUser }, 'Login successful'));
    })(req, res, next);
});

const PassportLogOut = asyncHandler(async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Session destruction error:", err);
            throw new ApiError(500, "Failed to log out.");
        }
        res.clearCookie("connect.sid");
        return res.status(200).json(new ApiResponse(200, {}, "User logged out successfully."));
    });
});

const ForgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!validateEmail(email)) throw new ApiError(400, "Invalid email format.");

    const user = await User.findOne({ where: { email } });
    if (!user) throw new ApiError(404, "User with this email does not exist.");

    const resetToken = crypto.randomBytes(3).toString("hex");
    const tokenExpiration = new Date(Date.now() + 3600000);

    await user.update({ resetToken, tokenExpiration });

    const resetUrl = `${req.protocol}://${req.get('host')}/verifyEmail/${resetToken}`;
    await sendResetEmail(email, resetUrl);

    return res.status(200).json(new ApiResponse(200, {}, "Password reset email sent successfully."));
});

const ResetPassword = asyncHandler(async (req, res) => {
    const { newPassword } = req.body;
    const { token } = req.params;

    if (!validatePassword(newPassword)) {
        throw new ApiError(400, "Password must be at least 6 characters long, include uppercase and lowercase letters, a number, and a special character.");
    }

    const user = await User.findOne({
        where: {
            resetToken: token,
            tokenExpiration: { [Op.gt]: new Date() }
        }
    });

    if (!user) throw new ApiError(400, "Invalid or expired reset token.");

    const updatedUser = await user.update({
        password: newPassword,  
        resetToken: null,
        tokenExpiration: null
    });

    return res.status(200).json(new ApiResponse(200, {}, "Password reset successfully"));
});


export { PassportRegister, PassportLogIn, PassportLogOut, ForgotPassword, ResetPassword };