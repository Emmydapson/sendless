import axios from "axios";
import Wallet from "../models/Wallet.js";
import dotenv from "dotenv";
import { createVirtualBankAccount } from "./fincraService.js";

dotenv.config();

const FINCRA_SECRET_KEY = process.env.FINCRA_SECRET_KEY;
const FINCRA_WALLET_URL = "https://api.fincra.com/merchant/virtual-accounts/request";

// Function to create a wallet
export const createWallet = async (user, currency) => {
  try {
    // Check if the user already has a wallet
    const existingWallet = await Wallet.findOne({ userId: user.id, currency });
    if (existingWallet) {
      throw new Error(`You already have a ${currency} wallet.`);
    }

    // Use fincraService to generate virtual account
    const fincraResponse = await createVirtualBankAccount(user.id, currency);
    if (!fincraResponse.data) throw new Error("Failed to create wallet with Fincra.");

    const walletData = fincraResponse.data;

    // Save wallet details in MongoDB
    const wallet = new Wallet({
      userId: user.id,
      currency,
      balance: 0, // Initialize balance at 0
      accountNumber: walletData.accountNumber,
      bankName: walletData.bankName,
      bankCode: walletData.bankCode,
      accountName: walletData.accountName,
      transactions: [] // Initialize empty transaction history
    });

    await wallet.save();
    return wallet;
  } catch (error) {
    console.error(`Error creating ${currency} wallet:`, error.message);
    throw new Error(`Wallet creation failed: ${error.message}`);
  }
};

// Get all wallets for a user
export const getUserWallets = async (userId) => {
  return await Wallet.find({ userId });
};

// Function to update wallet balance
export const updateWalletBalance = async (walletId, amount, type) => {
  try {
    const wallet = await Wallet.findById(walletId);
    if (!wallet) throw new Error("Wallet not found");

    if (type === "credit") {
      wallet.balance += amount;
    } else if (type === "debit") {
      if (wallet.balance < amount) throw new Error("Insufficient balance");
      wallet.balance -= amount;
    } else {
      throw new Error("Invalid transaction type");
    }

    await wallet.save();
    return wallet;
  } catch (error) {
    console.error("Error updating wallet balance:", error.message);
    throw new Error(`Balance update failed: ${error.message}`);
  }
};

// Function to convert currency using Fincra FX rates
export const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  try {
    const response = await axios.get(`https://api.fincra.com/v1/marketplace-currency-rates`, {
      headers: { Authorization: `Bearer ${FINCRA_SECRET_KEY}` },
      params: { from: fromCurrency, to: toCurrency }
    });
    
    if (!response.data || !response.data.rate) {
      throw new Error("Failed to fetch conversion rate");
    }

    const rate = response.data.rate;
    const convertedAmount = amount * rate;
    return { convertedAmount, rate };
  } catch (error) {
    console.error("Error converting currency:", error.message);
    throw new Error("Currency conversion failed");
  }
};

