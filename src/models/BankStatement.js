import mongoose from "mongoose";

const bankStatementSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  currency: { type: String, enum: ["NGN", "USD", "CAD"], required: true },
  filePath: { type: String, required: true }, // Path to stored PDF
  generatedAt: { type: Date, default: Date.now },
});

const BankStatement = mongoose.model("BankStatement", bankStatementSchema);
export default BankStatement;
