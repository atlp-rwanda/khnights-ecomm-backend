import nodemailer from 'nodemailer';

const sendMail = async (
  userAuth: string,
  passAuth: string,
  message: { from: string; to: string; subject: string; text: string; firstName: string; lastName: string },
  link: string = ''
) => {
  const transporter = nodemailer.createTransport({
    host: process.env.HOST,
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: userAuth,
      pass: passAuth,
    },
  });

  const { from, to, subject, text, firstName, lastName } = message;

  const mailOptions = {
    from: from,
    to: to,
    subject: subject,
    text: text,
    firstName: firstName,
    lastName: lastName,
    html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
           <style>
                /* Reset styles */
                body, html {
                    margin: 0;
                    padding: 0;
                    font-family: Arial, sans-serif;
                }
                /* Container styles */
                .container {
                    max-width: 600px;
                    // margin: 0 auto;
                    padding: 20px;
                    background-color: #f9f9f9;
                    border-radius: 10px;
                }
              
                /* Content styles */
                .content {
                    background-color: #fff;
                    padding: 20px;
                    border-radius: 5px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                /* Footer styles */
                .footer {
                    margin-top: 20px;
                    text-align: center;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h3 class="header">
                    Hello ${firstName} ${lastName},  
                </h3>
                <div class="content">
                    <p>${text}</p>
                    <p> </p>
                    <p>${link && `<a href=${link}>click here to verifie your account</a>`}</p>
                    <p>This message is from: Knights Andela </p>
                    </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Knights Andela. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log('Error occurred while sending email', error);
  }
};

export default sendMail;
