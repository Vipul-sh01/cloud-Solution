import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { db } from '../db/server.db.js';

const { User } = db;

passport.serializeUser((user, done) => {
    done(null, user.id); 
});

passport.deserializeUser(asyncHandler(async (id, done) => {
    const user = await User.findByPk(id);
    done(null, user);
}));

passport.use(
    new LocalStrategy(
        { usernameField: 'email', passwordField: 'password' },
        asyncHandler(async (email, password, done) => {
            const user = await User.findOne({ where: { email } });
            if (!user) {
                const response = new ApiResponse(401, null, 'Incorrect email or password.');
                return done(null, false, response);
            }

            const isValidPassword = await user.compareHash(password, 'password');
            if (!isValidPassword) {
                const response = new ApiResponse(401, null, 'Incorrect email or password.');
                return done(null, false, response);
            }

            if (!user.isEmailVerified) {
                const response = new ApiResponse(403, null, 'Please verify your email to login.');
                return done(null, false, response);
            }

            user.lastLogin = new Date(); 
            await user.save();

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
                        role: 'user',
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
                        role: 'user',
                    });
                }
            }
            return done(null, user);
        })
    )
);

export default passport;
