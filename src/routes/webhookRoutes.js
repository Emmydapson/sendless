import express from "express";
import { handleFincraWebhook, handleBeneficiaryUpdateWebhook  } from "../controllers/webhookController.js";
import { handleMxfaceWebhook } from '../controllers/mxWebhookController.js';

const router = express.Router();

router.post("/fincra-webhook", handleFincraWebhook);
router.post("/fincra", handleBeneficiaryUpdateWebhook);



export default router;
