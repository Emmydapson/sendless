import express from "express";
import { createVirtualCard, getVirtualCard, updateCardStatus } from "../controllers/virtualCardController.js";

const router = express.Router();

router.post("/create", createVirtualCard);
router.get("/:userId", getVirtualCard);
router.put("/update-status", updateCardStatus);

export default router;
