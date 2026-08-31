/* ==========================================================================
   PRODUCT ROUTES
   Defines the 5 Product API endpoints. Each route is mounted under
   "/api/products" in server.js (so the full URL for GET all products
   becomes: http://localhost:5000/api/products).
   ========================================================================== */

const express = require("express");
const router = express.Router();
const Product = require("../models/product");

/* --------------------------------------------------------------------------
   GET /api/products
   Get all products. Supports an optional ?category= query for filtering,
   e.g. /api/products?category=running
-------------------------------------------------------------------------- */
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const products = await Product.find(filter).sort({ createdAt: -1 }); // newest first
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products", error: error.message });
  }
});

/* --------------------------------------------------------------------------
   GET /api/products/:id
   Get a single product by its MongoDB _id.
-------------------------------------------------------------------------- */
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    // CastError happens when the :id in the URL isn't a validly-formatted MongoDB ID
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid product ID format" });
    }
    res.status(500).json({ message: "Failed to fetch product", error: error.message });
  }
});

/* --------------------------------------------------------------------------
   POST /api/products
   Add a new product. Body must be JSON matching the Product schema.
-------------------------------------------------------------------------- */
router.post("/", async (req, res) => {
  try {
    const newProduct = await Product.create(req.body);
    res.status(201).json(newProduct); // 201 = "Created"
  } catch (error) {
    // ValidationError happens when required fields are missing or invalid
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Validation failed", error: error.message });
    }
    res.status(500).json({ message: "Failed to create product", error: error.message });
  }
});

/* --------------------------------------------------------------------------
   PUT /api/products/:id
   Update an existing product. Body contains only the fields to change.
-------------------------------------------------------------------------- */
router.put("/:id", async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // return the updated doc; still enforce schema rules
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid product ID format" });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Validation failed", error: error.message });
    }
    res.status(500).json({ message: "Failed to update product", error: error.message });
  }
});

/* --------------------------------------------------------------------------
   DELETE /api/products/:id
   Delete a product.
-------------------------------------------------------------------------- */
router.delete("/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully", product: deletedProduct });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid product ID format" });
    }
    res.status(500).json({ message: "Failed to delete product", error: error.message });
  }
});

module.exports = router;