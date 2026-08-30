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
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// 4d. ORDER ROUTES
//     Handles creating and viewing orders. All routes inside this file
//     are protected by JWT authentication (see middleware/authMiddleware.js).
const orderRoutes = require("./routes/orderRoutes");
app.use("/api/orders", orderRoutes);

// 5. CONNECT TO MONGODB
//    mongoose.connect() returns a Promise. We only want to start the
//    server (app.listen) AFTER the database connection succeeds — this
//    avoids the server accepting requests before it can actually reach
//    the database.
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully.");

    app.listen(PORT, () => {
      console.log(`SoleNest server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    // We don't start the server if the DB connection fails —
    // better to fail loudly now than serve broken requests later.
  });