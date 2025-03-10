import express from 'express';
import axios from 'axios';

const router = express.Router();

// Webhook for Termii SMS delivery status
router.post('/delivery-webhook', async (req, res) => {
  try {
    // Get the delivery status data from the request body
    const { status, message, to, sms_id, from } = req.body;

    console.log('Delivery Webhook received:', req.body);

    // Check the status of the SMS
    if (status === 'delivered') {
      console.log(`SMS to ${to} was delivered successfully.`);
      // You can handle the success logic here, such as logging the delivery or updating the user's status
    } else if (status === 'failed') {
      console.log(`SMS to ${to} failed. Message: ${message}`);
      // Handle failed SMS, e.g., log the failure or alert the user
    } else {
      console.log(`Unknown status for SMS to ${to}. Status: ${status}`);
      // Handle other statuses as needed
    }

    // Respond to Termii with a success status
    res.status(200).json({ message: 'Received delivery status' });
  } catch (err) {
    console.error('Error processing delivery webhook:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
