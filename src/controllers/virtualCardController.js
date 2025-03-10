import { createFincraVirtualCard, getFincraVirtualCard, updateFincraCardStatus } from "../services/fincraService.js";
import VirtualCard from "../models/VirtualCard.js";

// Create Virtual USD Card
export const createVirtualCard = async (req, res) => {
  try {
    const { userId, currency } = req.body;
    
    const existingCard = await VirtualCard.findOne({ userId });
    if (existingCard) {
      return res.status(400).json({ success: false, message: "User already has a virtual card" });
    }
    
    const cardData = await createFincraVirtualCard(userId, currency);
    const newCard = await VirtualCard.create({ userId, ...cardData });
    
    return res.status(201).json({ success: true, card: newCard });
  } catch (error) {
    console.error("Create Virtual Card Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to create virtual card" });
  }
};

// Get User's Virtual Card
export const getVirtualCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const card = await getFincraVirtualCard(cardId);
    
    if (!card) {
      return res.status(404).json({ success: false, message: "No virtual card found" });
    }
    
    return res.status(200).json({ success: true, card });
  } catch (error) {
    console.error("Get Virtual Card Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to retrieve virtual card" });
  }
};

// Freeze or Disable Virtual Card
export const updateCardStatus = async (req, res) => {
  try {
    const { cardId, status } = req.body;
    if (!["active", "frozen", "disabled"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }
    
    const updatedCard = await updateFincraCardStatus(cardId, status);
    if (!updatedCard) {
      return res.status(404).json({ success: false, message: "Card not found" });
    }
    
    return res.status(200).json({ success: true, card: updatedCard });
  } catch (error) {
    console.error("Update Card Status Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to update card status" });
  }
};
