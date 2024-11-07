import { asyncHandler } from '../utils/asyncHandler.js';
import twilio from "twilio";
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { db } from '../db/server.db.js';

const { User } = db;

const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const otpSend = asyncHandler(async (req, res) => {
    const { phoneNumber } = req.body;
    const otpCode = Math.floor(100000 + Math.random() * 900000); 
    const otpExpiration = new Date(Date.now() + 10 * 60 * 1000);

    const existingUser = await User.findOne({ where: { phoneNumber } });
    if (existingUser) {
        throw new ApiError(400, "User already exists");
    }

    const user = await User.create({
        phoneNumber,
        otpCode,
        otpExpiration,
    });

    try {
        await client.messages.create({
            body: `Your verification code is ${otpCode}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber,
        });
    } catch (error) {
        throw new ApiError(500, "Failed to send OTP");
    }

    return res.status(200).json(new ApiResponse(200, null, "OTP sent successfully"));
});

const otpVerify = asyncHandler(async (req, res) => {
    const { otpCode, phoneNumber } = req.body;

    const user = await User.findOne({
        where: {
            phoneNumber,
            otpCode,
            otpExpiration: { [Op.gt]: new Date() },
        }
    });

    if (!user) {
        throw new ApiError(400, "Invalid or expired OTP.");
    }

    await user.update({
        isPhoneVerified: true,
        otpCode: null,
        otpExpiration: null,
    });

    return res.status(200).json(new ApiResponse(200, { user }, "OTP verified successfully"));
});

const sendEmailVerification = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const emailVerificationToken = crypto.randomBytes(20).toString('hex');
    const user = await User.findOne({ where: { email } });
    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    await user.update({ emailVerificationToken });

    const verificationUrl = `${req.protocol}://${req.get('host')}/verify-email/${emailVerificationToken}`;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Email Verification',
        html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json(new ApiResponse(200, null, "Verification email sent."));
    } catch (error) {
        throw new ApiError(500, "Failed to send verification email.");
    }
});


const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.params;

    const user = await User.findOne({ where: { emailVerificationToken: token } });
    if (!user) {
        throw new ApiError(400, "Invalid or expired token.");
    }

    await user.update({
        isEmailVerified: true,
        emailVerificationToken: null,
    });

    return res.status(200).json(new ApiResponse(200, { user }, "Email verified successfully"));
});


const UserLogOut = asyncHandler(async (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                throw new ApiError(500, "Logout failed");
            } else {
                res
                    .status(200)
                    .clearCookie('connect.sid')
                    .json(new ApiResponse(200, {}, "User logged out"));
            }
        });
    } else {
        throw new ApiError(400, "No active session found");
    }
});

export { 
    otpSend,
    otpVerify,
    sendEmailVerification,
    verifyEmail,
    UserLogOut,
};
