import Wallet from "../models/Wallet.js";
import Transaction from "../models/Transaction.js";
import crypto from "crypto";
import dotenv from "dotenv";
import Beneficiary from "../models/Beneficiary.js";

dotenv.config();

const FINCRA_WEBHOOK_SECRET = process.env.FINCRA_WEBHOOK_SECRET;

// Function to verify Fincra webhook signature securely
const verifyFincraSignature = (req) => {
  const signature = req.headers["x-fincra-signature"];
  const payload = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac("sha256", FINCRA_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
};

// Webhook to handle Fincra payment notifications
export const handleFincraWebhook = async (req, res) => {
  try {
    if (!verifyFincraSignature(req)) {
      console.warn("Invalid Fincra signature detected.");
      return res.status(401).json({ success: false, message: "Invalid signature" });
    }

    const { event, data } = req.body;

    if (event === "virtual_account.payment.success") {
      const { amount, currency, accountNumber, reference } = data;

      // Check if transaction already exists (to prevent duplicates)
      const existingTransaction = await Transaction.findOne({ reference });
      if (existingTransaction) {
        return res.status(200).json({ success: true, message: "Duplicate event ignored" });
      }

      // Find the wallet using accountNumber
      const wallet = await Wallet.findOne({ accountNumber });
      if (!wallet) {
        console.error(`Wallet not found for account: ${accountNumber}`);
        return res.status(404).json({ success: false, message: "Wallet not found" });
      }

      // Store the transaction record
      const transaction = new Transaction({
        userId: wallet.userId,
        type: "deposit",
        amount,
        currency,
        status: "success",
        reference,
      });
      await transaction.save();

      // Update the wallet balance atomically
      wallet.balance += amount;
      await wallet.save();

      console.log(`Deposit of ${amount} ${currency} received for ${wallet.accountNumber}.`);

      return res.status(200).json({ success: true, message: "Wallet updated successfully" });
    }

    if (event === "virtual_account.payment.failed") {
      console.warn("Payment failed event received:", data);
      return res.status(200).json({ success: false, message: "Payment failed" });
    }

    console.log("Unhandled event type:", event);
    return res.status(400).json({ success: false, message: "Unhandled event type" });
  } catch (error) {
    console.error("Webhook processing error:", error.message);
    res.status(500).json({ success: false, message: "Webhook processing failed" });
  }
};

export const handleBeneficiaryUpdateWebhook = async (req, res) => {
  try {
    const { event, data } = req.body;

    if (event === "beneficiary.updated") {
      const { accountNumber, bankName, currency, country } = data;

      await Beneficiary.findOneAndUpdate(
        { accountNumber },
        { bankName, currency, country },
        { new: true }
      );
    }

    res.status(200).json({ success: true, message: "Webhook received" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}