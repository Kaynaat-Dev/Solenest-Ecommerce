/* ==========================================================================
   ORDER ROUTES
   Handles order creation and retrieval. Every route here uses the
   `protect` middleware — meaning a valid JWT token is REQUIRED to access
   any of these endpoints. Mounted at "/api/orders" in server.js.
   ========================================================================== */

const express = require("express");
const router = express.Router();
const Order = require("../models/order");
const protect = require("../middleware/authmiddleware");

/* --------------------------------------------------------------------------
   POST /api/orders   (protected)
   Creates a new order for the currently logged-in user.
   Expected body: { products: [...], totalAmount, shippingInfo }
-------------------------------------------------------------------------- */
router.post("/", protect, async (req, res) => {
  try {
    const { products, totalAmount, shippingInfo } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "Order must include at least one product" });
    }
    if (!totalAmount || !shippingInfo) {
      return res.status(400).json({ message: "totalAmount and shippingInfo are required" });
    }

    // req.user.id comes from the authMiddleware — it decoded this from
    // the JWT token, so we KNOW this is the real logged-in user's id,
    // not something the frontend could fake by just sending any id.
    const newOrder = await Order.create({
      user: req.user.id,
      products,
      totalAmount,
      shippingInfo,
    });

    res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Validation failed", error: error.message });
    }
    res.status(500).json({ message: "Failed to create order", error: error.message });
  }
});

/* --------------------------------------------------------------------------
   GET /api/orders   (protected)
   Returns all orders belonging to the currently logged-in user.
   NOTE: this is deliberately filtered by req.user.id — a user can only
   ever see their OWN orders, never anyone else's.
-------------------------------------------------------------------------- */
router.get("/", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
});

/* --------------------------------------------------------------------------
   GET /api/orders/:id   (protected)
   Returns one specific order — but only if it belongs to the logged-in
   user (prevents User A from viewing User B's order just by guessing an ID).
-------------------------------------------------------------------------- */
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid order ID format" });
    }
    res.status(500).json({ message: "Failed to fetch order", error: error.message });
  }
});

/* --------------------------------------------------------------------------
   PUT /api/orders/:id/status   (protected — admin-style action)
   Updates an order's status (e.g. "Shipped", "Delivered"). In a real app
   this would be restricted to admin users only — we're keeping it simple
   for now, but it's worth knowing this is a gap to revisit later.
-------------------------------------------------------------------------- */
router.put("/:id/status", protect, async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order status updated", order: updatedOrder });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid order ID format" });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Validation failed", error: error.message });
    }
    res.status(500).json({ message: "Failed to update order status", error: error.message });
  }
});

module.exports = router;