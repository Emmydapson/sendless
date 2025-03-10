import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["deposit", "withdrawal", "transfer"], required: true },
  amount: { type: Number, required: true },
  currency: { type: String, enum: ["NGN", "USD", "CAD"], required: true },
  status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
  reference: { type: String, unique: true, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
