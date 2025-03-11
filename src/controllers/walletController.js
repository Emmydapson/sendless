import { createWallet, getUserWallets,  } from "../services/walletService.js";
import {initiateCardPayment} from "../services/fincraService.js"
import axios from "axios";
import dotenv from "dotenv";
import Wallet from "../models/Wallet.js";
import User from "../models/User.js";

dotenv.config();

const FINCRA_SECRET_KEY = process.env.FINCRA_SECRET_KEY;
const FINCRA_BASE_URL = "https://api.fincra.com/v1/disbursements";
const FINCRA_FX_URL = "https://api.fincra.com/v1/marketplace-currency-rates";

/**
 * Create a new wallet for a user
 */
export const createUserWallet = async (req, res) => {
  try {
    const { userId, currency } = req.body;
    if (!["NGN", "USD", "CAD"].includes(currency)) {
      return res.status(400).json({ success: false, message: "Invalid currency. Supported: NGN, USD, CAD." });
    }
    const wallet = await createWallet(userId, currency);
    res.status(201).json({ success: true, wallet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get all wallets for a user
 */
export const getUserWalletsController = async (req, res) => {
  try {
    const { userId } = req.params;
    const wallets = await getUserWallets(userId);
    res.status(200).json({ success: true, wallets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Fund wallet via card payment
 */
export const fundWalletWithCard = async (req, res) => {
  try {
    const { userId, amount, currency } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const paymentData = await initiateCardPayment(userId, amount, currency);
    return res.status(200).json({ success: true, paymentUrl: paymentData.data.paymentLink });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fund wallet." });
  }
};

/**
 * Transfer funds between wallets
 */
export const transferBetweenWallets = async (req, res) => {
  try {
    const { senderWalletId, receiverWalletId, amount } = req.body;
    if (!senderWalletId || !receiverWalletId || !amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid request data" });
    }
    
    const senderWallet = await Wallet.findById(senderWalletId);
    const receiverWallet = await Wallet.findById(receiverWalletId);
    if (!senderWallet || !receiverWallet) {
      return res.status(404).json({ success: false, message: "Wallet not found" });
    }
    if (senderWallet.balance < amount) {
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }
    if (senderWallet.currency !== receiverWallet.currency) {
      return res.status(400).json({ success: false, message: "Currency mismatch" });
    }

    senderWallet.balance -= amount;
    receiverWallet.balance += amount;
    await senderWallet.save();
    await receiverWallet.save();

    return res.status(200).json({ success: true, message: "Transfer successful" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Transfer failed" });
  }
};

/**
 * Withdraw funds to a bank account
 */
export const withdrawToBank = async (req, res) => {
  try {
    const { walletId, amount, bankCode, accountNumber, accountName } = req.body;
    const wallet = await Wallet.findById(walletId);
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ success: false, message: "Invalid wallet or insufficient balance" });
    }
    
    const response = await axios.post(`${FINCRA_BASE_URL}/bank-transfer`, {
      amount,
      currency: wallet.currency,
      bankCode,
      accountNumber,
      accountName,
      narration: "Withdrawal",
    }, { headers: { Authorization: `Bearer ${FINCRA_SECRET_KEY}` } });

    if (response.data.status !== "success") {
      return res.status(400).json({ success: false, message: "Fincra transfer failed" });
    }

    wallet.balance -= amount;
    await wallet.save();
    return res.status(200).json({ success: true, message: "Withdrawal successful" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Withdrawal failed" });
  }
};

/**
 * Convert currency between wallets
 */
export const convertCurrency = async (req, res) => {
  try {
    const { walletId, targetCurrency, amount } = req.body;
    const wallet = await Wallet.findById(walletId);
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ success: false, message: "Invalid wallet or insufficient balance" });
    }
    
    const response = await axios.get(`${FINCRA_FX_URL}`, {
      headers: { Authorization: `Bearer ${FINCRA_API_KEY}` },
      params: { from: wallet.currency, to: targetCurrency },
    });
    
    if (!response.data || !response.data.rate) {
      return res.status(400).json({ success: false, message: "Failed to fetch exchange rate" });
    }
    
    const exchangeRate = response.data.rate;
    const convertedAmount = amount * exchangeRate;
    wallet.balance -= amount;
    
    const targetWallet = await Wallet.findOne({ userId: wallet.userId, currency: targetCurrency });
    if (!targetWallet) {
      return res.status(404).json({ success: false, message: "Target wallet not found" });
    }
    
    targetWallet.balance += convertedAmount;
    await wallet.save();
    await targetWallet.save();

    return res.status(200).json({ success: true, message: "Currency conversion successful", convertedAmount });
  } catch (error) {
    res.status(500).json({ success: false, message: "Currency conversion failed" });
  }
};

/**
 * Get transaction history with filters
 */
export const getTransactionHistory = async (req, res) => {
  try {
    const { walletId } = req.params;
    const { type, startDate, endDate, minAmount, maxAmount, page = 1, limit = 10 } = req.query;

    if (!walletId) {
      return res.status(400).json({ success: false, message: "Wallet ID is required" });
    }

    // Find wallet
    const wallet = await Wallet.findById(walletId);

    if (!wallet) {
      return res.status(404).json({ success: false, message: "Wallet not found" });
    }

    let filteredTransactions = wallet.transactions;

    // Filter by transaction type (credit or debit)
    if (type) {
      filteredTransactions = filteredTransactions.filter((tx) => tx.type === type.toLowerCase());
    }

    // Filter by date range
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : new Date("2000-01-01"); // Default old date
      const end = endDate ? new Date(endDate) : new Date(); // Default today

      filteredTransactions = filteredTransactions.filter((tx) => {
        const txDate = new Date(tx.date);
        return txDate >= start && txDate <= end;
      });
    }

    // Filter by amount range
    if (minAmount || maxAmount) {
      const min = minAmount ? parseFloat(minAmount) : 0;
      const max = maxAmount ? parseFloat(maxAmount) : Number.MAX_VALUE;

      filteredTransactions = filteredTransactions.filter((tx) => tx.amount >= min && tx.amount <= max);
    }

    // Pagination setup
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    // Slice transactions for pagination
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

    return res.status(200).json({
      success: true,
      page: pageNumber,
      limit: pageSize,
      totalTransactions: filteredTransactions.length,
      transactions: paginatedTransactions,
    });
  } catch (error) {
    console.error("Transaction history pagination error:", error.message);
    res.status(500).json({ success: false, message: "Failed to retrieve transactions" });
  }
};
