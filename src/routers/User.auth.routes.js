import { Router} from 'express';
import {otpSend,otpVerify,sendEmailVerification,verifyEmail,customerLogOut,} from '../controllers/User.controller.js';

const router = Router();

router.route('/sendOtp').post(otpSend);
router.route('/otpVerify').post(otpVerify);

export default router;