const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // or use SMTP config
      auth: {
         user: 'sayanp607@gmail.com',
    pass: 'rxgf hxea gzcn iudm' 
      },
    });

    const mailOptions = {
      from: `"Arctic Delights" <'sayanp607@gmail.com'>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendEmail;
