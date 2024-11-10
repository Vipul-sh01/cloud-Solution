import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { db } from './server.db.js';

const { User, UserRole } = db;

passport.serializeUser((user, done) => {
    done(null, user.userid); 
});

passport.deserializeUser(asyncHandler(async (id, done) => {
    const user = await User.findByPk(id, {
        include: UserRole,
    });
    done(null, user);
}));

passport.use(
    new LocalStrategy(
        { usernameField: 'email', passwordField: 'password' },
        asyncHandler(async (email, password, done) => {
            const user = await User.findOne({
                where: { email },
                include: UserRole,
            });

            if (!user) {
                return done(null, false, new ApiResponse(400, null, "Email and password are required"));
            }

            const isPasswordValid = await user.compareHash(password, "password");
            if (!isPasswordValid) {
                return done(null, false, new ApiResponse(400, null, "Incorrect email or password"));
            }

            if (!user.isEmailVerified) {
                return done(null, false, new ApiResponse(403, null, "Please verify your email to login."));
            }

            return done(null, user);
        })
    )
);

export default passport;
