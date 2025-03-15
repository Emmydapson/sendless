import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import parsePhoneNumber from 'libphonenumber-js';
import axios from 'axios';
import {
  registerSchema,
  otpSchema,
  loginSchema,
  pinSchema,
  kycSchema,
} from '../middlewares/authValidation.js';
import * as WalletController from './walletController.js';
import { compareFaces } from '../services/mxfaceService.js';
import {sendOTPEmail} from '../utils/authUtils.js'

// Utility function to send OTP via Termii
const sendOTPSMS = async (phone, otp) => {
  console.log(`Mock OTP sent to ${phone}: ${otp}`);
  return true; // Simulate a successful response
};


const checkTermiiStatus = async () => {
  console.log('Mock Termii status check: Service is active.');
  return true; // Simulate that the service is active
};



// Registration Controller
export const registerUser = async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { firstName, surname, email, phone, gender, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      if (!user.isVerified) {
        // Resend OTP if user already exists but isn't verified
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiration
        await sendOTPEmail(email, otp);
        await user.save();
        return res.status(200).json({
          message: 'User already exists but not verified. New OTP sent.',
        });
      }
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({
      firstName,
      surname,
      email,
      phone,
      gender,
      password: await bcrypt.hash(password, 10),
      isVerified: false, // Default is false
    });

    // Generate and send OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiration
    await sendOTPEmail(email, otp);
    await user.save();

    res.status(201).json({
      message: 'Registration successful. Verify OTP sent to your phone.',
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};



// OTP Verification Controller
export const verifyOTP = async (req, res) => {
  const { error } = otpSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email, otp });
    if (!user || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};



// Resend OTP Controller
export const resendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    // Generate and send a new OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiration
    await sendOTPEmail(user.email, otp);
    await user.save();

    res.status(200).json({ message: 'OTP resent successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Login Controller
export const loginUser = async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { emailOrPhone, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });

    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.isVerified)
      return res
        .status(400)
        .json({ message: 'Please verify your account before logging in.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};



// Create PIN Controller
export const createPin = async (req, res) => {
  const { error } = pinSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { pin } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.pin = await bcrypt.hash(pin, 10);
    await user.save();

    res.status(200).json({ message: 'PIN created successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// KYC Controller
// KYC Verification using Fincra
export const submitKYC = async (req, res) => {
  const { error } = kycSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { idType, idNumber, firstName, lastName, dob } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Call Fincra's KYC API
    const response = await axios.post(
      'https://sandbox-api.fincra.com/identity/verify',
      {
        idType, 
        idNumber,
        firstName,
        lastName,
        dateOfBirth: dob
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FINCRA_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      user.kyc = {
        idType,
        idNumber,
        status: 'Verified',
        verifiedAt: new Date(),
      };
      await user.save();
      return res.status(200).json({ message: 'KYC verification successful', details: response.data });
    } else {
      return res.status(400).json({ message: 'KYC verification failed', error: response.data });
    }
  } catch (err) {
    console.error('KYC Verification Error:', err.response?.data || err.message);
    return res.status(err.response?.status || 500).json({
      message: 'Error verifying KYC with Fincra',
      error: err.response?.data || err.message,
    });
  }
};


// BVN Verification Controller
export const verifyBVN = async (req, res) => {
  const { bvn } = req.body;

  if (!bvn) return res.status(400).json({ message: 'BVN is required' });

  try {
    const response = await axios.post(
      'https://sandbox.api.fincra.com/v1/identity/bvn',
      { bvn },
      {
        headers: {
          Authorization: `Bearer ${process.env.MAPLERAD_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
  
    if (response.data.status === 'success') {
      const { details } = response.data;
      console.log('BVN Verified:', details);
      return res.status(200).json({ message: 'BVN verification successful', details });
    } else {
      console.error('BVN Verification Failed:', response.data);
      return res.status(400).json({ message: 'BVN verification failed', error: response.data });
    }
  } catch (err) {
    console.error('Error Verifying BVN:', err.response?.data || err.message);
    return res.status(err.response?.status || 500).json({
      message: 'Server error during BVN verification',
      error: err.response?.data || err.message,
    });
  }
  
};

/**
 * Perform KYC Face Verification
 */
export const verifyFaceKYC = async (req, res) => {
  const { faceImage } = req.body;
  const userId = req.user.id;

  if (!faceImage) {
    return res.status(400).json({ message: 'Face image is required' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.kyc.kycPhoto) {
      return res.status(400).json({ message: 'No KYC document found. Upload your ID first.' });
    }

    // Compare ID document photo with the uploaded selfie
    const result = await compareFaces(user.kyc.kycPhoto, faceImage);

    if (result.confidence >= 80) {
      user.kyc.status = 'Verified';
      user.kyc.faceImage = faceImage; // Store the verified face image
      await user.save();

      // Send webhook notification
      sendWebhook(userId, 'kyc_verified', { message: 'Your KYC verification is successful' });

      return res.status(200).json({ message: 'Face KYC verified successfully', confidence: result.confidence });
    } else {
      user.kyc.status = 'Rejected';
      await user.save();

      // Send webhook notification
      sendWebhook(userId, 'kyc_failed', { message: 'Face does not match the ID' });

      return res.status(400).json({ message: 'Face does not match', confidence: result.confidence });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during face verification' });
  }
};