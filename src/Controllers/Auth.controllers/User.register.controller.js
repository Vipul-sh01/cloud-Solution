// import { asyncHandler } from "../../utils/asyncHandler.js";
// import { ApiError } from "../../utils/ApiError.js";
// import { ApiResponse } from "../../utils/ApiResponse.js";
// import { db } from "../../db/server.db.js";

// const { User } = db;
// const allowedRoles = ['admin', 'user'];


// const generateAndSendOTP = async (user) => {
//     const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
//     const otpExpiration = new Date(Date.now() + 10 * 60 * 1000); 

//     user.otpExpiration = otpExpiration;
//     await user.save();

//     console.log(`OTP Code sent to user: ${otpCode}`);
//     return otpCode;
// };


// const requestPasswordReset = asyncHandler(async (req, res) => {
//     const { email, phoneNumber } = req.body;

//     if (!email && !phoneNumber) {
//         throw new ApiError(400, "Email or phone number is required.");
//     }

//     const user = await User.findOne({
//         where: email ? { email } : { phoneNumber }
//     });

//     if (!user) {
//         throw new ApiError(404, "User not found.");
//     }

//     await generateAndSendOTP(user);

//     return res.status(200).json(new ApiResponse(200, {}, "OTP sent successfully."));
// });


// const verifyOTP = asyncHandler(async (req, res) => {
//     const { email, phoneNumber, otpCode } = req.body;
//     const user = await User.findOne({
//         where: email ? { email } : { phoneNumber }
//     });

//     if (!user) {
//         throw new ApiError(404, "User not found.");
//     }

//     const isOtpValid = await user.compareHash(otpCode, 'otpCode');
//     const isOtpExpired = user.otpExpiration && user.otpExpiration < new Date();

//     if (!isOtpValid || isOtpExpired) {
//         throw new ApiError(401, "Invalid or expired OTP.");
//     }

//     user.otpCode = null;
//     user.otpExpiration = null;
//     await user.save();

//     return res.status(200).json(new ApiResponse(200, {}, "OTP verified successfully."));
// });

// const resetPassword = asyncHandler(async (req, res) => {
//     const { email, phoneNumber, newPassword } = req.body;
//     const user = await User.findOne({
//         where: email ? { email } : { phoneNumber }
//     });

//     if (!user) {
//         throw new ApiError(404, "User not found.");
//     }

//     if (!newPassword || typeof newPassword !== 'string' || newPassword.trim() === '') {
//         throw new ApiError(400, "New password is required.");
//     }

//     user.password = newPassword; // The hook in the model will handle hashing
//     await user.save();

//     return res.status(200).json(new ApiResponse(200, {}, "Password reset successfully."));
// });


// export {  LogOut };
