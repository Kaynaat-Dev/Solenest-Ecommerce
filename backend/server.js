/* ==========================================================================
   SOLENEST BACKEND — server.js
   This is the entry point of our backend. Running `npm run dev` starts
   this file. It sets up Express, connects to MongoDB, and plugs in all
   our routes (products, auth, orders).
   ========================================================================== */

// 1. Load environment variables from .env into process.env
//    This MUST be at the very top, before we use process.env anywhere.
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// 2. Create the Express application
const app = express();

// 3. BASIC MIDDLEWARE
app.use(cors());
app.use(express.json());

// 4. MONGODB CONNECTION (serverless-safe)
//    We cache the CONNECTION PROMISE itself (not just the readyState) in
//    a variable that survives across requests on a "warm" serverless
//    instance. This ensures that even if multiple requests arrive at
//    nearly the same time, they all await the SAME connection attempt
//    instead of racing to create separate ones — which was the actual
//    bug causing our earlier timeouts.
let connectionPromise = null;

function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(); // already connected
  }
  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 })
      .then(() => {
        console.log("MongoDB connected successfully.");
      })
      .catch((err) => {
        connectionPromise = null; // allow retrying on the next request if this attempt failed
        throw err;
      });
  }
  return connectionPromise;
}

// 5. WAIT-FOR-DATABASE MIDDLEWARE
//    CRITICAL: this must be registered BEFORE any routes below, since
//    Express runs middleware/routes in the exact order they're added.
//    If this ran after the routes, the routes would already be handling
//    requests before the database connection was ready — which is
//    exactly the bug we just fixed.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    res.status(500).json({ message: "Database connection failed", error: error.message });
  }
});

// 6. TEST ROUTE
app.get("/", (req, res) => {
  res.json({ message: "SoleNest API is running." });
});

// 7. PRODUCT ROUTES — everything here is prefixed with "/api/products"
const productRoutes = require("./routes/productRoutes");
app.use("/api/products", productRoutes);

// 8. AUTH ROUTES — everything here is prefixed with "/api/auth"
const authRoutes = require("./routes/authroutes");
app.use("/api/auth", authRoutes);

// 9. ORDER ROUTES — everything here is prefixed with "/api/orders"
const orderRoutes = require("./routes/orderRoutes");
app.use("/api/orders", orderRoutes);

// 10. START THE SERVER — only when running locally (not on Vercel).
//     `require.main === module` is true ONLY when this file is run
//     directly (e.g. `node server.js` / `npm run dev`).
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`SoleNest server running on http://localhost:${PORT}`);
    });
  });
}

// 11. EXPORT THE APP — so Vercel can import and run it themselves.
module.exports = app;