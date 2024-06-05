import nodemailer from 'nodemailer';
import { formatMoney, formatDate } from './index';

interface Product {
  name: string;
  newPrice: number;
  quantity: number;
}

interface Message {
  subject: string;
  fullName: string;
  email: string;
  products: Product[];
  totalAmount: number;
  quantity: number;
  orderDate: Date;
  address: string;
}

const sendMail = async (message: Message) => {
  const transporter = nodemailer.createTransport({
    host: process.env.HOST,
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.AUTH_EMAIL as string,
      pass: process.env.AUTH_PASSWORD as string,
    },
  });

  const { subject, fullName, email, products, totalAmount,
    quantity,
    orderDate,
    address } = message;

  const mailOptions = {
    to: email,
    subject: subject,
    html: `
    <!DOCTYPE html>
    <html lang="en">
    
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Order Details</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f9;
          margin: 0;
          padding: 0;
        }
    
        .container {
          max-width: 700px;
          margin: 50px auto;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          padding: 20px;
        }
    
        .container h2 {
          color: #ffcc00;
          text-align: center;
        }
    
        .products {
          margin-top: 20px;
        }
    
        .products table {
          width: 100%;
          border-collapse: collapse;
        }
    
        .products th,
        .products td {
          border: 1px solid #ddd;
          padding: 8px;
        }
    
        .products th {
          background-color: #f2f2f2;
          text-align: left;
        }
    
        .products th,
        .products td {
          text-align: left;
        }
    
        .userinformation {
          margin-top: 20px;
        }
    
        .userinformation table {
          width: 100%;
          border-collapse: collapse;
        }
    
        .userinformation th,
        .userinformation td {
          border: hidden;
          padding: 8px;
        }
    
        .userinformation th {
          background-color: #f2f2f2;
          text-align: left;
        }
    
        .userinformation th,
        .userinformation td {
          text-align: left;
          width: 32%;
        }
    
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #888;
          font-size: 0.9em;
        }
    
        .shoppingImage {
          width: 100% !important;
        }
      </style>
    </head>
    
    <body>
      <div class="container">
        <img src="https://res.cloudinary.com/dqcb26re7/image/upload/v1716629543/rkrnz9xig9uzh96glpq9.png"
          alt="shoping image" class="shoppingImage" />
        <h2>Order Success</h2>
        <div class="userinformation">
          <h3>User information</h3>
          <table>
            <thead>
              <tr>
                <th>Full Name:</th>
                <th>Email:</th>
                <th>Address:</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${fullName}</td>
                <td>${email}</td>
                <td>${address}</td>
              </tr>
            </tbody>
          </table>
          <table>
            <thead>
              <tr>
                <th>Order Date:</th>
                <th>Quantity:</th>
                <th>Total Amount:</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${formatDate(orderDate)}</td>
                <td>${quantity}</td>
                <td>${formatMoney(totalAmount)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="products">
          <h3>Products</h3>
          <table>
            <tr>
              <th>Product Name</th>
              <th>Product Price</th>
              <th>Quantity</th>
              <th>Total</th>
            </tr>
            ${products.map((product: Product) => `
            <tr>
              <td>${product.name}</td>
              <td>${formatMoney(product.newPrice)}</td>
              <td>${product.quantity}</td>
              <td>${product.quantity * product.newPrice}</td>
            </tr>
            `).join('')}
            <tr>
              <td colspan="3">Total</td>
              <td>${totalAmount}</td>
            </tr>
          </table>
        </div>
        <div class="footer">
          &copy; 2024 Knights Andela shop. All rights reserved.
        </div>
      </div>
    </body>
    </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.log('Error occurred while sending email', error);
  }
};

export default sendMail;