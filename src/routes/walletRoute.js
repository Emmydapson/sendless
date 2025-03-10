import express from "express";
import { createUserWallet, getUserWalletsController, transferBetweenWallets, withdrawToBank,convertCurrency, getTransactionHistory  } from "../controllers/walletController.js";

const router = express.Router();

router.post("/create-wallet", createUserWallet);
router.get("/user/:userId/wallets", getUserWalletsController);
router.post("/transfer", transferBetweenWallets);
router.post("/withdraw", withdrawToBank);
router.post("/convert", convertCurrency);
router.get("/transactions/:walletId", getTransactionHistory);


export default router;
