import express from "express";
import { requestBankStatement } from "../controllers/bankStatementController.js";

const router = express.Router();

router.get("/:userId", requestBankStatement);

export default router;
