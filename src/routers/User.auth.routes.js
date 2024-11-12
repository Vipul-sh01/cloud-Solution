import { Router } from 'express';
import { otpSend, otpVerify } from '../Controllers/Auth.controllers/User.PhoneAuth.controller.js';
import { sendEmailVerification, verifyEmail } from '../Controllers/Auth.controllers/User.EmailAuth.controller.js';
import{ PassportRegister, PassportLogIn, PassportLogOut } from '../Controllers/Passport/User.PassAuth.controller.js';

const router = Router();


//using Passport
router.route('/login').post(PassportLogIn);
router.route('/register').post(PassportRegister);
router.route('/logout').post(PassportLogOut);


router.route('/sendOtp').post(otpSend);
router.route('/otpVerify').post(otpVerify);
router.route('/Emailverification').post(sendEmailVerification);
router.route('/verify-email/:token').get(verifyEmail);

export default router;
