/* ==========================================================================
   PRODUCT MODEL
   A Mongoose "Schema" defines the shape of a document in MongoDB — what
   fields it has, their types, and validation rules. The "Model" (created
   from the schema at the bottom) is what we actually use in our routes
   to create/read/update/delete products in the database.
   ========================================================================== */

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true, // removes accidental leading/trailing spaces
    },
    brand: {
      type: String,
      default: "SoleNest",
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      // Restricts category to only these values — prevents typos like "Sneaker" vs "sneakers"
      enum: ["sneakers", "running", "casual", "sports", "women", "men"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    image: {
      type: String,
      required: [true, "Image URL is required"],
    },
    sizes: {
      type: [Number], // an array of numbers, e.g. [39, 40, 41, 42]
      default: [],
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields to every product
    timestamps: true,
  }
);

// Turns the schema into a usable Model. "Product" here also tells MongoDB
// to use/create a collection called "products" (Mongoose lowercases +
// pluralizes the model name automatically).
module.exports = mongoose.model("Product", productSchema);