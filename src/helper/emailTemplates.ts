export const otpTemplate = (name: string, otpCode: string): string => {
  return `
    <div style="background-color: #f2f2f2; padding: 5%;">
        <h1 style="color: #004d99; text-align: center;">Login OTP Code</h1>
        <p style="color: #000; font-size: 16px;">Hi ${name},</p>
        <p style="color: #000; font-size: 16px;">
        It looks like you are trying to log in to knight e-commerce using your username and password. 
        As an additional security measure you are requested to enter the OTP code (one-time password) provided in this email.
        </p>
        <p style="color: #000; font-size: 16px;">If you did not intend to log in to your acount, please ignore this email.</p>
        <p style="color: #000; font-size: 16px;">The OTP code is: ${otpCode}</p>
        
        <p style="color: #000; font-size: 16px;">Cheers,</p>
        <p style="color: #000; font-size: 16px;">Knights e-commerce Team</p>
    </div>`;
};
