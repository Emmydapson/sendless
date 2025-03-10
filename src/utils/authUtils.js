import axios from 'axios';

export const sendOTPSMS = async (phone, otp) => {
  try {
    const response = await axios.post(process.env.TERMII_BASE_URL, {
      api_key: process.env.TERMII_API_KEY,
      to: phone,
      from: process.env.TERMII_SENDER_ID,
      sms: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
      type: 'plain',
      channel: 'generic'
    });

    if (response.data.message !== 'Successfully Sent') {
      throw new Error('Failed to send OTP');
    }
  } catch (error) {
    console.error('Error sending OTP via SMS:', error.message);
    throw error;
  }
};
