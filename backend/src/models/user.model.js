const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
{
  name: { type: String, required: true },

  email: { type: String, required: true, unique: true },

  password: { type: String },

  googleId: { type: String }

}, { timestamps: true });


userSchema.pre("save", async function () {
  if (!this.password || !this.isModified("password")) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);