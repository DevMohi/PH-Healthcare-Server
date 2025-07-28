import nodemailer from "nodemailer";
import config from "../../../config";

export const emaiLSender = async (email: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: config.emailSender.email,
      pass: config.emailSender.app_pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const info = await transporter.sendMail({
    from: '"PH HEALTH Care" <webdevmohi@gmail.com>',
    to: email,
    subject: "Reset Password Link",
    // text: "Hello world?", // plain‑text body
    html,
  });

  console.log("Message sent", info.messageId);
};
