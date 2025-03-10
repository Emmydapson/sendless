import Wallet from "../models/Wallet.js";
import Transaction from "../models/Transaction.js";
import Beneficiary from "../models/Beneficiary.js";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const FINCRA_WEBHOOK_SECRET = process.env.FINCRA_WEBHOOK_SECRET;

// Securely verify Fincra webhook signature
const verifyFincraSignature = (req) => {
  const signature = req.headers["x-fincra-signature"];
  if (!signature) return false; // Prevent undefined errors

  const payload = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac("sha256", FINCRA_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature, "utf-8"),
    Buffer.from(expectedSignature, "utf-8")
  );
};

// Handle Fincra Payment Webhook
export const handleFincraWebhook = async (req, res) => {
  try {
    if (!verifyFincraSignature(req)) {
      console.warn("Invalid Fincra signature detected.");
      return res.status(401).json({ success: false, message: "Invalid signature" });
    }

    const { event, data } = req.body;

    if (event === "virtual_account.payment.success") {
      const { amount, currency, accountNumber, reference } = data;

      // Prevent duplicate transactions
      const existingTransaction = await Transaction.findOne({ reference });
      if (existingTransaction) {
        console.log("Duplicate transaction detected, ignoring...");
        return res.status(200).json({ success: true, message: "Duplicate transaction ignored" });
      }

      // Find the associated wallet
      const wallet = await Wallet.findOne({ accountNumber });
      if (!wallet) {
        console.error(`Wallet not found for account: ${accountNumber}`);
        return res.status(404).json({ success: false, message: "Wallet not found" });
      }

      // Store the transaction first
      await Transaction.create({
        userId: wallet.userId,
        type: "deposit",
        amount,
        currency,
        status: "success",
        reference,
      });

      // Atomic wallet balance update
      await Wallet.findOneAndUpdate(
        { accountNumber },
        { $inc: { balance: amount } },
        { new: true }
      );

      console.log(`Deposit of ${amount} ${currency} credited to ${wallet.accountNumber}.`);

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

// Handle Beneficiary Update Webhook
export const handleBeneficiaryUpdateWebhook = async (req, res) => {
  try {
    const { event, data } = req.body;

    if (event === "beneficiary.updated") {
      const { accountNumber, bankName, currency, country } = data;

      const updatedBeneficiary = await Beneficiary.findOneAndUpdate(
        { accountNumber },
        { bankName, currency, country },
        { new: true }
      );

      if (!updatedBeneficiary) {
        console.warn(`Beneficiary with account ${accountNumber} not found.`);
      }
    }

    res.status(200).json({ success: true, message: "Webhook received" });
  } catch (error) {
    console.error("Error processing beneficiary webhook:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};
