const nodemailer = require("nodemailer");

const sendEmail = async (to, name) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"BookApp" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Welcome to BookApp!",
    html: `<h2>Hi ${name}!</h2><p>Welcome to BookApp. Happy reading!</p>`,
  });
};

module.exports = sendEmail;
