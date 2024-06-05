import { Request, Response } from 'express';
import { responseError, responseServerError, responseSuccess } from '../../utils/response.utils';
import nodemailer from 'nodemailer';
import { getRepository } from 'typeorm';
import { User } from '../../entities/User';

export const sendPasswordResetLinkService = async (req: Request, res: Response) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.AUTH_EMAIL,
                pass: process.env.AUTH_PASSWORD,
            },
        });
        const email = req.query.email as string;

        if (!email) {
            return responseError(res, 400, 'Missing required field');
        }
        const userRepository = getRepository(User);
        const existingUser = await userRepository.findOneBy({ email });
        if (!existingUser) {
            return responseError(res, 404, 'User not found', existingUser);
        }
        const mailOptions: nodemailer.SendMailOptions = {
            to: email,
            subject: `Password reset link `,
            html: `
            <!doctype html>
            <html lang="en-US">
            
            <head>
                <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
                <title>Reset Password Email Template</title>
                <meta name="description" content="Reset Password Email Template.">
                <style type="text/css">
                    a:hover {text-decoration: underline !important;}
                </style>
            </head>
            
            <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
                <!--100% body table-->
                <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
                    style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
                    <tr>
                        <td>
                            <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                                align="center" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="height:80px;">&nbsp;</td>
                                </tr>
                            
                                <tr>
                                    <td style="height:20px;">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td>
                                        <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                            style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                            <tr>
                                                <td style="height:40px;">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td style="padding:0 35px;">
                                                    <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;text-decoration:none; ">You have
                                                        requested to reset your password</h1>
                                                    <span
                                                        style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                                    <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                                        We cannot simply send you your old password. A unique link to reset your
                                                        password has been generated for you. To reset your password, click the
                                                        following link and follow the instructions.
                                                    </p>
                                                    <a href="${process.env.FRONTEND_URL}/${process.env.PASSWORD_ROUTE}?userid=${existingUser.id}&email=${existingUser.email}" target="_blank"
                                                        style="background:#20e277;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Reset
                                                        Password</a>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="height:40px;">&nbsp;</td>
                                            </tr>
                                        </table>
                                    </td>
                                <tr>
                                    <td style="height:20px;">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td style="text-align:center;">
                                        <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy; <strong>Knights Ecommerce</strong></p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="height:80px;">&nbsp;</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                <!--/100% body table-->
            </body>
            
            </html>`,
        };

        try {
            const sendMail = await transporter.sendMail(mailOptions);
            return responseSuccess(res, 200, 'Code sent on your email', sendMail);
        } catch (error) {
            return responseError(res, 500, 'Error occurred while sending email');
        }
    } catch (error) {
        return responseServerError(res, `Internal server error: `);
    }
};
