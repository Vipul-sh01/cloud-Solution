import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import bcrypt from 'bcrypt';
import { db } from '../../db/server.db.js';

const { User, UserRole } = db;

passport.serializeUser((user, done) => {
    done(null, user.id); // assuming 'id' is the primary key for User
});

passport.deserializeUser(asyncHandler(async (id, done) => {
    const user = await User.findByPk(id, {
        include: UserRole, // Include the role relationship if needed for permissions
    });
    done(null, user);
}));

passport.use(
    new LocalStrategy(
        { usernameField: 'email', passwordField: 'password' },
        asyncHandler(async (email, password, done) => {
            const user = await User.findOne({
                where: { email },
                include: UserRole, // Include the role for checking permissions later if needed
            });
            if (!user) {
                const response = new ApiResponse(401, null, 'Incorrect email or password.');
                return done(null, false, response);
            }

            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                const response = new ApiResponse(401, null, 'Incorrect email or password.');
                return done(null, false, response);
            }

            if (!user.isEmailVerified) {
                const response = new ApiResponse(403, null, 'Please verify your email to login.');
                return done(null, false, response);
            }

            return done(null, user);
        })
    )
);

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/auth/google/callback',
        },
        asyncHandler(async (accessToken, refreshToken, profile, done) => {
            let user = await User.findOne({ where: { googleId: profile.id } });
            if (!user) {
                user = await User.findOne({ where: { email: profile.emails[0].value } });
                if (user) {
                    user.googleId = profile.id;
                    await user.save();
                } else {
                    user = await User.create({
                        googleId: profile.id,
                        email: profile.emails[0].value,
                        isEmailVerified: true,
                        roleId: await UserRole.findOne({ where: { name: 'user' } }).then(role => role.id), // Set default role ID
                    });
                }
            }
            return done(null, user);
        })
    )
);

passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET,
            callbackURL: '/auth/facebook/callback',
            profileFields: ['id', 'emails', 'name'],
        },
        asyncHandler(async (accessToken, refreshToken, profile, done) => {
            let user = await User.findOne({ where: { facebookId: profile.id } });
            if (!user) {
                user = await User.findOne({ where: { email: profile.emails[0].value } });
                if (user) {
                    user.facebookId = profile.id;
                    await user.save();
                } else {
                    user = await User.create({
                        facebookId: profile.id,
                        email: profile.emails[0].value,
                        isEmailVerified: true,
                        roleId: await UserRole.findOne({ where: { name: 'user' } }).then(role => role.id), // Set default role ID
                    });
                }
            }
            return done(null, user);
        })
    )
);

export const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json(new ApiResponse(401, null, 'Unauthorized access. Please log in.'));
};

export const ensureRole = (requiredRole) => async (req, res, next) => {
    if (req.isAuthenticated()) {
        const userRole = await UserRole.findByPk(req.user.roleId); // Fetch user's role
        if (userRole && userRole.name === requiredRole) {
            return next();
        }
    }
    res.status(403).json(new ApiResponse(403, null, 'Forbidden. Insufficient privileges.'));
};

export default passport;
