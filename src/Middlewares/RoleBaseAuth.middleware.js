import { ApiError } from '../utils/ApiError.js';
import { db } from '../db/server.db.js';

const { User } = db;

const authorizeRoles = (...roles) => {
    return async (req, res, next) => {
        try {
            if (!req.session || !req.session.userId) {
                return res.status(401).json(new ApiError(401, "Unauthorized"));
            }
            const user = await User.findByPk(req.session.userId);
            if (!user) {
                return res.status(404).json(new ApiError(404, "User not found"));
            }
            if (!roles.includes(user.role)) {
                return res.status(403).json(new ApiError(403, "Access denied"));
            }
            next();
        } catch (error) {
            next(new ApiError(500, "Role authorization failed"));
        }
    };
};

export default authorizeRoles;
