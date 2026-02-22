const nodemailer = require("nodemailer");

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function createTransporter() {
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000
    });
}

async function sendOTPEmail(email, otp, purpose = "verification") {
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
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error("Email send error:", error.message);
        return { success: false, error: error.message };
    }
}

module.exports = { generateOTP, sendOTPEmail };
