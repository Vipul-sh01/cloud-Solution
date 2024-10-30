import { Router } from 'express';
import { otpSend, otpVerify, sendEmailVerification, verifyEmail, UserLogOut } from '../controllers/User.controller.js';

const router = Router();

router.route('/sendOtp').post(otpSend);
router.route('/otpVerify').post(otpVerify);
router.route('/EmailOtp').post(sendEmailVerification);
router.route('/:VerifyEmailOtp').post(verifyEmail);

export default router;