/* ==========================================================================
   USER MODEL
   Defines the shape of a User document, and automatically hashes the
   password with bcrypt right before it gets saved to MongoDB — so the
   plain-text password NEVER actually touches the database.
   ========================================================================== */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // MongoDB will reject a second user with the same email
      lowercase: true, // "User@Gmail.com" and "user@gmail.com" are treated as the same
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
  },
  {
    timestamps: true,
  }
);

/* --------------------------------------------------------------------------
   MONGOOSE MIDDLEWARE ("pre-save hook")
   This function automatically runs right BEFORE a User document is saved
   to the database (i.e. every time someone calls user.save() or
   User.create()). We use it here to hash the password so we never have
   to remember to do it manually in every route.
-------------------------------------------------------------------------- */
userSchema.pre("save", async function (next) {
  // Only hash the password if it's new or being changed.
  // Without this check, updating a user's name would re-hash an
  // already-hashed password and break their login.
  if (!this.isModified("password")) {
    return next();
  }

  // bcrypt.hash(plainPassword, saltRounds)
  // "saltRounds" controls how much computational work goes into the hash —
  // higher = more secure but slower. 10 is a solid, standard default.
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next(); // continue with the actual save
});

/* --------------------------------------------------------------------------
   INSTANCE METHOD
   Adds a reusable .comparePassword() function to every user document, so
   in the Login route we can simply write: user.comparePassword(input)
   instead of manually calling bcrypt every time.
-------------------------------------------------------------------------- */
userSchema.methods.comparePassword = async function (enteredPassword) {
  // bcrypt.compare hashes `enteredPassword` internally and checks if it
  // matches the already-hashed `this.password` — we never "un-hash" it.
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);