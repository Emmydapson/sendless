import mongoose from 'mongoose';

const virtualCardSchema = new mongoose.Schema({
  cardType: {
    type: String,
    required: true,
    enum: ['Mastercard', 'Visa', 'Debit'],
  },
  cardNumber: {
    type: String,
    required: true,
  },
  expiryDate: {
    type: String,
    required: true,
  },
  cvv: {
    type: String,
    required: true,
  },
});


const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  gender: { type: String, required: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  status: { type: String, default: 'Pending' }, // e.g., Pending, Delivered, Failed
  otpExpires: { type: Date },
  kyc: {
    status: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending' },
    faceImage: { type: String }, // Store face image URL
    kycPhoto: { type: String }, // ID document photo
  },
  pin: { type: String },
  virtualCards: [virtualCardSchema],
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
