import fs from "fs";
import PDFDocument from "pdfkit";
import path from "path";
import Transaction from "../models/Wallet.js";
import { sendBankStatementEmail } from "./emailService.js";

// Generate Bank Statement
export const generateBankStatement = async (userId) => {
  return new Promise(async (resolve, reject) => {
    const transactions = await Transaction.find({ userId }).sort({ date: -1 });

    if (!transactions.length) {
      return reject("No transactions found.");
    }

    const doc = new PDFDocument();
    const filePath = path.join("statements", `statement_${userId}.pdf`);
    const writeStream = fs.createWriteStream(filePath);
    
    doc.pipe(writeStream);

    doc.fontSize(20).text("Bank Statement", { align: "center" });
    doc.moveDown();
    
    transactions.forEach((tx) => {
      doc.fontSize(14).text(`${new Date(tx.date).toLocaleString()} - ${tx.type.toUpperCase()}`);
      doc.text(`Amount: ${tx.amount} ${tx.currency}`);
      doc.text(`Details: ${tx.details}`);
      doc.moveDown();
    });

    doc.end();
    
    writeStream.on("finish", () => resolve(filePath));
    writeStream.on("error", reject);
  });
};

// Generate & Send Statement
export const sendBankStatement = async (userId, email) => {
  try {
    const pdfPath = await generateBankStatement(userId);
    await sendBankStatementEmail(email, pdfPath);
  } catch (error) {
    console.error("Error generating bank statement:", error);
  }
};
