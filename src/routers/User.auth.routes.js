import { Router } from 'express';
import { otpSend, otpVerify, UserLogOut } from '../controllers/Auth.controllers/User.PhoneAuth.controller.js';
import { LogIn, LogOut, RegisterUser } from '../controllers/Auth.controllers/User.register.controller.js';
import { sendEmailVerification, verifyEmail } from '../controllers/Auth.controllers/User.EmailAuth.controller.js';
import { verifySession } from '../middlewares/AuthMiddleware/auth.middlewares.js';
const router = Router();

router.route('/Register').post(RegisterUser);
router.route('/LogIn').post(LogIn);
router.route('/LogOut').post(verifySession, LogOut);


router.route('/sendOtp').post(otpSend);
router.route('/otpVerify').post(otpVerify);
router.route('/EmailOtp').post(sendEmailVerification);
router.route('/:VerifyEmailOtp').post(verifyEmail);

export default router;