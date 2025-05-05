import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, text, html }) => {
  // Use your Gmail and App Password here
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // your gmail address
      pass: process.env.EMAIL_PASS, // your app password
    },
  });

  await transporter.sendMail({
    from: `"MediCure" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
};
