const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const verifyToken = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");

router.get("/notifications", verifyToken, async (req, res) => {
    try {
        const userRole = req.user.role;
        const notifications = await Notification.find({
            targetRole: { $in: [userRole, "all"] }
        })
            .populate("createdBy", "name")
            .sort({ createdAt: -1 })
            .limit(50);

        const withReadStatus = notifications.map(n => ({
            ...n.toObject(),
            isRead: n.readBy.some(id => id.toString() === req.user.id)
        }));

        res.json(withReadStatus);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch notifications" });
    }
});

router.get("/notifications/unread-count", verifyToken, async (req, res) => {
    try {
        const userRole = req.user.role;
        const count = await Notification.countDocuments({
            targetRole: { $in: [userRole, "all"] },
            readBy: { $ne: req.user.id }
        });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch unread count" });
    }
});

router.post("/notifications", requireAdmin, async (req, res) => {
    try {
        const notification = new Notification({
            ...req.body,
            createdBy: req.user.id
        });
        await notification.save();
        res.status(201).json(notification);
    } catch (error) {
        res.status(400).json({ message: "Failed to create notification", error: error.message });
    }
});

router.patch("/notifications/read-all", verifyToken, async (req, res) => {
    try {
        const userRole = req.user.role;
        await Notification.updateMany(
            {
                targetRole: { $in: [userRole, "all"] },
                readBy: { $ne: req.user.id }
            },
            { $addToSet: { readBy: req.user.id } }
        );
        res.json({ message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ message: "Failed to mark all as read" });
    }
});

router.patch("/notifications/:id/read", verifyToken, async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { readBy: req.user.id } },
            { new: true }
        );
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }
        res.json({ message: "Marked as read" });
    } catch (error) {
        res.status(500).json({ message: "Failed to mark as read" });
    }
});

router.delete("/notifications/:id", requireAdmin, async (req, res) => {
    try {
        const deleted = await Notification.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: "Notification not found" });
        }
        res.json({ message: "Notification deleted" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete notification" });
    }
});

module.exports = router;
