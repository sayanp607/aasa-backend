const mongoose = require("mongoose");

const deliveryorderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Link to User
  pickup: {
    address: String,
    phone: String,
    instructions: String,
  },
  delivery: [
    {
      address: String,
      phone: String,
      instructions: String,
    }
  ],
  deliveryType: { type: String, enum: ["Now", "EndOfDay", "Scheduled"], default: "Now" },
  scheduleTime: Date,
  packageWeight: { type: String },
  itemType: { type: String },
  parcelValue: { type: Number, default: 0 },
  senderPhone: { type: String },
  notifyRecipient: { type: Boolean, default: false },
  price: { type: Number },
  image: { type: String },
  status: { type: String, enum: ["Pending", "Assigned", "PickedUp", "Delivered"], default: "Pending" },
}, { timestamps: true });

module.exports = mongoose.model("DeliveryOrder", deliveryorderSchema);
