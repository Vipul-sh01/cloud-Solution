import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { db } from '../../db/server.db.js';


const { User } = db;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


const sendEmailVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const emailVerificationToken = crypto.randomBytes(3).toString('hex');

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  await user.update({ emailVerificationToken });

  const verificationUrl = `${req.protocol}://${req.get('host')}/verifyEmail/${emailVerificationToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Email Verification',
    html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
  };

  await transporter.sendMail(mailOptions);
    res.status(200).json(new ApiResponse(200, null, "Verification email sent."));
 
});


const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  if (!token) {
    throw new ApiError(400, "Verification token is required.");
  }
  console.log("Received token:", token);
  const user = await User.findOne({ where: { emailVerificationToken: token } });
  if (!user) {
    throw new ApiError(400, "Invalid or expired token.");
  }
  await user.update({
    isEmailVerified: true,
    emailVerificationToken: null,
  });
  return res.status(200).json(new ApiResponse(200, null, "Email verified successfully"));
});



export { sendEmailVerification, verifyEmail };
