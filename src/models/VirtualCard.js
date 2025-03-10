import mongoose from "mongoose";

const virtualCardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  cardNumber: { type: String, required: true, unique: true },
  cvv: { type: String, required: true },
  expiryDate: { type: String, required: true },
  balance: { type: Number, default: 0 },
  status: { type: String, enum: ["active", "frozen", "closed"], default: "active" },
  createdAt: { type: Date, default: Date.now },
  spendingLimits: {
    daily: { type: Number, default: 1000 }, // Default daily limit
    weekly: { type: Number, default: 5000 },
    monthly: { type: Number, default: 20000 },
  },
});

export default mongoose.model("VirtualCard", virtualCardSchema);
