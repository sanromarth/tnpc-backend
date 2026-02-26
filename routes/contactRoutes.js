const express = require("express");
const router = express.Router();
const { sendContactEmail } = require("../utils/contact");

// POST /api/contact — Send a contact form message
router.post("/contact", async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "Name, email, subject, and message are required."
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address."
            });
        }

        const result = await sendContactEmail({ name, email, phone, subject, message });

        if (result.success) {
            res.json({ success: true, message: "Message sent successfully! We'll respond within 24 hours." });
        } else {
            console.error("[CONTACT] Failed to send:", result.error);
            res.status(500).json({ success: false, message: "Failed to send message. Please try again later." });
        }
    } catch (error) {
        console.error("[CONTACT] Error:", error.message);
        res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
});

module.exports = router;
