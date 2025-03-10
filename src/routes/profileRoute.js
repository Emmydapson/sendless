import express from 'express';
import { updateProfile, getProfile } from '../controllers/profileController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';  // Authentication middleware

const router = express.Router();

// Route to update profile
router.put('/update', authMiddleware, updateProfile);

// Route to get profile
router.get('/', authMiddleware, getProfile);

export default router;
