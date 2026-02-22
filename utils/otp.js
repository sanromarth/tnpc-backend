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

async function sendViaBrevoAPI(email, subject, htmlContent, senderEmail, senderName) {
    const apiKey = process.env.BREVO_API_KEY || process.env.EMAIL_PASS;
    if (!apiKey) {
        return { success: false, error: "No Brevo API key found" };
    }

    console.log("[EMAIL] Using Brevo HTTP API...");

    const payload = {
        sender: { name: senderName, email: senderEmail },
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
            console.log(`[EMAIL] ✅ Brevo API sent! MessageId: ${data.messageId}`);
            return { success: true, method: "brevo-api" };
        } else {
            console.error("[EMAIL] ❌ Brevo API error:", response.status, data.message || JSON.stringify(data));
            return { success: false, error: data.message || `Brevo API ${response.status}` };
        }
    } catch (error) {
        console.error("[EMAIL] ❌ Brevo API fetch error:", error.message);
        return { success: false, error: error.message };
    }
}

async function sendViaBrevoSMTP(email, subject, htmlContent, senderEmail, senderName) {
    const host = process.env.EMAIL_HOST;
    const port = parseInt(process.env.EMAIL_PORT || "587");
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!host || !user || !pass) {
        return { success: false, error: "Brevo SMTP credentials not configured" };
    }

    console.log(`[EMAIL] Using Brevo SMTP (${host}:${port})...`);

    const transporter = nodemailer.createTransport({
        host: host,
        port: port,
        secure: port === 465,
        auth: { user, pass },
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 30000
    });

    try {
        const info = await transporter.sendMail({
            from: `"${senderName}" <${senderEmail}>`,
            to: email,
            subject: subject,
            html: htmlContent
        });
        console.log(`[EMAIL] ✅ Brevo SMTP sent! MessageId: ${info.messageId}`);
        return { success: true, method: "brevo-smtp" };
    } catch (error) {
        console.error("[EMAIL] ❌ Brevo SMTP error:", error.code, error.message);
        return { success: false, error: error.message };
    }
}

async function sendViaGmailSMTP(email, subject, htmlContent, senderEmail, senderName) {
    const smtpEmail = process.env.SMTP_EMAIL;
    const smtpPass = process.env.SMTP_PASSWORD;

    if (!smtpEmail || !smtpPass) {
        return { success: false, error: "Gmail SMTP credentials not configured" };
    }

    console.log("[EMAIL] Using Gmail SMTP (fallback)...");

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: smtpEmail, pass: smtpPass },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 15000
    });

    try {
        const info = await transporter.sendMail({
            from: `"${senderName}" <${smtpEmail}>`,
            to: email,
            subject: subject,
            html: htmlContent
        });
        console.log(`[EMAIL] ✅ Gmail SMTP sent! MessageId: ${info.messageId}`);
        return { success: true, method: "gmail-smtp" };
    } catch (error) {
        console.error("[EMAIL] ❌ Gmail SMTP error:", error.code, error.message);
        return { success: false, error: error.message };
    }
}

async function sendOTPEmail(email, otp, purpose = "verification") {
    console.log(`[EMAIL] === Sending ${purpose} OTP to: ${email} ===`);

    const subjects = {
        verification: "Verify Your Email — TNPC Portal",
        reset: "Reset Your Password — TNPC Portal"
    };

    const subject = subjects[purpose] || subjects.verification;
    const htmlContent = getEmailHTML(otp, purpose);
    const senderEmail = process.env.SMTP_EMAIL || "sgcsrc.tnpc@gmail.com";
    const senderName = "SGCSRC TNPC Portal";

    const methods = [
        () => sendViaBrevoAPI(email, subject, htmlContent, senderEmail, senderName),
        () => sendViaBrevoSMTP(email, subject, htmlContent, senderEmail, senderName),
        () => sendViaGmailSMTP(email, subject, htmlContent, senderEmail, senderName)
    ];

    for (const method of methods) {
        const result = await method();
        if (result.success) {
            console.log(`[EMAIL] ✅ SUCCESS via ${result.method}`);
            return { success: true };
        }
        console.log(`[EMAIL] Method failed, trying next...`);
    }

    console.error("[EMAIL] ❌ ALL methods failed!");
    return { success: false, error: "All email methods failed" };
}

async function verifyTransporter() {
    const brevoKey = process.env.BREVO_API_KEY || process.env.EMAIL_PASS;
    if (brevoKey) {
        console.log("[EMAIL] Brevo key found - will use HTTP API");
        return { success: true, method: "brevo-api" };
    }
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER) {
        console.log("[EMAIL] Brevo SMTP credentials found");
        return { success: true, method: "brevo-smtp" };
    }
    if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
        console.log("[EMAIL] Gmail SMTP credentials found (may be blocked on cloud)");
        return { success: true, method: "gmail-smtp" };
    }
    return { success: false, error: "No email credentials configured" };
}

module.exports = { generateOTP, sendOTPEmail, verifyTransporter };
