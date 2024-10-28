import { UserModel } from '../models/User.model';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js'; 
import { db } from '../db/server.db.js';


const User = UserModel(db, db.Sequelize.DataTypes); 

export const verifySession = asyncHandler(async (req, _, next) => {
    try {
        if (!req.session || !req.session.customerId) {
            throw new ApiError(401, "Not authenticated. Please log in.");
        }
        const customer = await User.findByPk(req.session.customerId, {
            attributes: { exclude: ['otp', 'refreshToken'] },
        });
        if (!customer) {
            throw new ApiError(401, "Session is invalid. Please log in again.");
        }

        req.customer = customer;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Unauthorized access");
    }
});
