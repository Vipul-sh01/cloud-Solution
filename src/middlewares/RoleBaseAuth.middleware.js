import { ApiError } from '../utils/ApiError.js';
import { db } from '../db/server.db.js';
import UserModel from '../models/User.js'; 

const User = UserModel(db, db.Sequelize.DataTypes); 

const authorizeRoles = (...roles) => {
    return async (req, res, next) => {
        try {
            
            if (!req.session || !req.session.customerId) {
                return res.status(401).json(new ApiError(401, "Unauthorized"));
            }

            const customer = await User.findByPk(req.session.customerId); 
            if (!customer || !roles.includes(customer.role)) {
                return res.status(403).json(new ApiError(403, "Access denied"));
            }
            next();
        } catch (error) {
            next(new ApiError(500, "Role authorization failed"));
        }
    };
};

export default authorizeRoles;
