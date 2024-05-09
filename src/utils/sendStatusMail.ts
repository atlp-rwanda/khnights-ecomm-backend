import { config } from 'dotenv';
import nodemailer from 'nodemailer';
import Mailgen from 'mailgen';

config();

interface IData {
  email: string;
  name: string;
}

const EMAIL = process.env.AUTH_EMAIL;
const PASSWORD = process.env.AUTH_PASSWORD;

export const sendEmail = async (type: string, data: IData) => {
  if(EMAIL && PASSWORD){
    try {
      const mailGenerator = new Mailgen({
        theme: 'default',
        product: {
          name: 'Knights',
          link: 'https://mailgen.js/',
        },
      });
  
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: EMAIL,
          pass: PASSWORD,
        },
      });
  
      let email;
      let subject;
      switch (type) {
        case 'User_Account_diactivated':
          email = {
            body: {
              name: data.name,
              intro: 'Your account has been blocked due to violation of our terms and conditions.',
              action: {
                instructions: 'If you believe this is an error, please contact support at knights.andela@gmail.com.',
                button: {
                  color: '#22BC66',
                  text: 'Contact Support',
                  link: 'mailto:knights.andela@gmail.com',
                },
              },
              outro: 'Thank you for your understanding.',
            },
          };
          subject = 'Account Suspended';
          break;
        case 'User_Account_activated':
          email = {
            body: {
              name: data.name,
              intro: 'Your account has been unblocked.',
              action: {
                instructions: 'You can now access your account again.',
                button: {
                  color: '#22BC66',
                  text: 'Access Account',
                  link: 'https://knights-e-commerce.com/login',
                },
              },
              outro: 'If you did not request this action, please contact support immediately.',
            },
          };
          subject = 'Account Unblocked';
          break;
        default:
          throw new Error('Invalid email type');
      }
  
      const html = mailGenerator.generate(email);
  
      const mailOptions = {
        from: EMAIL,
        to: data.email,
        subject: subject,
        html: html,
      };
  
      const info = await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
  else {
    console.error('Email or password for mail server not configured');
    return
}
};