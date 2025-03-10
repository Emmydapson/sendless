import express from "express";
import { getUserReceipts } from "../controllers/receiptController.js";

const router = express.Router();

router.get("/:userId", getUserReceipts);

export default router;
