import nodemailer from "nodemailer";
import fs from "fs";
import PDFDocument from "pdfkit";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

// Generate PDF Receipt
const generateReceiptPDF = async (receipt) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const filePath = path.join("receipts", `receipt_${receipt._id}.pdf`);
    const writeStream = fs.createWriteStream(filePath);
    
    doc.pipe(writeStream);

    doc.fontSize(20).text("Transaction Receipt", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Date: ${new Date(receipt.date).toLocaleString()}`);
    doc.text(`Transaction ID: ${receipt.transactionId}`);
    doc.text(`Amount: ${receipt.amount} USD`);
    doc.text(`Type: ${receipt.type}`);
    doc.text(`Details: ${receipt.details}`);

    doc.end();
    
    writeStream.on("finish", () => resolve(filePath));
    writeStream.on("error", reject);
  });
};

// Send Email Receipt
export const sendEmailReceipt = async (userEmail, receipt) => {
  try {
    const pdfPath = await generateReceiptPDF(receipt);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: "Your Transaction Receipt",
      text: "Attached is your transaction receipt.",
      attachments: [{ filename: "receipt.pdf", path: pdfPath }],
    };

    await transporter.sendMail(mailOptions);
    console.log("Receipt email sent!");
  } catch (error) {
    console.error("Error sending email receipt:", error.message);
  }
};

// Send Bank Statement via Email
export const sendBankStatementEmail = async (userEmail, pdfPath) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: "Your Monthly Bank Statement",
      text: "Attached is your bank statement.",
      attachments: [{ filename: "bank_statement.pdf", path: pdfPath }],
    };

    await transporter.sendMail(mailOptions);
    console.log("Bank statement email sent!");
  } catch (error) {
    console.error("Error sending bank statement email:", error.message);
  }
};
