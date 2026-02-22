const nodemailer = require("nodemailer");

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function createTransporter() {
    const smtpEmail = process.env.SMTP_EMAIL;
    const smtpPass = process.env.SMTP_PASSWORD;

    console.log("[SMTP] Creating transporter with email:", smtpEmail ? smtpEmail : "MISSING!");
    console.log("[SMTP] Password present:", smtpPass ? `Yes (${smtpPass.length} chars)` : "MISSING!");

    if (!smtpEmail || !smtpPass) {
        console.error("[SMTP] CRITICAL: Missing SMTP_EMAIL or SMTP_PASSWORD in environment variables!");
    }

    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: smtpEmail,
            pass: smtpPass
        },
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 30000
    });
}

async function verifyTransporter() {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log("[SMTP] ✅ Transporter verified - SMTP connection is working!");
        return { success: true };
    } catch (error) {
        console.error("[SMTP] ❌ Transporter verification FAILED:", error.code, error.message);
        return { success: false, error: error.message, code: error.code };
    }
}

async function sendOTPEmail(email, otp, purpose = "verification") {
    console.log(`[SMTP] Attempting to send ${purpose} OTP to: ${email}`);
    const transporter = createTransporter();

    const subjects = {
        verification: "Verify Your Email — TNPC Portal",
        reset: "Reset Your Password — TNPC Portal"
    };

    const bodies = {
        verification: `
            <div style="font-family:'Inter',Arial,sans-serif;max-width:480px;margin:0 auto;background:#0B1D3A;border-radius:16px;overflow:hidden;">
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
                    <p style="color:rgba(255,255,255,0.3);font-size:11px;margin:0;">© 2026 Sri GCSR College TNPC Portal</p>
                </div>
            </div>`,
        reset: `
            <div style="font-family:'Inter',Arial,sans-serif;max-width:480px;margin:0 auto;background:#0B1D3A;border-radius:16px;overflow:hidden;">
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
                    <p style="color:rgba(255,255,255,0.3);font-size:11px;margin:0;">© 2026 Sri GCSR College TNPC Portal</p>
                </div>
            </div>`
    };

    const mailOptions = {
        from: `"SGCSRC TNPC Portal" <${process.env.SMTP_EMAIL}>`,
        to: email,
        subject: subjects[purpose] || subjects.verification,
        html: bodies[purpose] || bodies.verification
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[SMTP] ✅ Email sent successfully! MessageId: ${info.messageId}`);
        return { success: true };
    } catch (error) {
        console.error("[SMTP] ❌ Email send FAILED!");
        console.error("[SMTP] Error code:", error.code);
        console.error("[SMTP] Error message:", error.message);
        console.error("[SMTP] Error response:", error.response);
        console.error("[SMTP] Full error:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
        return { success: false, error: error.message };
    }
}

module.exports = { generateOTP, sendOTPEmail, verifyTransporter };
