const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: 'rzp_test_5Dp4Elo76csOCm',
  key_secret: '69imKVR9btKbqaJrPD2UByri',
});

exports.createPaymentOrder = async (req, res) => {
  const { amount } = req.body;

  const options = {
    amount: amount * 100, 
    currency: "INR",
    payment_capture: 1,
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create Razorpay order' });
  }
};
