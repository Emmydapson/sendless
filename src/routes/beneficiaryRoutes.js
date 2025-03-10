import express from "express";
import {
  addBeneficiaryController,
  getUserBeneficiariesController,
  updateBeneficiaryController,
  deleteBeneficiaryController,
} from "../controllers/beneficiaryController.js";
import {authMiddleware} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, addBeneficiaryController); // Add Beneficiary
router.get("/", authMiddleware, getUserBeneficiariesController); // Get Beneficiaries
router.put("/:beneficiaryId", authMiddleware, updateBeneficiaryController); // Update Beneficiary
router.delete("/:beneficiaryId", authMiddleware, deleteBeneficiaryController); // Delete Beneficiary

export default router;
