const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");
const Job = require("../models/Job");
const Application = require("../models/Application");

router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: "student"
        });

        await user.save();

        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        res.status(500).json({ message: "Registration failed" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({ 
            token, 
            role: user.role,
            name: user.name
        });

    } catch (error) {
        res.status(500).json({ message: "Login failed" });
    }
});
router.get("/profile", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch profile" });
    }
});
router.put("/profile", verifyToken, async (req, res) => {
    try {
        const { phone, department, registerNumber, name } = req.body;
        const updateFields = {};
        if (phone !== undefined) updateFields.phone = phone;
        if (department !== undefined) updateFields.department = department;
        if (registerNumber !== undefined) updateFields.registerNumber = registerNumber;
        if (name !== undefined) updateFields.name = name;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateFields,
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Failed to update profile" });
    }
});
router.get("/students", requireAdmin, async (req, res) => {
    try {
        const students = await User.find({ role: "student" }).select("-password").sort({ createdAt: -1 });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch students" });
    }
});
router.get("/stats", requireAdmin, async (req, res) => {
    try {
        const [totalStudents, totalApplications, activeJobs, accepted, rejected, pending] = await Promise.all([
            User.countDocuments({ role: "student" }),
            Application.countDocuments(),
            Job.countDocuments({ status: "active" }),
            Application.countDocuments({ status: "accepted" }),
            Application.countDocuments({ status: "rejected" }),
            Application.countDocuments({ status: "pending" })
        ]);

        const placementRate = totalApplications > 0
            ? Math.round((accepted / totalApplications) * 100)
            : 0;

        res.json({
            totalStudents,
            totalApplications,
            activeJobs,
            acceptedApplications: accepted,
            rejectedApplications: rejected,
            pendingApplications: pending,
            placementRate
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch stats" });
    }
});

module.exports = router;

