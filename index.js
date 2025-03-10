import express from 'express';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/authRoute.js';
import walletRoute from './src/routes/walletRoute.js';
import virtualCardRoute from './src/routes/virtualCardRoutes.js';
import profileRoute from './src/routes/profileRoute.js';
import bankStatementRoutes from './src/routes/bankStatementRoutes.js';
import beneficiaryRoutes from './src/routes/beneficiaryRoutes.js';
import receiptRoutes from './src/routes/receiptRoutes.js';
import deliveryWebhookRoute from './src/controllers/deliveryWebhook.js';
import webhookRoutes from "./src/routes/webhookRoutes.js";
import { sendBankStatement } from "./src/utils/bankStatementService.js";
import cron from "node-cron";  // Import node-cron
import User from "./src/models/User.js"; // Import User model if not already imported

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// Default route for root path
app.get('/', (req, res) => {
    res.send('Server is up and running.');
});

app.use('/api/virtual-cards', virtualCardRoute);
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoute);
app.use('/api/profile', profileRoute);
app.use('/api', deliveryWebhookRoute);
app.use('/api/receipt', receiptRoutes);
app.use('/api/bankstatement', bankStatementRoutes);
app.use('/api/beneficiary', beneficiaryRoutes);
app.use("/api/webhook", webhookRoutes);

// Run on the 1st day of every month at 12:00 AM
cron.schedule("0 0 1 * *", async () => {
  console.log("Sending monthly bank statements...");
  const users = await User.find(); // Ensure User model is correctly imported
  users.forEach((user) => sendBankStatement(user._id, user.email));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
