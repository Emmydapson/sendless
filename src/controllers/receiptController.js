import Receipt from "../models/Receipt.js";
import { sendEmailReceipt } from "../utils/emailService.js";
import User from "../models/User.js";

// Generate Receipt After Transaction
export const generateReceipt = async (transaction) => {
    try {
      const newReceipt = await Receipt.create({
        userId: transaction.userId,
        transactionId: transaction._id,
        amount: transaction.amount,
        type: transaction.type,
        details: `Transaction of ${transaction.amount} ${transaction.currency} completed.`,
      });
  
      // Get User Email
      const user = await User.findById(transaction.userId);
      if (user) {
        await sendEmailReceipt(user.email, newReceipt);
      }
  
      return newReceipt;
    } catch (error) {
      console.error("Generate Receipt Error:", error.message);
    }
  };

// Get User Receipts
export const getUserReceipts = async (req, res) => {
  try {
    const { userId } = req.params;
    const receipts = await Receipt.find({ userId });

    if (!receipts.length) {
      return res.status(404).json({ success: false, message: "No receipts found" });
    }

    return res.status(200).json({ success: true, receipts });
  } catch (error) {
    console.error("Get Receipts Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to retrieve receipts" });
  }
};
