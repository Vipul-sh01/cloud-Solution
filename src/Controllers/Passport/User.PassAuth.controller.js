import passport from '../../db/passport.js'; 
import { ApiResponse } from '../../utils/ApiResponse.js'; 
import { asyncHandler } from '../../utils/asyncHandler.js'; 
import { validatePassword, validatePhoneNumber, validateRequiredFields, validateEmail } from "../../utils/validation.js";
import { ApiError } from '../../utils/ApiError.js';
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

export { PassportRegister, PassportLogIn, PassportLogOut };
