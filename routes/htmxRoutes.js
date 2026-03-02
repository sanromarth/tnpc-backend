const express = require("express");
const router = express.Router();
const Certification = require("../models/certification");
const { sendContactEmail } = require("../utils/contact");

// ── Helper: format date for HTML output
function formatDate(dateStr) {
    if (!dateStr) return "—";
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
    } catch { return dateStr; }
}

function statusBadge(status) {
    if (!status) return '<span class="status-badge status-pending">—</span>';
    const lower = status.toLowerCase();
    if (lower === "completed") return '<span class="status-badge status-completed">✓ Completed</span>';
    if (lower === "in-progress") return '<span class="status-badge status-in-progress">⏳ In Progress</span>';
    return `<span class="status-badge status-pending">${status}</span>`;
}

// ─────────────────────────────────────────────────────
// GET /api/certifications/ibm-html
// Returns pre-rendered <tr> rows for htmx to swap into
// the IBM certifications table body.
// ─────────────────────────────────────────────────────
router.get("/certifications/ibm-html", async (req, res) => {
    try {
        const data = await Certification.find({ program: "IBM Certifications", year: 2026 }).lean();

        if (!data || data.length === 0) {
            return res.send(`
                <tr><td colspan="5" style="text-align:center;color:#6b7280;padding:40px 20px;font-size:15px;">
                    No certification records found.
                </td></tr>
            `);
        }

        const rows = data.map((s, i) => `
            <tr>
                <td>${i + 1}</td>
                <td style="text-align:left;font-weight:500;">${s.studentName || "—"}</td>
                <td>${s.course || "—"}</td>
                <td>${formatDate(s.completionDate)}</td>
                <td>${statusBadge(s.status)}</td>
            </tr>
        `).join("");

        // Also embed the count in a small script that updates the badge
        const countScript = `<script>
            var b = document.getElementById('certCount');
            if (b) b.textContent = '${data.length} Students';
        </script>`;

        res.send(rows + countScript);
    } catch (error) {
        console.error("[HTMX] IBM certs error:", error.message);
        res.send(`
            <tr><td colspan="5">
                <div class="cert-error">⚠️ Failed to load certification data.<br>
                <small style="color:#999;">${error.message}</small></div>
            </td></tr>
        `);
    }
});

// ─────────────────────────────────────────────────────
// POST /api/contact-html
// Processes the contact form and returns an HTML
// fragment (success or error) for htmx to swap in.
// ─────────────────────────────────────────────────────
router.post("/contact-html", async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(422).send(`
                <div class="contact-form-card" style="text-align:center;padding:30px;">
                    <p style="color:#C62828;font-weight:600;">⚠️ Please fill in all required fields.</p>
                    <button class="btn-red" onclick="window.location.reload()">Try Again</button>
                </div>
            `);
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(422).send(`
                <div class="contact-form-card" style="text-align:center;padding:30px;">
                    <p style="color:#C62828;font-weight:600;">⚠️ Please provide a valid email address.</p>
                    <button class="btn-red" onclick="window.location.reload()">Try Again</button>
                </div>
            `);
        }

        const result = await sendContactEmail({ name, email, phone, subject, message });

        if (result.success) {
            res.send(`
                <div class="contact-form-card" style="text-align:center;padding:48px 24px;">
                    <div style="font-size:56px;margin-bottom:16px;">✅</div>
                    <h2 style="margin-bottom:8px;">Message Sent!</h2>
                    <p style="color:#6b7280;">Thank you, <strong>${name}</strong>. We'll respond within 24 hours.</p>
                    <button class="btn-red" style="margin-top:20px;" onclick="window.location.reload()">Send Another</button>
                </div>
            `);
        } else {
            console.error("[HTMX CONTACT] Failed:", result.error);
            res.status(500).send(`
                <div class="contact-form-card" style="text-align:center;padding:30px;">
                    <p style="color:#C62828;font-weight:600;">❌ Failed to send message. Please try again later.</p>
                    <button class="btn-red" onclick="window.location.reload()">Try Again</button>
                </div>
            `);
        }
    } catch (error) {
        console.error("[HTMX CONTACT] Error:", error.message);
        res.status(500).send(`
            <div class="contact-form-card" style="text-align:center;padding:30px;">
                <p style="color:#C62828;font-weight:600;">❌ Server error. Please try again.</p>
                <button class="btn-red" onclick="window.location.reload()">Try Again</button>
            </div>
        `);
    }
});

module.exports = router;
