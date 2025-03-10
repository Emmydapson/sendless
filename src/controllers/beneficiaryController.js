import * as beneficiaryService from "../services/beneficiaryService.js";

// Add Beneficiary
export const addBeneficiaryController = async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from auth middleware
    const beneficiary = await beneficiaryService.addBeneficiary(userId, req.body);
    res.status(201).json({ success: true, beneficiary });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get User's Beneficiaries
export const getUserBeneficiariesController = async (req, res) => {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
  
      const result = await beneficiaryService.getUserBeneficiaries(userId, page, limit);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  };
  

// Update Beneficiary
export const updateBeneficiaryController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { beneficiaryId } = req.params;
    const updatedBeneficiary = await beneficiaryService.updateBeneficiary(userId, beneficiaryId, req.body);
    res.status(200).json({ success: true, beneficiary: updatedBeneficiary });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete Beneficiary
export const deleteBeneficiaryController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { beneficiaryId } = req.params;
    const response = await beneficiaryService.deleteBeneficiary(userId, beneficiaryId);
    res.status(200).json({ success: true, message: response.message });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
