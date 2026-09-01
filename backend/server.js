/* ==========================================================================
   SOLENEST BACKEND — server.js
   This is the entry point of our backend. Running `npm run dev` starts
   this file. It sets up Express, connects to MongoDB, and will later
   "plug in" all our routes (products, users, orders).
   ========================================================================== */

// 1. Load environment variables from .env into process.env
//    This MUST be at the very top, before we use process.env anywhere.
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// 2. Create the Express application
const app = express();

// 3. MIDDLEWARE
//    Middleware = functions that run on every request, before it reaches
//    our routes. Order matters — these run top to bottom.

// Allows our frontend (running on a different origin/port) to call this API
app.use(cors());

// Allows Express to understand incoming JSON request bodies
// (e.g. when the frontend sends { "name": "...", "price": ... })
app.use(express.json());

// 4. A simple test route
//    Visiting http://localhost:5000/ in the browser, or hitting it in
//    Postman, should return this JSON — confirming the server is alive.
app.get("/", (req, res) => {
  res.json({ message: "SoleNest API is running." });
});

// 4b. PRODUCT ROUTES
//     Every route defined inside productRoutes.js gets prefixed with
//     "/api/products". So router.get("/") in that file becomes
//     GET /api/products here, and router.get("/:id") becomes
//     GET /api/products/:id, and so on.
const productRoutes = require("./routes/productRoutes");
app.use("/api/products", productRoutes);

// 4c. AUTH ROUTES
//     Handles registration and (soon) login. Everything here gets
//     prefixed with "/api/auth" — so router.post("/register") in that
//     file becomes POST /api/auth/register.
const authRoutes = require("./routes/authroutes");
app.use("/api/auth", authRoutes);

// 4d. ORDER ROUTES
//     Handles creating and viewing orders. All routes inside this file
//     are protected by JWT authentication (see middleware/authMiddleware.js).
const orderRoutes = require("./routes/orderRoutes");
app.use("/api/orders", orderRoutes);

// 5. CONNECT TO MONGODB (serverless-safe version)
//    On a normal always-on server, we'd connect once and be done. But on
//    Vercel, each request might hit a "cold" function instance that
//    hasn't connected yet. This helper checks the CURRENT connection
//    state every time, and only opens a new connection if one isn't
//    already active — this pattern is the standard fix for
//    "Mongoose + serverless" timeout issues.
async function connectDB() {
  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (mongoose.connection.readyState === 1) {
    return; // already connected — nothing to do
  }
  // serverSelectionTimeoutMS is increased from Mongoose's default (10s) to
  // give more time for the connection to establish across a longer
  // network distance (our Vercel function and MongoDB Atlas cluster are
  // in different regions, so the default timeout was too tight).
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 20000,
  });
  console.log("MongoDB connected successfully.");
}

// This middleware runs before EVERY request, and waits for the database
// connection to be ready before letting the request continue to its route.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    res.status(500).json({ message: "Database connection failed" });
  }
});

// 6. START THE SERVER — but only when running locally.
//    `require.main === module` is true ONLY when this file is run
//    directly (e.g. `node server.js` or `npm run dev`). When a platform
//    like Vercel instead *imports* this file to handle requests, that
//    condition is false — so app.listen() is skipped, and Vercel takes
//    care of starting/stopping the app per-request on its own.
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`SoleNest server running on http://localhost:${PORT}`);
    });
  });
}

// 7. EXPORT THE APP
//    Needed so Vercel (or any other platform/testing tool) can import
//    this Express app and run it themselves, instead of us calling
//    app.listen() ourselves.
module.exports = app;