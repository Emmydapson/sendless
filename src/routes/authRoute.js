import express from 'express';
import {
  registerUser,
  verifyOTP,
  resendOTP,
  loginUser,
  createPin,
  submitKYC,
  verifyBVN

} from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { verifyFaceKYC } from '../controllers/authController.js';

const router = express.Router();

// Registration Routes
router.post('/register', registerUser);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);


// Login Route
router.post('/login', loginUser);

// Authenticated Routes
router.post('/create-pin', authMiddleware, createPin);
router.post('/kyc', authMiddleware, submitKYC);
router.post('/verify-bvn', authMiddleware, verifyBVN);
router.post('/kyc/verify-face', authMiddleware, verifyFaceKYC);


export default router;
