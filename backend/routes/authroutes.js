/* ==========================================================================
   AUTH ROUTES
   Handles user registration for now. Login will be added in the next step.
   Mounted at "/api/auth" in server.js, so this file's "/register" becomes
   the full URL: POST /api/auth/register
   ========================================================================== */

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/* --------------------------------------------------------------------------
   POST /api/auth/register
   Creates a new user account. Password gets hashed automatically by the
   pre-save hook we wrote in models/User.js — this route doesn't need to
   touch bcrypt directly at all.
-------------------------------------------------------------------------- */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic presence check before even touching the database
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are all required" });
    }

    // Prevent duplicate accounts on the same email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    // Password gets hashed automatically here, inside User.create(),
    // by the pre-save hook — we're passing the PLAIN password in, but
    // what actually gets stored in MongoDB is the hashed version.
    const newUser = await User.create({ name, email, password });

    // IMPORTANT: never send the password (even hashed) back in the response.
    // We build a clean response object manually instead of sending newUser directly.
    res.status(201).json({
      message: "Account created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Validation failed", error: error.message });
    }
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
});

/* --------------------------------------------------------------------------
   POST /api/auth/login
   Checks the user's email + password, and if correct, issues a JWT
   token — a signed "pass" the frontend will attach to future requests
   (like placing an order) to prove "this user is logged in."
-------------------------------------------------------------------------- */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Step 1: find the user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Deliberately vague — we don't say "email not found" specifically,
      // so an attacker can't use this to figure out which emails are
      // registered on our site. Same message for both failure cases.
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Step 2: compare the submitted password against the stored hash
    // (this uses the .comparePassword() method we defined in models/User.js)
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Step 3: credentials are correct — generate a JWT token.
    // jwt.sign(payload, secretKey, options)
    //  - payload: data we embed inside the token (just the user's id here —
    //    never put the password in here, the token isn't encrypted, just signed)
    //  - secretKey: our JWT_SECRET from .env — this is what lets the server
    //    later verify the token wasn't tampered with
    //  - expiresIn: how long the token stays valid before the user must log in again
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Step 4: send the token + basic user info back to the frontend
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

module.exports = router;