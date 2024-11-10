import { Router } from 'express';
import { otpSend, otpVerify } from '../Controllers/Auth.controllers/User.PhoneAuth.controller.js';
import { LogIn, LogOut, RegisterUser } from '../Controllers/Auth.controllers/User.register.controller.js';
import { sendEmailVerification, verifyEmail } from '../Controllers/Auth.controllers/User.EmailAuth.controller.js';
import{ PassAuthRegister, PassportLogIn } from '../Controllers/Passport/User.PassAuth.controller.js';
import { verifySession } from '../Middlewares/AuthMiddleware/auth.middlewares.js';
const router = Router();

router.route('/Register').post(RegisterUser);
router.route('/LogIn').post(LogIn);
router.route('/LogOut').post(verifySession, LogOut);

//using Passport
router.route('/login').post(PassportLogIn);
router.route('/register').post(PassAuthRegister);
router.route('/logout').post(verifySession,PassportLogIn);


router.route('/sendOtp').post(otpSend);
router.route('/otpVerify').post(otpVerify);
router.route('/Emailverification').post(sendEmailVerification);
router.route('/verify-email/:token').get(verifyEmail);

export default router;
