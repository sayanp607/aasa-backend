const nodemailer = require('nodemailer');

exports.handleContact = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, msg: "All fields are required" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'sayanp607@gmail.com',
        pass: 'rxgf hxea gzcn iudm'   // Use App Password if 2FA is enabled
      }
    });

    const mailOptions = {
      from: email,
      to: 'sayanp607@gmail.com',  // Where you receive the message
      subject: 'New Contact Form Message',
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, msg: "Message sent successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: "Failed to send message" });
  }
};
