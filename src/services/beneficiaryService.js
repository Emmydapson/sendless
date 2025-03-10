import Beneficiary from "../models/Beneficiary.js";
import axios from "axios";

// Validate Beneficiary with Fincra API
const validateInternationalBeneficiary = async (accountNumber, swiftCode, currency, country) => {
    try {
      const response = await axios.post(
        "https://api.fincra.com/beneficiary/validate",
        {
          accountNumber,
          swiftCode,
          currency,
          country,
        },
        {
          headers: {
            Authorization: `Bearer ${FINCRA_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      return response.data.success;
    } catch (error) {
      throw new Error("Failed to validate international beneficiary. Check details and try again.");
    }
  };
  
  // Add Beneficiary (with Fincra validation for international transfers)
  export const addBeneficiary = async (userId, beneficiaryData) => {
    const { name, bankName, accountNumber, currency, country, type, swiftCode, iban } = beneficiaryData;
  
    if (type === "international") {
      const isValid = await validateInternationalBeneficiary(accountNumber, swiftCode, currency, country);
      if (!isValid) throw new Error("Invalid international beneficiary details.");
    }
  
    const beneficiary = new Beneficiary({ userId, name, bankName, accountNumber, currency, country, type, swiftCode, iban });
    return await beneficiary.save();
  };

// Get all beneficiaries for a user
export const getUserBeneficiaries = async (userId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const beneficiaries = await Beneficiary.find({ userId }).skip(skip).limit(limit);
    const total = await Beneficiary.countDocuments({ userId });
  
    return {
      beneficiaries,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBeneficiaries: total,
    };
  };
  

// Delete a beneficiary
export const deleteBeneficiary = async (userId, beneficiaryId) => {
  const beneficiary = await Beneficiary.findOneAndDelete({ _id: beneficiaryId, userId });
  if (!beneficiary) throw new Error("Beneficiary not found or unauthorized");
  return { message: "Beneficiary deleted successfully" };
};
