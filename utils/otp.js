const nodemailer = require("nodemailer");

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function getEmailHTML(otp, purpose) {
    if (purpose === "reset") {
        return `<div style="font-family:'Inter',Arial,sans-serif;max-width:480px;margin:0 auto;background:#0B1D3A;border-radius:16px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#C62828,#0B1D3A);padding:32px 24px;text-align:center;">
                <h1 style="color:#FBC02D;font-size:22px;margin:0 0 4px;">Sri GCSR College</h1>
                <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0;">Training & Placement Cell</p>
            </div>
            <div style="padding:32px 24px;text-align:center;">
                <h2 style="color:#fff;font-size:20px;margin:0 0 12px;">Password Reset Request</h2>
                <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;margin:0 0 24px;">Use the code below to reset your password. This code expires in <strong style="color:#FBC02D;">10 minutes</strong>.</p>
                <div style="background:rgba(255,255,255,0.06);border:2px dashed rgba(198,40,40,0.5);border-radius:12px;padding:20px;margin:0 0 24px;">
                    <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:#ef5350;">${otp}</span>
                </div>
                <p style="color:rgba(255,255,255,0.4);font-size:12px;margin:0;">If you didn't request this, your account is safe — just ignore this email.</p>
            </div>
            <div style="background:rgba(255,255,255,0.03);padding:16px 24px;text-align:center;">
                <p style="color:rgba(255,255,255,0.3);font-size:11px;margin:0;">&copy; 2026 Sri GCSR College TNPC Portal</p>
            </div>
        </div>`;
    }
    return `<div style="font-family:'Inter',Arial,sans-serif;max-width:480px;margin:0 auto;background:#0B1D3A;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#1e4f9a,#0B1D3A);padding:32px 24px;text-align:center;">
            <h1 style="color:#FBC02D;font-size:22px;margin:0 0 4px;">Sri GCSR College</h1>
            <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0;">Training & Placement Cell</p>
        </div>
        <div style="padding:32px 24px;text-align:center;">
            <h2 style="color:#fff;font-size:20px;margin:0 0 12px;">Verify Your Email</h2>
            <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;margin:0 0 24px;">Use the code below to complete your registration. This code expires in <strong style="color:#FBC02D;">10 minutes</strong>.</p>
            <div style="background:rgba(255,255,255,0.06);border:2px dashed rgba(251,192,45,0.4);border-radius:12px;padding:20px;margin:0 0 24px;">
                <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:#FBC02D;">${otp}</span>
            </div>
            <p style="color:rgba(255,255,255,0.4);font-size:12px;margin:0;">If you didn't request this, please ignore this email.</p>
        </div>
        <div style="background:rgba(255,255,255,0.03);padding:16px 24px;text-align:center;">
            <p style="color:rgba(255,255,255,0.3);font-size:11px;margin:0;">&copy; 2026 Sri GCSR College TNPC Portal</p>
        </div>
    </div>`;
}

async function sendViaBrevo(email, subject, htmlContent, senderEmail) {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
        console.error("[EMAIL] BREVO_API_KEY is not set!");
        return { success: false, error: "BREVO_API_KEY not configured" };
    }

    const payload = {
        sender: { name: "SGCSRC TNPC Portal", email: senderEmail },
        to: [{ email: email }],
        subject: subject,
        htmlContent: htmlContent
    };

    try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": apiKey,
                "content-type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            console.log(`[EMAIL] ✅ Brevo email sent! MessageId: ${data.messageId}`);
            return { success: true };
        } else {
            console.error("[EMAIL] ❌ Brevo API error:", data.message || JSON.stringify(data));
            return { success: false, error: data.message || "Brevo API error" };
        }
    } catch (error) {
        console.error("[EMAIL] ❌ Brevo fetch error:", error.message);
        return { success: false, error: error.message };
    }
}

async function sendViaNodemailer(email, subject, htmlContent, senderEmail) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        },
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 30000
    });

    const mailOptions = {
        from: `"SGCSRC TNPC Portal" <${senderEmail}>`,
        to: email,
        subject: subject,
        html: htmlContent
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL] ✅ Nodemailer sent! MessageId: ${info.messageId}`);
        return { success: true };
    } catch (error) {
        console.error("[EMAIL] ❌ Nodemailer error:", error.code, error.message);
        return { success: false, error: error.message };
    }
}

async function sendOTPEmail(email, otp, purpose = "verification") {
    console.log(`[EMAIL] Sending ${purpose} OTP to: ${email}`);

    const subjects = {
        verification: "Verify Your Email — TNPC Portal",
        reset: "Reset Your Password — TNPC Portal"
    };

    const subject = subjects[purpose] || subjects.verification;
    const htmlContent = getEmailHTML(otp, purpose);
    const senderEmail = process.env.SMTP_EMAIL || "sgcsrc.tnpc@gmail.com";

    if (process.env.BREVO_API_KEY) {
        console.log("[EMAIL] Using Brevo HTTP API");
        return await sendViaBrevo(email, subject, htmlContent, senderEmail);
    }

    console.log("[EMAIL] Using Nodemailer SMTP (fallback)");
    return await sendViaNodemailer(email, subject, htmlContent, senderEmail);
}

async function verifyTransporter() {
    if (process.env.BREVO_API_KEY) {
        console.log("[EMAIL] Brevo API key is configured - using HTTP API (no SMTP needed)");
        return { success: true, method: "brevo" };
    }
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.SMTP_EMAIL, pass: process.env.SMTP_PASSWORD },
            connectionTimeout: 10000
        });
        await transporter.verify();
        console.log("[EMAIL] ✅ SMTP verified");
        return { success: true, method: "smtp" };
    } catch (error) {
        console.error("[EMAIL] ❌ SMTP verify failed:", error.code, error.message);
        return { success: false, error: error.message, code: error.code };
    }
}

module.exports = { generateOTP, sendOTPEmail, verifyTransporter };
