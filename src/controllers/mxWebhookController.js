import User from '../models/User.js';

/**
 * Handle MXFace Webhooks
 */
export const handleMxfaceWebhook = async (req, res) => {
  try {
    const { userId, event, data } = req.body;

    if (!userId || !event) {
      return res.status(400).json({ message: 'Invalid webhook payload' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (event === 'kyc_verified') {
      user.kyc.status = 'Verified';
    } else if (event === 'kyc_failed') {
      user.kyc.status = 'Rejected';
    } else {
      return res.status(400).json({ message: 'Unknown event type' });
    }

    await user.save();
    console.log(`MXFace Webhook: ${event} processed for user ${userId}`);

    res.status(200).json({ message: `Webhook processed: ${event}` });
  } catch (error) {
    console.error('MXFace Webhook Error:', error);
    res.status(500).json({ message: 'Server error processing webhook' });
  }
};
