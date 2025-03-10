import mongoose from "mongoose";

const walletSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  currency: { type: String, enum: ["NGN", "USD", "CAD"], required: true },
  accountNumber: { type: String, required: true, unique: true },
  bankName: { type: String, required: true },
  bankCode: { type: String, required: true },
  accountName: { type: String, required: true },
  balance: { type: Number, default: 0.0 },
  
  transactions: [
    {
      type: { type: String, enum: ["credit", "debit"], required: true },
      amount: { type: Number, required: true },
      description: { type: String },
      timestamp: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

walletSchema.index({ userId: 1, currency: 1 }, { unique: true }); // Prevents duplicate currency wallets

const Wallet = mongoose.model("Wallet", walletSchema);
export default Wallet;
