const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");
const Job = require("../models/Job");
const Application = require("../models/Application");
const Placement = require("../models/Placement");

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
        const user = new User({ name, email, password: hashedPassword, role: "student" });
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
        res.json({ token, role: user.role, name: user.name });
    } catch (error) {
        res.status(500).json({ message: "Login failed" });
    }
});

router.get("/profile", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch profile" });
    }
});

router.put("/profile", verifyToken, async (req, res) => {
    try {
        const { phone, department, registerNumber, name, batch, cgpa,
                tenthPercentage, twelfthPercentage, backlogs, skills, resumeUrl } = req.body;
        const updateFields = {};
        if (phone !== undefined) updateFields.phone = phone;
        if (department !== undefined) updateFields.department = department;
        if (registerNumber !== undefined) updateFields.registerNumber = registerNumber;
        if (name !== undefined) updateFields.name = name;
        if (batch !== undefined) updateFields.batch = batch;
        if (cgpa !== undefined) updateFields.cgpa = cgpa;
        if (tenthPercentage !== undefined) updateFields.tenthPercentage = tenthPercentage;
        if (twelfthPercentage !== undefined) updateFields.twelfthPercentage = twelfthPercentage;
        if (backlogs !== undefined) updateFields.backlogs = backlogs;
        if (skills !== undefined) updateFields.skills = skills;
        if (resumeUrl !== undefined) updateFields.resumeUrl = resumeUrl;

        const user = await User.findByIdAndUpdate(
            req.user.id, updateFields,
            { new: true, runValidators: true }
        ).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Failed to update profile" });
    }
});

router.get("/students", requireAdmin, async (req, res) => {
    try {
        const { department, batch, minCgpa, status, search } = req.query;
        const filter = { role: "student" };
        if (department) filter.department = department;
        if (batch) filter.batch = batch;
        if (status) filter.placementStatus = status;
        if (minCgpa) filter.cgpa = { $gte: Number(minCgpa) };
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { registerNumber: { $regex: search, $options: "i" } }
            ];
        }
        const students = await User.find(filter).select("-password").sort({ createdAt: -1 });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch students" });
    }
});

router.patch("/students/:id/status", requireAdmin, async (req, res) => {
    try {
        const { placementStatus } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { placementStatus },
            { new: true, runValidators: true }
        ).select("-password");
        if (!user) return res.status(404).json({ message: "Student not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Failed to update status" });
    }
});

router.get("/students/export", requireAdmin, async (req, res) => {
    try {
        const students = await User.find({ role: "student" }).select("-password").sort({ name: 1 });
        let csv = "Name,Email,Register Number,Department,Batch,CGPA,10th %,12th %,Backlogs,Phone,Placement Status,Skills\n";
        students.forEach(s => {
            csv += `"${s.name}","${s.email}","${s.registerNumber}","${s.department}","${s.batch}",${s.cgpa},${s.tenthPercentage},${s.twelfthPercentage},${s.backlogs},"${s.phone}","${s.placementStatus}","${(s.skills || []).join(', ')}"\n`;
        });
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=students.csv");
        res.send(csv);
    } catch (error) {
        res.status(500).json({ message: "Failed to export students" });
    }
});

router.get("/stats", requireAdmin, async (req, res) => {
    try {
        const [totalStudents, totalApplications, activeJobs, accepted, rejected, pending, shortlisted, placed, notPlaced] = await Promise.all([
            User.countDocuments({ role: "student" }),
            Application.countDocuments(),
            Job.countDocuments({ status: "active" }),
            Application.countDocuments({ status: "accepted" }),
            Application.countDocuments({ status: "rejected" }),
            Application.countDocuments({ status: "pending" }),
            Application.countDocuments({ status: "shortlisted" }),
            User.countDocuments({ role: "student", placementStatus: "placed" }),
            User.countDocuments({ role: "student", placementStatus: "not-placed" })
        ]);
        const placementRate = totalStudents > 0 ? Math.round((placed / totalStudents) * 100) : 0;
        res.json({
            totalStudents, totalApplications, activeJobs,
            acceptedApplications: accepted, rejectedApplications: rejected,
            pendingApplications: pending, shortlistedApplications: shortlisted,
            placedStudents: placed, notPlacedStudents: notPlaced, placementRate
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch stats" });
    }
});

router.get("/student-stats", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const [user, applications, activeJobs] = await Promise.all([
            User.findById(userId).select("-password"),
            Application.find({ studentId: userId }).populate("jobId"),
            Job.countDocuments({ status: "active" })
        ]);
        if (!user) return res.status(404).json({ message: "User not found" });

        const profileFields = ["name", "email", "phone", "department", "registerNumber", "batch", "cgpa"];
        const filled = profileFields.filter(f => user[f] && String(user[f]).trim() !== "" && user[f] !== 0).length;
        const profileCompletion = Math.round((filled / profileFields.length) * 100);
        const isEligible = user.cgpa >= 6.0 && user.backlogs === 0;

        const statusCounts = { pending: 0, shortlisted: 0, accepted: 0, rejected: 0 };
        applications.forEach(a => { if (statusCounts[a.status] !== undefined) statusCounts[a.status]++; });

        res.json({
            profile: user,
            profileCompletion,
            isEligible,
            eligibilityReason: !isEligible ? (user.cgpa < 6.0 ? "CGPA below 6.0" : "Active backlogs") : "Eligible",
            totalApplications: applications.length,
            statusCounts,
            activeJobs,
            hasResume: !!user.resumeUrl
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch student stats" });
    }
});

router.get("/admin/analytics", requireAdmin, async (req, res) => {
    try {
        const students = await User.find({ role: "student" }).select("department placementStatus cgpa batch");

        const deptMap = {};
        students.forEach(s => {
            const dept = s.department || "Unknown";
            if (!deptMap[dept]) deptMap[dept] = { total: 0, placed: 0 };
            deptMap[dept].total++;
            if (s.placementStatus === "placed") deptMap[dept].placed++;
        });

        const departmentWise = Object.entries(deptMap).map(([dept, data]) => ({
            department: dept,
            total: data.total,
            placed: data.placed,
            percentage: data.total > 0 ? Math.round((data.placed / data.total) * 100) : 0
        }));

        const placements = await Placement.find().sort({ yearOrder: 1 });
        const yearWise = placements.filter(p => p.yearOrder >= 2017).map(p => ({
            batch: p.batch,
            totalStudents: p.totalStudents,
            eligible: p.eligibleStudents,
            placed: p.placementsOffered,
            percentage: p.percentage,
            companies: p.companiesVisited,
            highestCTC: p.highestCTC,
            avgCTC: p.avgCTC
        }));

        const cgpaDistribution = [
            { range: "< 6.0", count: students.filter(s => s.cgpa > 0 && s.cgpa < 6).length },
            { range: "6.0 - 7.0", count: students.filter(s => s.cgpa >= 6 && s.cgpa < 7).length },
            { range: "7.0 - 8.0", count: students.filter(s => s.cgpa >= 7 && s.cgpa < 8).length },
            { range: "8.0 - 9.0", count: students.filter(s => s.cgpa >= 8 && s.cgpa < 9).length },
            { range: "9.0 - 10.0", count: students.filter(s => s.cgpa >= 9).length }
        ];

        res.json({ departmentWise, yearWise, cgpaDistribution });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch analytics" });
    }
});

module.exports = router;
