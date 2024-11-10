import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js'; 
import { db } from '../../db/server.db.js';

const { User } = db;

const verifySession = asyncHandler(async (req, _, next) => {
    if (!req.session || !req.session.userId) {
        return next(new ApiError(401, "Not authenticated. Please log in."));
    }

    try {
        const user = await User.findOne({
            where: { userid: req.session.userid },
            attributes: { exclude: ['otp', 'refreshToken'] },
        });

        if (!user) {
            return next(new ApiError(401, "Session is invalid. Please log in again."));
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Error verifying session:", error);
        next(new ApiError(500, "Internal server error. Could not verify session."));
    }
});

export { verifySession };
