require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/user.model");
const connectDB = require("./src/config/db");

const test = async () => {
  try {
    await connectDB();
    console.log("Connected to DB");
    
    const email = "test" + Date.now() + "@example.com";
    console.log("Creating user with email:", email);
    
    const user = await User.create({
      name: "Test User",
      email: email,
      password: "password123"
    });
    
    console.log("User created successfully:", user._id);
    process.exit(0);
  } catch (error) {
    console.error("Test failed!");
    console.error(error);
    process.exit(1);
  }
};

test();