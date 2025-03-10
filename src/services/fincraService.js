import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const FINCRA_BASE_URL = "https://sandboxapi.fincra.com"; // Use production URL when live
const HEADERS = {
  Authorization: `Bearer ${process.env.FINCRA_SECRET_KEY}`,
  "Content-Type": "application/json",
};

// Initialize Card Payment
export const initiateCardPayment = async (user, amount, currency) => {
  try {
    const response = await axios.post(
      `${FINCRA_BASE_URL}/payments/card`,
      {
        amount,
        currency,
        customer: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        redirectUrl: "https://yourapp.com/payment-success", // Handle in frontend
      },
      { headers: HEADERS }
    );
    return response.data;
  } catch (error) {
    console.error("Fincra Card Payment Error:", error.response?.data || error.message);
    throw new Error("Failed to initiate payment.");
  }
};

// Generate Bank Transfer Account
export const createVirtualBankAccount = async (user, currency) => {
  try {
    const response = await axios.post(
      `${FINCRA_BASE_URL}/bank-transfer/virtual-accounts`,
      {
        currency,
        customer: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
      { headers: HEADERS }
    );
    return response.data;
  } catch (error) {
    console.error("Fincra Virtual Account Error:", error.response?.data || error.message);
    throw new Error("Failed to create virtual bank account.");
  }
};

// Withdraw funds to bank account
export const withdrawToBank = async (wallet, amount, bankCode, accountNumber, accountName) => {
  try {
    const response = await axios.post(
      `${FINCRA_BASE_URL}/disbursements/bank-transfer`,
      {
        amount,
        currency: wallet.currency,
        destination: {
          bankCode,
          accountNumber,
          accountName,
        },
        narration: "Withdrawal from wallet",
      },
      { headers: HEADERS }
    );
    return response.data;
  } catch (error) {
    console.error("Fincra Withdrawal Error:", error.response?.data || error.message);
    throw new Error("Failed to withdraw funds.");
  }
};

// Convert Currency
export const convertCurrency = async (fromCurrency, toCurrency, amount) => {
  try {
    const response = await axios.get(
      `${FINCRA_BASE_URL}/marketplace-currency-rates?fromCurrency=${fromCurrency}&toCurrency=${toCurrency}&amount=${amount}`,
      { headers: HEADERS }
    );
    return response.data;
  } catch (error) {
    console.error("Fincra Currency Conversion Error:", error.response?.data || error.message);
    throw new Error("Failed to convert currency.");
  }
};

// Create Virtual Card
export const createFincraVirtualCard = async (userId, currency) => {
    try {
      const response = await axios.post(
        `${FINCRA_BASE_URL}/virtual-cards`,
        {
          currency,
          customer: {
            userId, // Pass userId to associate the card with a user
          },
        },
        { headers: HEADERS }
      );
  
      return response.data;
    } catch (error) {
      console.error("Fincra Virtual Card Error:", error.response?.data || error.message);
      throw new Error("Failed to create virtual card.");
    }
  };
  
  // Get Virtual Card Details
  export const getFincraVirtualCard = async (cardId) => {
    try {
      const response = await axios.get(
        `${FINCRA_BASE_URL}/virtual-cards/${cardId}`,
        { headers: HEADERS }
      );
  
      return response.data;
    } catch (error) {
      console.error("Fincra Get Virtual Card Error:", error.response?.data || error.message);
      throw new Error("Failed to retrieve virtual card.");
    }
  };
  
  // Freeze or Disable Virtual Card
  export const updateFincraCardStatus = async (cardId, status) => {
    try {
      const response = await axios.patch(
        `${FINCRA_BASE_URL}/virtual-cards/${cardId}`,
        { status },
        { headers: HEADERS }
      );
  
      return response.data;
    } catch (error) {
      console.error("Fincra Update Card Status Error:", error.response?.data || error.message);
      throw new Error("Failed to update card status.");
    }
  };
  
  // Set Spending Limits for Virtual Card
  export const setCardSpendingLimits = async (cardId, dailyLimit, weeklyLimit, monthlyLimit) => {
    try {
      const response = await axios.patch(
        `${FINCRA_BASE_URL}/virtual-cards/${cardId}/limits`,
        {
          dailyLimit,
          weeklyLimit,
          monthlyLimit,
        },
        { headers: HEADERS }
      );
  
      return response.data;
    } catch (error) {
      console.error("Fincra Set Spending Limits Error:", error.response?.data || error.message);
      throw new Error("Failed to set spending limits.");
    }
  };
  
