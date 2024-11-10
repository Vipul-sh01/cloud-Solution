import { asyncHandler } from '../../utils/asyncHandler.js';
import twilio from "twilio";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { db } from "../../db/server.db.js";

const { User } = db;

const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const otpSend = asyncHandler(async (req, res) => {
    const { phoneNumber } = req.body;
    const otpCode = Math.floor(100000 + Math.random() * 900000);
    const otpExpiration = new Date(Date.now() + 10 * 60 * 1000);

    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
        throw new ApiError(400, "User already exists");
    }

    const user = await User.create({
        phoneNumber,
        otpCode,
        otpExpiration,
    });
    await user.save();
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
    const { otpCode } = req.body;

    const user = await User.findOne({
        where: {
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
    UserLogOut,
};
