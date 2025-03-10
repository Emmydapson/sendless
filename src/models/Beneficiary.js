import mongoose from "mongoose";

const BeneficiarySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    currency: { type: String, required: true },
    country: { type: String, required: true },
    swiftCode: { type: String }, // For international transfers
    iban: { type: String }, // For international transfers (optional)
    type: { type: String, enum: ["local", "international"], required: true }, // Distinguish between local & international beneficiaries
  },
  { timestamps: true }
);

export default mongoose.model("Beneficiary", BeneficiarySchema);
