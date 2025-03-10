import { sendBankStatement } from "../utils/bankStatementService.js";
import User from "../models/User.js";

// Request Bank Statement
export const requestBankStatement = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await sendBankStatement(userId, user.email);

    return res.status(200).json({ success: true, message: "Bank statement sent to your email." });
  } catch (error) {
    console.error("Request Bank Statement Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to generate bank statement" });
  }
};
