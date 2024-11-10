import passport from '../../db/passport.js'; 
import { ApiResponse } from '../../utils/ApiResponse.js'; 
import { asyncHandler } from '../../utils/asyncHandler.js'; 
import { db } from "../../db/server.db.js";

const { User } = db;
const allowedRoles = ['admin', 'user'];


const PassAuthRegister = asyncHandler(async (req, res, next) => {
    const { email, password, role } = req.body;

    if (role && !allowedRoles.includes(role)) {
        return res.status(400).json(new ApiResponse(400, null, 'Invalid role.'));
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        return res.status(400).json(new ApiResponse(400, null, 'Email already in use.'));
    }

    
    const newUser = await User.create({
        email,
        password,
        role: role || 'user',  
        isEmailVerified: false, 
    });

    await UserRole.create({
        userId: newUser.userid,
        role: newUser.role,  
    });

    return res.status(201).json(new ApiResponse(201, { user: newUser }, 'User registered successfully.'));
});

const PassportLogIn = asyncHandler(async (req, res, next) => {
    passport.authenticate('local', async (err, user, info) => {
        if (err) {
            return next(err);
        }

        if (!user) {
            return res.status(401).json(info); 
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

const PassAuthelogOut = asyncHandler(async (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err); 
        }
        return res.status(200).json(new ApiResponse(200, null, 'User logged out successfully.'));
    });
});

export { PassAuthRegister, PassportLogIn, PassAuthelogOut };
