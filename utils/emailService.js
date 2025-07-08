const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sayanp607@gmail.com',
    pass: 'rxgf hxea gzcn iudm'  
  }
});

const sendOrderNotification = async (order) => {
  const mailOptions = {
    from: 'sayanp607@gmail.com',
    to: 'sayanp607@gmail.com',
    subject: 'Hello Admin, New Order Received 🎉 !',
    html: `
      <h3>New Order Placed!</h3>
      <p><strong>User Email:</strong> ${order.userId?.email}</p>
      <p><strong>User Name:</strong> ${order.userId?.name}</p>
      ${order.cloth ? `
        <p><strong>Cloth:</strong> ${order.cloth?.name}</p>
        <p><strong>Size:</strong> ${order.size}</p>
      ` : `
        <p><strong>Gift:</strong> ${order.gift?.name}</p>
      `}
      <p><strong>Quantity:</strong> ${order.quantity}</p>
      <p><strong>Amount:</strong> ₹${order.amount}</p>
      <p><strong>Payment ID:</strong> ${order.paymentId}</p>
    `
  };

  await transporter.sendMail(mailOptions);
};


module.exports = { sendOrderNotification };
