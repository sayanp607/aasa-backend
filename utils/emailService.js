const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendNotification = async (type, data) => {
  let subject = '';
  let html = '';

  switch (type) {
    case 'CLOTH_ORDER':
    case 'GIFT_ORDER':
      subject = '🎉 New Order Received - Aasa Boutique';
      html = `
        <h3>New Order Placed!</h3>
        <p><strong>Order ID:</strong> ${data._id}</p>
        <p><strong>Customer:</strong> ${data.userId?.name || 'User'}</p>
        <p><strong>Item:</strong> ${data.cloth?.name || data.gift?.name}</p>
        <p><strong>Quantity:</strong> ${data.quantity}</p>
        <p><strong>Total Amount:</strong> ₹${data.amount}</p>
      `;
      break;

    case 'RIDE_BOOKED':
      subject = '🚕 Ride Booking Confirmed - Aasa Mobility';
      html = `
        <h3>Your Ride is Scheduled!</h3>
        <p><strong>Ride ID:</strong> ${data._id}</p>
        <p><strong>Pickup:</strong> ${data.pickupAddress}</p>
        <p><strong>Drop:</strong> ${data.dropAddress}</p>
        <p><strong>Vehicle:</strong> ${data.vehicleType}</p>
        <p><strong>Estimated Fare:</strong> ₹${data.totalPrice}</p>
      `;
      break;

    case 'RIDE_ACCEPTED':
      subject = '✅ Your Ride has been Accepted!';
      html = `
        <h3>Driver is on the way!</h3>
        <p><strong>OTP for your ride:</strong> ${data.otp}</p>
        <p><strong>Driver Phone:</strong> ${data.driverPhone}</p>
      `;
      break;

    case 'DELIVERY_SCHEDULED':
      subject = '📦 Parcel Scheduled for Delivery - Aasa Logistics';
      html = `
        <h3>Your Parcel is on the move!</h3>
        <p><strong>Order ID:</strong> ${data._id}</p>
        <p><strong>Pickup:</strong> ${data.pickup?.address}</p>
        <p><strong>Delivery:</strong> ${data.delivery?.[0]?.address}</p>
        <p><strong>Item:</strong> ${data.itemType}</p>
      `;
      break;
    
    case 'DELIVERY_STATUS_UPDATED':
      subject = `🚚 Delivery Update: ${data.status}`;
      html = `
        <h3>Update on your Parcel</h3>
        <p><strong>Order ID:</strong> ${data._id}</p>
        <p><strong>New Status:</strong> ${data.status}</p>
      `;
      break;

    case 'RIDE_CANCELLED':
      subject = '⚠️ Ride Cancellation Confirmed';
      html = `
        <h3>Your Ride has been Cancelled</h3>
        <p><strong>Ride ID:</strong> ${data._id}</p>
        <p><strong>Route:</strong> From ${data.pickupAddress} to ${data.dropAddress}</p>
      `;
      break;

    case 'RIDE_REJECTED':
      subject = '🚫 Ride Request Update';
      html = `
        <h3>Ride Request Not Accepted</h3>
        <p>Unfortunately, your ride request (ID: ${data._id}) could not be accepted by nearby drivers at this time.</p>
        <p>Please try re-booking in a few minutes.</p>
      `;
      break;

    case 'RIDE_COMPLETED':
      subject = '🏁 You Have Arrived! - Aasa Mobility';
      html = `
        <h3>Ride Completed Successfully!</h3>
        <p>Thank you for riding with Aasa.</p>
        <p><strong>Total Fare:</strong> ₹${data.totalPrice}</p>
        <p>Please rate your experience in the app!</p>
      `;
      break;

    case 'RIDE_FEEDBACK_SUBMITTED':
      subject = '⭐ Thank you for your feedback! - Aasa Mobility';
      html = `
        <h3>Feedback Received</h3>
        <p>We've received your ${data.rating}-star rating for Ride ID ${data._id}.</p>
        <p>Your feedback helps us improve our service!</p>
      `;
      break;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // Sending to admin for now as per original code
    subject: subject,
    html: html
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendNotification };
