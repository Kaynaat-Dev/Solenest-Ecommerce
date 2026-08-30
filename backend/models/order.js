/* ==========================================================================
   ORDER MODEL
   Defines the shape of an Order document. Notice how it "links" to other
   collections (User, Product) using MongoDB ObjectIds — this is how
   relationships work in MongoDB, similar to foreign keys in SQL.
   ========================================================================== */

const mongoose = require("mongoose");

// A small "sub-schema" for each product line inside an order.
// This does NOT become its own collection — it's embedded directly
// inside the Order document, since order items always belong to one order.
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product", // tells Mongoose this ID refers to a document in the "products" collection
      required: true,
    },
    name: { type: String, required: true }, // snapshot of the product name at order time
    price: { type: Number, required: true }, // snapshot of the price at order time
    size: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false } // no need for a separate _id on each embedded item
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // links this order to a document in the "users" collection
      required: true,
    },
    products: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "An order must contain at least one product",
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingInfo: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      phone: { type: String, required: true },
    },
    orderStatus: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
  },
  {
    timestamps: true, // adds createdAt (when the order was placed) and updatedAt
  }
);

module.exports = mongoose.model("Order", orderSchema);