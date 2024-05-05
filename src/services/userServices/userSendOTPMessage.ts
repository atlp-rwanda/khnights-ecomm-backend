import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

export const sendOTPSMS = async (phone: string, code: string) => {
  const data = {
    to: `+25${phone}`,
    text: `use this code to confirm your login. ${code}`,
    sender: `${process.env.PINDO_SENDER}`,
  };

  const options = {
    headers: {
      'Authorization': `Bearer ${process.env.PINDO_API_KEY}`,
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await axios.post(`${process.env.PINDO_API_URL}`, data, options);
    console.log('SMS sent:', response.data.sms_id);
  } catch (error) {
    console.error('Failed to send SMS:', error);
  }
};
