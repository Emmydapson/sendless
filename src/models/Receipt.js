import mongoose from "mongoose";

const receiptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction", required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ["credit", "debit"], required: true },
  date: { type: Date, default: Date.now },
  details: { type: String, required: true },
});

export default mongoose.model("Receipt", receiptSchema);
