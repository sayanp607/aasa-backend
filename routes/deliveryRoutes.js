const express = require("express");
const { createOrder, getAllOrders, updateOrderStatus, getMyOrders,deleteOrder,updateOrder } = require("../controllers/deliveryController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.post("/create", protect, upload.single("image"), createOrder);


router.post("/create", protect, createOrder);  // Only logged-in users

router.get("/my", protect, getMyOrders);  // User's own orders

router.get("/all", protect, adminOnly, getAllOrders); // Admin sees all

router.put("/:id/status", protect, adminOnly, updateOrderStatus);

router.put("/:id", protect, updateOrder);

router.delete("/:id",protect, deleteOrder);

module.exports = router;
