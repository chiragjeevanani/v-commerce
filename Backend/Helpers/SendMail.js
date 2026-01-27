import nodemailer from "nodemailer";

export const sendOTPEmail = async (to, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",   // ya apna SMTP
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,   // your email
        pass: process.env.EMAIL_PASS,   // app password
      },
    });

    const mailOptions = {
      from: `"ElectriciToys" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Verify Your Account - OTP",
      html: `
        <h3>Account Verification</h3>
        <p>Your OTP is:</p>
        <h2>${otp}</h2>
        <p>This OTP is valid for 10 minutes</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("OTP Email Sent Successfully");

  } catch (error) {
    console.log("Email Error:", error);
  }
};
