import express from "express";
import { handleFincraWebhook, handleBeneficiaryUpdateWebhook } from "../controllers/webhookController.js";

const router = express.Router();

router.post("/fincra-webhook", handleFincraWebhook); // Payment Webhook
router.post("/fincra-beneficiary-webhook", handleBeneficiaryUpdateWebhook); // Beneficiary Update Webhook

export default router;
