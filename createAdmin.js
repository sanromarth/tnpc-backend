const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/user");

mongoose.connect(process.env.MONGO_URI);

async function createAdmin() {
    const existingAdmin = await User.findOne({ email: "admin@gcsr.com" });
    if (existingAdmin) {
        console.log("Admin already exists");
        process.exit();
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await User.create({
        name: "Admin",
        email: "admin@gcsr.com",
        password: hashedPassword,
        role: "admin"
    });

    console.log("Admin created successfully");
    process.exit();
}

createAdmin();